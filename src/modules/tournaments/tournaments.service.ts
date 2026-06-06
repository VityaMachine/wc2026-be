import { HttpError } from "../../lib/http-error";
import { tournamentsRepository } from "./tournaments.repository";
import {
  JoinTournamentRequest,
  PaymentStatus,
  TournamentParticipationResponse,
  TournamentParticipantResponse,
  TournamentStandingEntry,
  TournamentStandingsResponse,
  TournamentStandingsGroup,
  TournamentThirdPlaceEntry,
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

  async getStandings(
    tournamentId: string,
  ): Promise<TournamentStandingsResponse> {
    const tournament = await tournamentsRepository.findById(tournamentId);
    if (!tournament) {
      throw new HttpError(404, "Tournament not found");
    }

    const teams = await tournamentsRepository.findTeamsForStandings(
      tournamentId,
    );
    const matches = await tournamentsRepository.findFinishedGroupMatches(
      tournamentId,
    );

    const entriesByTeamId = new Map<string, TournamentStandingEntry>();
    const entriesByGroupName = new Map<string, TournamentStandingEntry[]>();

    for (const team of teams) {
      if (!team.groupName) {
        continue;
      }

      const entry: TournamentStandingEntry = {
        position: 0,
        team: {
          id: team.id,
          externalId: team.externalId,
          name: team.name,
          code: team.code,
          logoUrl: team.logoUrl,
        },
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      };

      entriesByTeamId.set(team.id, entry);

      const groupEntries = entriesByGroupName.get(team.groupName) ?? [];
      groupEntries.push(entry);
      entriesByGroupName.set(team.groupName, groupEntries);
    }

    for (const match of matches) {
      if (
        !match.homeTeamId ||
        !match.awayTeamId ||
        match.homeScore === null ||
        match.awayScore === null
      ) {
        continue;
      }

      const homeEntry = entriesByTeamId.get(match.homeTeamId);
      const awayEntry = entriesByTeamId.get(match.awayTeamId);

      if (!homeEntry || !awayEntry) {
        continue;
      }

      this.applyMatchResult(
        homeEntry,
        awayEntry,
        match.homeScore,
        match.awayScore,
      );
    }

    const groups = [...entriesByGroupName.entries()]
      .sort(([groupA], [groupB]) => groupA.localeCompare(groupB))
      .map(([groupName, groupEntries]) => ({
        groupName,
        teams: this.rankGroupEntries(groupEntries),
      }));

    return {
      tournamentId,
      groups,
      thirdPlaceRanking: this.rankThirdPlaceEntries(groups),
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

  private applyMatchResult(
    homeEntry: TournamentStandingEntry,
    awayEntry: TournamentStandingEntry,
    homeScore: number,
    awayScore: number,
  ) {
    homeEntry.played += 1;
    awayEntry.played += 1;

    homeEntry.goalsFor += homeScore;
    homeEntry.goalsAgainst += awayScore;
    awayEntry.goalsFor += awayScore;
    awayEntry.goalsAgainst += homeScore;

    homeEntry.goalDifference =
      homeEntry.goalsFor - homeEntry.goalsAgainst;
    awayEntry.goalDifference =
      awayEntry.goalsFor - awayEntry.goalsAgainst;

    if (homeScore > awayScore) {
      homeEntry.wins += 1;
      homeEntry.points += 3;
      awayEntry.losses += 1;
      return;
    }

    if (homeScore < awayScore) {
      awayEntry.wins += 1;
      awayEntry.points += 3;
      homeEntry.losses += 1;
      return;
    }

    homeEntry.draws += 1;
    awayEntry.draws += 1;
    homeEntry.points += 1;
    awayEntry.points += 1;
  }

  private rankGroupEntries(
    entries: TournamentStandingEntry[],
  ): TournamentStandingEntry[] {
    return entries
      .sort((a, b) => this.compareStandingEntries(a, b))
      .map((entry, index) => ({
        ...entry,
        position: index + 1,
      }));
  }

  // TODO: FIFA tie-break rules are simplified for MVP.
  // Current implementation:
  // points -> goalDifference -> goalsFor -> team name.
  // Later we may need head-to-head and fair-play rules.
  private compareStandingEntries(
    a: TournamentStandingEntry,
    b: TournamentStandingEntry,
  ): number {
    if (b.points !== a.points) {
      return b.points - a.points;
    }

    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }

    if (b.goalsFor !== a.goalsFor) {
      return b.goalsFor - a.goalsFor;
    }

    return a.team.name.localeCompare(b.team.name);
  }

  private rankThirdPlaceEntries(
    groups: TournamentStandingsGroup[],
  ): TournamentThirdPlaceEntry[] {
    return groups
      .map((group) => {
        const thirdPlaceTeam = group.teams.find(
          (team) => team.position === 3,
        );

        return thirdPlaceTeam
          ? {
              ...thirdPlaceTeam,
              sourceGroupName: group.groupName,
              isQualified: false,
            }
          : null;
      })
      .filter(
        (entry): entry is TournamentThirdPlaceEntry => entry !== null,
      )
      .sort((a, b) => this.compareStandingEntries(a, b))
      .map((entry, index) => ({
        ...entry,
        position: index + 1,
        isQualified: index < 8,
      }));
  }
}

export const tournamentsService = new TournamentsService();
