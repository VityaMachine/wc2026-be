import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { MatchListFilters, MatchListOptions } from "./match.types";

export const matchRepository = {
  async findAll({ filters, page, limit }: MatchListOptions) {
    const where = this.buildListWhere(filters);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.match.findMany({
        where,
        orderBy: { startsAt: "asc" },
        skip,
        take: limit,
        include: {
          homeTeam: {
            select: { id: true, name: true, code: true, groupName: true },
          },
          awayTeam: {
            select: { id: true, name: true, code: true, groupName: true },
          },
        },
      }),
      prisma.match.count({ where }),
    ]);

    return { items, total };
  },

  buildListWhere(filters: MatchListFilters): Prisma.MatchWhereInput {
    return {
      ...(filters.tournamentId ? { tournamentId: filters.tournamentId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.stage ? { stage: filters.stage } : {}),
      ...(filters.groupName
        ? {
            OR: [
              { homeTeam: { is: { groupName: filters.groupName } } },
              { awayTeam: { is: { groupName: filters.groupName } } },
            ],
          }
        : {}),
    };
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
