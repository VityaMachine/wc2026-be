import { tournamentsRepository } from "./tournaments.repository";
import {
  JoinTournamentRequest,
  TournamentParticipantResponse,
} from "./tournaments.types";

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
}

export const tournamentsService = new TournamentsService();
