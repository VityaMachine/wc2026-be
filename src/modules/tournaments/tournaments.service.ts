import { tournamentsRepository } from "./tournaments.repository";
import {
  JoinTournamentRequest,
  PaymentStatus,
  TournamentParticipationResponse,
  TournamentParticipantResponse,
  UpdateParticipantPaymentRequest,
  UpdateParticipantPaymentResponse,
} from "./tournaments.types";

const PAYMENT_STATUSES: PaymentStatus[] = [
  "UNPAID",
  "PENDING",
  "PAID",
  "FAILED",
  "EXPIRED",
];

const PAYMENT_STATUS_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  UNPAID: ["PENDING", "PAID", "FAILED"],
  PENDING: ["PAID", "FAILED", "EXPIRED"],
  PAID: [],
  FAILED: ["PENDING", "PAID"],
  EXPIRED: ["PENDING", "PAID"],
};

export class TournamentsService {
  async list() {
    const tournaments = await tournamentsRepository.findAll();
    return tournaments.map((t) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      startsAt: t.startsAt,
      endsAt: t.endsAt,
      isPrizePoolEnabled: t.isPrizePoolEnabled,
    }));
  }

  async getBySlug(slug: string) {
    const t = await tournamentsRepository.findBySlug(slug);
    if (!t) {
      const err = new Error("Tournament not found");
      (err as any).status = 404;
      throw err;
    }

    return {
      id: t.id,
      slug: t.slug,
      name: t.name,
      startsAt: t.startsAt,
      endsAt: t.endsAt,
      prizePoolEntryDeadline: t.prizePoolEntryDeadline,
      entryFee: t.entryFee.toString(),
      currency: t.currency,
      isPrizePoolEnabled: t.isPrizePoolEnabled,
    };
  }

  async joinTournament(
    userId: string,
    slug: string,
    request: JoinTournamentRequest,
  ): Promise<TournamentParticipantResponse> {
    const participationType = request.participationType;
    if (participationType !== "FREE" && participationType !== "PAID") {
      throw { status: 400, message: "participationType must be FREE or PAID" };
    }

    const tournament = await tournamentsRepository.findBySlug(slug);
    if (!tournament) {
      throw { status: 404, message: "Tournament not found" };
    }

    const existingParticipant = await tournamentsRepository.findParticipant(
      userId,
      tournament.id,
    );

    if (existingParticipant) {
      throw {
        status: 409,
        message: "User has already joined this tournament",
      };
    }

    const participant = await tournamentsRepository.createParticipant({
      userId,
      tournamentId: tournament.id,
      participationType,
    });

    return {
      id: participant.id,
      userId: participant.userId,
      tournamentId: participant.tournamentId,
      participationType: participant.type,
      joinedAt: participant.joinedAt.toISOString(),
      updatedAt: participant.updatedAt.toISOString(),
    };
  }

  async getParticipation(
    userId: string,
    slug: string,
  ): Promise<TournamentParticipationResponse> {
    const tournament = await tournamentsRepository.findBySlug(slug);
    if (!tournament) {
      throw { status: 404, message: "Tournament not found" };
    }

    const participant = await tournamentsRepository.findParticipant(
      userId,
      tournament.id,
    );

    if (!participant) {
      return { joined: false };
    }

    return {
      joined: true,
      id: participant.id,
      userId: participant.userId,
      tournamentId: participant.tournamentId,
      participationType: participant.type,
      paymentStatus: participant.paymentStatus,
      paidAt: participant.paidAt?.toISOString() ?? null,
      prizeEligible: participant.prizeEligible,
      joinedAt: participant.joinedAt.toISOString(),
      updatedAt: participant.updatedAt.toISOString(),
    };
  }

  async updateParticipantPayment(
    adminUserId: string,
    slug: string,
    request: UpdateParticipantPaymentRequest,
  ): Promise<UpdateParticipantPaymentResponse> {
    const adminUser = await tournamentsRepository.findUserById(adminUserId);
    if (adminUser?.role !== "ADMIN") {
      throw { status: 403, message: "Forbidden" };
    }

    const email = request.email?.trim();
    if (!email) {
      throw { status: 400, message: "email is required" };
    }

    const paymentStatus = request.paymentStatus;
    if (!PAYMENT_STATUSES.includes(paymentStatus)) {
      throw {
        status: 400,
        message: "paymentStatus must be UNPAID, PENDING, PAID, FAILED, or EXPIRED",
      };
    }

    const tournament = await tournamentsRepository.findBySlug(slug);
    if (!tournament) {
      throw { status: 404, message: "Tournament not found" };
    }

    const user = await tournamentsRepository.findUserByEmail(email);
    if (!user) {
      throw { status: 404, message: "User not found" };
    }

    const participant = await tournamentsRepository.findParticipant(
      user.id,
      tournament.id,
    );

    if (!participant) {
      throw { status: 404, message: "Tournament participant not found" };
    }

    const currentPaymentStatus = participant.paymentStatus;
    const isSameStatus = currentPaymentStatus === paymentStatus;
    const isAllowedTransition =
      PAYMENT_STATUS_TRANSITIONS[currentPaymentStatus].includes(paymentStatus);

    if (!isSameStatus && !isAllowedTransition) {
      throw { status: 400, message: "Invalid payment status transition" };
    }

    const prizeEligible =
      participant.type === "PAID" && paymentStatus === "PAID";

    const updatedParticipant =
      await tournamentsRepository.updateParticipantPayment({
        participantId: participant.id,
        paymentStatus,
        prizeEligible,
        paidAt: prizeEligible ? new Date() : null,
      });

    return {
      id: updatedParticipant.id,
      userId: updatedParticipant.userId,
      tournamentId: updatedParticipant.tournamentId,
      participationType: updatedParticipant.type,
      paymentStatus: updatedParticipant.paymentStatus,
      paidAt: updatedParticipant.paidAt?.toISOString() ?? null,
      prizeEligible: updatedParticipant.prizeEligible,
      joinedAt: updatedParticipant.joinedAt.toISOString(),
      updatedAt: updatedParticipant.updatedAt.toISOString(),
    };
  }
}

export const tournamentsService = new TournamentsService();
