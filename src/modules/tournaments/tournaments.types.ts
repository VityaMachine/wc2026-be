export type ParticipationType = "FREE" | "PAID";
export type PaymentStatus = "UNPAID" | "PENDING" | "PAID" | "FAILED" | "EXPIRED";

export interface JoinTournamentRequest {
  participationType: ParticipationType;
}

export interface UpdateParticipantPaymentRequest {
  email: string;
  paymentStatus: PaymentStatus;
}

export interface TournamentParticipantResponse {
  id: string;
  userId: string;
  tournamentId: string;
  participationType: ParticipationType;
  joinedAt: string;
  updatedAt: string;
}

export type TournamentParticipationResponse =
  | { joined: false }
  | {
      joined: true;
      id: string;
      userId: string;
      tournamentId: string;
      participationType: ParticipationType;
      paymentStatus: PaymentStatus;
      paidAt: string | null;
      prizeEligible: boolean;
      joinedAt: string;
      updatedAt: string;
    };

export interface UpdateParticipantPaymentResponse {
  id: string;
  userId: string;
  tournamentId: string;
  participationType: ParticipationType;
  paymentStatus: PaymentStatus;
  paidAt: string | null;
  prizeEligible: boolean;
  joinedAt: string;
  updatedAt: string;
}

export interface TournamentStandingTeam {
  id: string;
  externalId: number | null;
  name: string;
  code: string | null;
  logoUrl: string | null;
}

export interface TournamentStandingEntry {
  position: number;
  team: TournamentStandingTeam;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface TournamentStandingsGroup {
  groupName: string;
  teams: TournamentStandingEntry[];
}

export interface TournamentThirdPlaceEntry extends TournamentStandingEntry {
  sourceGroupName: string;
  isQualified: boolean;
}

export interface TournamentStandingsResponse {
  tournamentId: string;
  groups: TournamentStandingsGroup[];
  thirdPlaceRanking: TournamentThirdPlaceEntry[];
}
