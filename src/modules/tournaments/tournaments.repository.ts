import { prisma } from '../../lib/prisma';

export const tournamentsRepository = {
  async findAll() {
    return prisma.tournament.findMany({
      orderBy: { startsAt: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        startsAt: true,
        endsAt: true,
        isPrizePoolEnabled: true,
      },
    });
  },
  async findBySlug(slug: string) {
    return prisma.tournament.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        startsAt: true,
        endsAt: true,
        prizePoolEntryDeadline: true,
        entryFee: true,
        currency: true,
        isPrizePoolEnabled: true,
      },
    });
  },
};
