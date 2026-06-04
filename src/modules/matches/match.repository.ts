import { prisma } from "../../lib/prisma";

export const matchRepository = {
  async findAll(tournamentId?: string) {
    return prisma.match.findMany({
      where: tournamentId ? { tournamentId } : {},
      orderBy: { startsAt: "asc" },
      include: {
        homeTeam: { select: { id: true, name: true, code: true } },
        awayTeam: { select: { id: true, name: true, code: true } },
      },
    });
  },

  async findById(id: string) {
    return prisma.match.findUnique({
      where: { id },
    });
  },

  async updateResult(id: string, homeScore: number, awayScore: number) {
    return prisma.match.update({
      where: { id },
      data: {
        homeScore,
        awayScore,
        status: "FINISHED",
      },
    });
  },
};
