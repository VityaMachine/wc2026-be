import { prisma } from "../../lib/prisma";
import { MatchStage, MatchStatus, Prisma } from "@prisma/client";

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

  async findById(id: string) {
    return prisma.tournament.findUnique({
      where: { id },
      select: { id: true },
    });
  },

  async findTeamsForStandings(tournamentId: string) {
    return prisma.team.findMany({
      where: {
        tournamentId,
        groupName: {
          not: null,
        },
      },
      select: {
        id: true,
        externalId: true,
        name: true,
        code: true,
        logoUrl: true,
        groupName: true,
      },
      orderBy: [{ groupName: "asc" }, { name: "asc" }],
    });
  },

  async findFinishedGroupMatches(tournamentId: string) {
    return prisma.match.findMany({
      where: {
        tournamentId,
        stage: MatchStage.GROUP,
        status: MatchStatus.FINISHED,
        homeScore: {
          not: null,
        },
        awayScore: {
          not: null,
        },
      },
      select: {
        homeTeamId: true,
        awayTeamId: true,
        homeScore: true,
        awayScore: true,
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

  async findPayment(userId: string, tournamentId: string) {
    return prisma.payment.findUnique({
      where: {
        userId_tournamentId: {
          userId,
          tournamentId,
        },
      },
      select: {
        id: true,
        status: true,
      },
    });
  },

  async confirmPaidParticipantPayment(data: {
    participantId: string;
    userId: string;
    tournamentId: string;
    paymentId?: string;
    amount: number;
    paidAt: Date;
    currency: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const participant = await tx.tournamentParticipant.update({
        where: { id: data.participantId },
        data: {
          paymentStatus: "PAID",
          prizeEligible: true,
          paidAt: data.paidAt,
        },
      });

      const paymentData = {
        amount: new Prisma.Decimal(data.amount),
        currency: data.currency,
        provider: "MONOBANK" as const,
        status: "PAID" as const,
        paidAt: data.paidAt,
      };

      if (data.paymentId) {
        await tx.payment.update({
          where: { id: data.paymentId },
          data: paymentData,
        });
      } else {
        await tx.payment.create({
          data: {
            userId: data.userId,
            tournamentId: data.tournamentId,
            ...paymentData,
          },
        });
      }

      return participant;
    });
  },

  async findPrizePoolByTournamentId(tournamentId: string) {
    return prisma.payment.findMany({
      where: {
        tournamentId,
        status: "PAID",
      },
      select: {
        userId: true,
        amount: true,
        paidAt: true,
        createdAt: true,
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
      orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
    });
  },
};
