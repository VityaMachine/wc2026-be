import { prisma } from "../../lib/prisma";

export const tournamentsRepository = {
  async findAll() {
    return prisma.tournament.findMany({
      orderBy: { startsAt: "asc" },
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

  async findUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
      },
    });
  },

  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
      },
    });
  },

  async findParticipant(userId: string, tournamentId: string) {
    return prisma.tournamentParticipant.findUnique({
      where: {
        userId_tournamentId: {
          userId,
          tournamentId,
        },
      },
    });
  },

  async createParticipant(data: {
    userId: string;
    tournamentId: string;
    participationType: "FREE" | "PAID";
  }) {
    return prisma.tournamentParticipant.create({
      data: {
        userId: data.userId,
        tournamentId: data.tournamentId,
        type: data.participationType,
      },
    });
  },

  async updateParticipantPayment(data: {
    participantId: string;
    paymentStatus: "UNPAID" | "PENDING" | "PAID" | "FAILED" | "EXPIRED";
    prizeEligible: boolean;
    paidAt: Date | null;
  }) {
    return prisma.tournamentParticipant.update({
      where: { id: data.participantId },
      data: {
        paymentStatus: data.paymentStatus,
        prizeEligible: data.prizeEligible,
        paidAt: data.paidAt,
      },
    });
  },
};
