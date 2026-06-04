import { prisma } from '../../lib/prisma';

export const teamRepository = {
  async findAllByTournament(tournamentId?: string) {
    return prisma.team.findMany({
      where: tournamentId ? { tournamentId } : {},
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        code: true,
      },
    });
  },
};
