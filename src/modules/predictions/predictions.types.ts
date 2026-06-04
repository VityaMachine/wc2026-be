export interface CreatePredictionRequest {
  matchId: string;
  homeScore: number;
  awayScore: number;
}

export interface PredictionResponse {
  id: string;
  userId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
}

export interface TeamData {
  id: string;
  name: string;
  code: string | null;
}

export interface MatchData {
  id: string;
  kickoffAt: string;
  status: string;
  homeTeam: TeamData | null;
  awayTeam: TeamData | null;
}

export interface UserPredictionResponse {
  id: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  match: MatchData;
}

export interface PredictionStatsResponse {
  predictionsCount: number;
  calculatedPredictionsCount: number;
  totalPoints: number;
  averagePoints: number;
}

export interface MatchPredictionResponse {
  id: string;
  matchId: string;
  userId: string;
  username: string;
  homeScore: number;
  awayScore: number;
  points: number | null;
  calculatedAt: Date | null;
  createdAt: Date;
}

export interface MatchPredictionsVisibilityResponse {
  canViewPredictions: boolean;
  hasOwnPrediction: boolean;
  predictions: MatchPredictionResponse[];
}
