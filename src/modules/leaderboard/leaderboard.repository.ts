import { prisma } from "../../lib/prisma";

const metricFields = [
  "isExactScore",
  "isDrawGuessed",
  "isGoalDifferenceGuessed",
  "isWinnerGuessed",
  "isTotalGoalsGuessed",
] as const;

type MetricField = (typeof metricFields)[number];

function buildDisplayName(user: {
  firstName: string | null;
  lastName: string | null;
}) {
  const displayName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return displayName || null;
}

async function getMetricCountMap(metricField: MetricField) {
  const groups = await prisma.prediction.groupBy({
    by: ["userId"],
    where: {
      [metricField]: true,
    },
    _count: {
      _all: true,
    },
  });

  return new Map(groups.map((group) => [group.userId, group._count._all]));
}

export const leaderboardRepository = {
  async getLeaderboardData() {
    const [
      totalGroups,
      calculatedGroups,
      exactScoreMap,
      drawGuessedMap,
      goalDifferenceGuessedMap,
      winnerGuessedMap,
      totalGoalsGuessedMap,
    ] = await Promise.all([
      prisma.prediction.groupBy({
        by: ["userId"],
        _count: {
          _all: true,
        },
        _sum: {
          points: true,
        },
      }),
      prisma.prediction.groupBy({
        by: ["userId"],
        where: {
          points: {
            not: null,
          },
        },
        _count: {
          _all: true,
        },
      }),
      getMetricCountMap("isExactScore"),
      getMetricCountMap("isDrawGuessed"),
      getMetricCountMap("isGoalDifferenceGuessed"),
      getMetricCountMap("isWinnerGuessed"),
      getMetricCountMap("isTotalGoalsGuessed"),
    ]);

    const userIds = totalGroups.map((group) => group.userId);
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
      },
    });

    const calculatedMap = new Map(
      calculatedGroups.map((group) => [group.userId, group._count._all]),
    );

    const userMap = new Map(users.map((user) => [user.id, user]));

    return totalGroups.map((group) => {
      const user = userMap.get(group.userId);

      return {
        userId: group.userId,
        username: user?.username ?? "",
        displayName: user ? buildDisplayName(user) : null,
        totalPoints: group._sum.points ? Number(group._sum.points) : 0,
        predictionsCount: group._count._all,
        calculatedPredictionsCount: calculatedMap.get(group.userId) ?? 0,
        exactScoreCount: exactScoreMap.get(group.userId) ?? 0,
        drawGuessedCount: drawGuessedMap.get(group.userId) ?? 0,
        goalDifferenceGuessedCount:
          goalDifferenceGuessedMap.get(group.userId) ?? 0,
        winnerGuessedCount: winnerGuessedMap.get(group.userId) ?? 0,
        totalGoalsGuessedCount: totalGoalsGuessedMap.get(group.userId) ?? 0,
      };
    });
  },

  async getPrizeLeaderboardData() {
    const paidParticipants = await prisma.tournamentParticipant.findMany({
      where: {
        type: "PAID",
        paymentStatus: "PAID",
        prizeEligible: true,
      },
      select: {
        userId: true,
        tournamentId: true,
      },
    });

    if (paidParticipants.length === 0) {
      return [];
    }

    const paidPairSet = new Set(
      paidParticipants.map(
        (participant) => `${participant.userId}:${participant.tournamentId}`,
      ),
    );
    const paidUserIds = [...new Set(paidParticipants.map((p) => p.userId))];

    const predictions = await prisma.prediction.findMany({
      where: {
        userId: {
          in: paidUserIds,
        },
      },
      select: {
        userId: true,
        points: true,
        isExactScore: true,
        isDrawGuessed: true,
        isGoalDifferenceGuessed: true,
        isWinnerGuessed: true,
        isTotalGoalsGuessed: true,
        match: {
          select: {
            tournamentId: true,
          },
        },
      },
    });

    const entryMap = new Map<
      string,
      {
        userId: string;
        totalPoints: number;
        predictionsCount: number;
        calculatedPredictionsCount: number;
        exactScoreCount: number;
        drawGuessedCount: number;
        goalDifferenceGuessedCount: number;
        winnerGuessedCount: number;
        totalGoalsGuessedCount: number;
      }
    >();

    for (const prediction of predictions) {
      const paidPairKey = `${prediction.userId}:${prediction.match.tournamentId}`;
      if (!paidPairSet.has(paidPairKey)) {
        continue;
      }

      const entry = entryMap.get(prediction.userId) ?? {
        userId: prediction.userId,
        totalPoints: 0,
        predictionsCount: 0,
        calculatedPredictionsCount: 0,
        exactScoreCount: 0,
        drawGuessedCount: 0,
        goalDifferenceGuessedCount: 0,
        winnerGuessedCount: 0,
        totalGoalsGuessedCount: 0,
      };

      entry.predictionsCount += 1;
      entry.exactScoreCount += prediction.isExactScore ? 1 : 0;
      entry.drawGuessedCount += prediction.isDrawGuessed ? 1 : 0;
      entry.goalDifferenceGuessedCount += prediction.isGoalDifferenceGuessed
        ? 1
        : 0;
      entry.winnerGuessedCount += prediction.isWinnerGuessed ? 1 : 0;
      entry.totalGoalsGuessedCount += prediction.isTotalGoalsGuessed ? 1 : 0;

      if (prediction.points !== null) {
        entry.totalPoints += Number(prediction.points);
        entry.calculatedPredictionsCount += 1;
      }

      entryMap.set(prediction.userId, entry);
    }

    const entries = [...entryMap.values()];
    const userIds = entries.map((entry) => entry.userId);
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
      },
    });

    const userMap = new Map(users.map((user) => [user.id, user]));

    return entries.map((entry) => {
      const user = userMap.get(entry.userId);

      return {
        userId: entry.userId,
        username: user?.username ?? "",
        displayName: user ? buildDisplayName(user) : null,
        totalPoints: entry.totalPoints,
        predictionsCount: entry.predictionsCount,
        calculatedPredictionsCount: entry.calculatedPredictionsCount,
        exactScoreCount: entry.exactScoreCount,
        drawGuessedCount: entry.drawGuessedCount,
        goalDifferenceGuessedCount: entry.goalDifferenceGuessedCount,
        winnerGuessedCount: entry.winnerGuessedCount,
        totalGoalsGuessedCount: entry.totalGoalsGuessedCount,
        participationType: "PAID" as const,
      };
    });
  },
};

