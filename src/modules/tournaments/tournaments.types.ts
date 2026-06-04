export type ParticipationType = 'FREE' | 'PAID';

export interface JoinTournamentRequest {
  participationType: ParticipationType;
}

export interface TournamentParticipantResponse {
  id: string;
  userId: string;
  tournamentId: string;
  participationType: ParticipationType;
  joinedAt: string;
  updatedAt: string;
}
