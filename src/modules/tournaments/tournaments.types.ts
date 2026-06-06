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
