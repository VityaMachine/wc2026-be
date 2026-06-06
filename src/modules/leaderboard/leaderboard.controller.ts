import { Request, Response } from "express";
import { leaderboardService } from "./leaderboard.service";

export class LeaderboardController {
  async getLeaderboard(req: Request, res: Response) {
    const leaderboard = await leaderboardService.getLeaderboard();
    res.json(leaderboard);
  }

  async getPrizeLeaderboard(req: Request, res: Response) {
    const leaderboard = await leaderboardService.getPrizeLeaderboard();
    res.json(leaderboard);
  }
}

export const leaderboardController = new LeaderboardController();
