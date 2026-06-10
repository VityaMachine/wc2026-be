import { prisma } from "../../lib/prisma";

export const predictionsRepository = {
  findByUserAndMatch(userId: string, matchId: string) {
    return prisma.prediction.findUnique({
      where: {
        userId_matchId: {
          userId,
          matchId,
        },
      },
    });
  },

  findMatchById(matchId: string) {
    return prisma.match.findUnique({
      where: { id: matchId },
    });
  },

  findTournamentParticipant(userId: string, tournamentId: string) {
    return prisma.tournamentParticipant.findUnique({
      where: {
        userId_tournamentId: {
          userId,
          tournamentId,
        },
      },
    });
  },

  createPrediction(data: {
    userId: string;
    matchId: string;
    tournamentId: string;
    homeScore: number;
    awayScore: number;
  }) {
    return prisma.prediction.create({
      data,
    });
  },

  findUserPredictions(userId: string) {
    return prisma.prediction.findMany({
      where: { userId },
      include: {
        match: {
          include: {
            homeTeam: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            awayTeam: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
      orderBy: {
        match: {
          startsAt: "asc",
        },
      },
    });
  },

  findByMatchId(matchId: string) {
    return prisma.prediction.findMany({
      where: { matchId },
    });
  },

  findDisplayByMatchId(matchId: string) {
    return prisma.prediction.findMany({
      where: { matchId },
      select: {
        id: true,
        matchId: true,
        userId: true,
        homeScore: true,
        awayScore: true,
        points: true,
        isExactScore: true,
        isDrawGuessed: true,
        isGoalDifferenceGuessed: true,
        isWinnerGuessed: true,
        isTotalGoalsGuessed: true,
        calculatedAt: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  },

  countByUserId(userId: string) {
    return prisma.prediction.count({
      where: { userId },
    });
  },

  countCalculatedByUserId(userId: string) {
    return prisma.prediction.count({
      where: {
        userId,
        points: {
          not: null,
        },
      },
    });
  },

  sumPointsByUserId(userId: string) {
    return prisma.prediction.aggregate({
      where: { userId },
      _sum: {
        points: true,
      },
    });
  },

  updatePredictionPoints(
    predictionId: string,
    points: number,
    calculatedAt: Date,
    metrics: {
      isExactScore: boolean;
      isDrawGuessed: boolean;
      isGoalDifferenceGuessed: boolean;
      isWinnerGuessed: boolean;
      isTotalGoalsGuessed: boolean;
    },
  ) {
    return prisma.prediction.update({
      where: { id: predictionId },
      data: {
        points,
        calculatedAt,
        ...metrics,
      },
    });
  },
};
