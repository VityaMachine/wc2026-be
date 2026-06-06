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

  async findDetailsById(id: string) {
    return prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: {
          select: {
            id: true,
            externalId: true,
            name: true,
            logoUrl: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            externalId: true,
            name: true,
            logoUrl: true,
          },
        },
      },
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
