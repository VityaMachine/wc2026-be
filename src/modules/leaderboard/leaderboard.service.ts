import { leaderboardRepository } from "./leaderboard.repository";
import {
  LeaderboardEntry,
  PrizeLeaderboardEntry,
} from "./leaderboard.types";

export class LeaderboardService {
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const entries = await leaderboardRepository.getLeaderboardData();

    return this.sortAndRank(entries);
  }

  async getPrizeLeaderboard(): Promise<PrizeLeaderboardEntry[]> {
    const entries = await leaderboardRepository.getPrizeLeaderboardData();

    return this.sortAndRank(entries);
  }

  private sortAndRank<T extends Omit<LeaderboardEntry, "position">>(
    entries: T[],
  ): Array<T & { position: number }> {
    return entries
      .sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }
        if (b.calculatedPredictionsCount !== a.calculatedPredictionsCount) {
          return b.calculatedPredictionsCount - a.calculatedPredictionsCount;
        }
        return a.username.localeCompare(b.username);
      })
      .map((entry, index) => ({
        position: index + 1,
        ...entry,
      }));
  }
}

export const leaderboardService = new LeaderboardService();
