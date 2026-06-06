export interface LeaderboardEntry {
  position: number;
  userId: string;
  username: string;
  totalPoints: number;
  predictionsCount: number;
  calculatedPredictionsCount: number;
}

export interface PrizeLeaderboardEntry extends LeaderboardEntry {
  participationType: "PAID";
}
