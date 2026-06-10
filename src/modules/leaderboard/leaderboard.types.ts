export interface LeaderboardEntry {
  position: number;
  userId: string;
  username: string;
  displayName: string | null;
  totalPoints: number;
  predictionsCount: number;
  calculatedPredictionsCount: number;
  exactScoreCount: number;
  drawGuessedCount: number;
  goalDifferenceGuessedCount: number;
  winnerGuessedCount: number;
  totalGoalsGuessedCount: number;
}

export interface PrizeLeaderboardEntry extends LeaderboardEntry {
  participationType: "PAID";
}
