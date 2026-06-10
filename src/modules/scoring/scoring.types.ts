export interface CalculatePredictionPointsInput {
  predictedHomeScore: number;
  predictedAwayScore: number;
  actualHomeScore: number | null;
  actualAwayScore: number | null;
  matchStatus: string;
}

export type PredictionPoints = number | null;

export interface PredictionResultMetrics {
  isExactScore: boolean;
  isDrawGuessed: boolean;
  isGoalDifferenceGuessed: boolean;
  isWinnerGuessed: boolean;
  isTotalGoalsGuessed: boolean;
}

export type PredictionResultMetricsResult = PredictionResultMetrics | null;
