import { Request, Response, NextFunction } from "express";
import { matchService } from "./match.service";
import { MatchListQuery } from "./match.types";

class MatchController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await matchService.list(req.query as MatchListQuery);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const matchId = req.params.id as string;
      const match = await matchService.getById(matchId);
      res.json(match);
    } catch (error: unknown) {
      const typedError = error as { status?: number; message?: string };
      if (typedError.status) {
        return res
          .status(typedError.status)
          .json({ message: typedError.message });
      }
      next(error);
    }
  }

  async setResult(req: Request, res: Response, next: NextFunction) {
    try {
      const matchId = req.params.id as string;
      const { homeScore, awayScore } = req.body;

      const result = await matchService.setResult(
        matchId,
        homeScore,
        awayScore,
      );
      res.json(result);
    } catch (error: unknown) {
      const typedError = error as { status?: number; message?: string };
      if (typedError.status) {
        return res
          .status(typedError.status)
          .json({ message: typedError.message });
      }
      next(error);
    }
  }

  async calculatePredictionPoints(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const matchId = req.params.id as string;
      const result = await matchService.calculateMatchPredictionPoints(matchId);
      res.json(result);
    } catch (error: unknown) {
      const typedError = error as { status?: number; message?: string };
      if (typedError.status) {
        return res
          .status(typedError.status)
          .json({ message: typedError.message });
      }
      next(error);
    }
  }

  async getPredictions(req: Request, res: Response, next: NextFunction) {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const matchId = req.params.id as string;
      const predictions = await matchService.getMatchPredictions(
        matchId,
        userId,
      );
      res.json(predictions);
    } catch (error: unknown) {
      const typedError = error as { status?: number; message?: string };
      if (typedError.status) {
        return res
          .status(typedError.status)
          .json({ message: typedError.message });
      }
      next(error);
    }
  }
}

export const matchController = new MatchController();
