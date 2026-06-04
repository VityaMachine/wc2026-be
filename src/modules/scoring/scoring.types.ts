export interface CalculatePredictionPointsInput {
  predictedHomeScore: number;
  predictedAwayScore: number;
  actualHomeScore: number | null;
  actualAwayScore: number | null;
  matchStatus: string;
}

export type PredictionPoints = number | null;
