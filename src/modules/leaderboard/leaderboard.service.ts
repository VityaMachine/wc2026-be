import { leaderboardRepository } from './leaderboard.repository';
import { LeaderboardEntry } from './leaderboard.types';

export class LeaderboardService {
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const entries = await leaderboardRepository.getLeaderboardData();

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
