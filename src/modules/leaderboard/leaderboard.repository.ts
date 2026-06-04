import { prisma } from '../../lib/prisma';

export const leaderboardRepository = {
  async getLeaderboardData() {
    const totalGroups = await prisma.prediction.groupBy({
      by: ['userId'],
      _count: {
        _all: true,
      },
      _sum: {
        points: true,
      },
    });

    const calculatedGroups = await prisma.prediction.groupBy({
      by: ['userId'],
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
      username: userMap.get(group.userId) ?? '',
      totalPoints: group._sum.points ? Number(group._sum.points) : 0,
      predictionsCount: group._count._all,
      calculatedPredictionsCount: calculatedMap.get(group.userId) ?? 0,
    }));
  },
};
