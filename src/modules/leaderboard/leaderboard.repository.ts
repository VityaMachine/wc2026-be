import { prisma } from "../../lib/prisma";

export const leaderboardRepository = {
  async getLeaderboardData() {
    const totalGroups = await prisma.prediction.groupBy({
      by: ["userId"],
      _count: {
        _all: true,
      },
      _sum: {
        points: true,
      },
    });

    const calculatedGroups = await prisma.prediction.groupBy({
      by: ["userId"],
      where: {
        points: {
          not: null,
        },
      },
      _count: {
        _all: true,
      },
    });

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
      },
    });

    const calculatedMap = new Map(
      calculatedGroups.map((group) => [group.userId, group._count._all]),
    );

    const userMap = new Map(users.map((user) => [user.id, user.username]));

    return totalGroups.map((group) => ({
      userId: group.userId,
      username: userMap.get(group.userId) ?? "",
      totalPoints: group._sum.points ? Number(group._sum.points) : 0,
      predictionsCount: group._count._all,
      calculatedPredictionsCount: calculatedMap.get(group.userId) ?? 0,
    }));
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
      };

      entry.predictionsCount += 1;

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
      },
    });

    const userMap = new Map(users.map((user) => [user.id, user.username]));

    return entries.map((entry) => ({
      userId: entry.userId,
      username: userMap.get(entry.userId) ?? "",
      totalPoints: entry.totalPoints,
      predictionsCount: entry.predictionsCount,
      calculatedPredictionsCount: entry.calculatedPredictionsCount,
      participationType: "PAID" as const,
    }));
  },
};
