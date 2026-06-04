import { Request, Response, NextFunction } from "express";
import { matchService } from "./match.service";

class MatchController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tournamentId = req.query.tournamentId as string | undefined;
      const data = await matchService.list(tournamentId);
      res.json(data);
    } catch (err) {
      next(err);
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
    try {
      const matchId = req.params.id as string;
      const predictions = await matchService.getMatchPredictions(matchId);
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
