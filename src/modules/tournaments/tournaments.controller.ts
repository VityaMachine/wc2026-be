import { Request, Response, NextFunction } from "express";
import { tournamentsService } from "./tournaments.service";
import {
  JoinTournamentRequest,
  UpdateParticipantPaymentRequest,
} from "./tournaments.types";

class TournamentsController {
  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await tournamentsService.list();
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const data = await tournamentsService.getBySlug(slug);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }

  async getStandings(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const standings = await tournamentsService.getStandings(id);
      res.json(standings);
    } catch (err) {
      next(err);
    }
  }

  async getPrizePool(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const prizePool = await tournamentsService.getPrizePool(slug);
      res.json(prizePool);
    } catch (err) {
      next(err);
    }
  }

  async joinTournament(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { slug } = req.params;
      const request = req.body as JoinTournamentRequest;
      const participant = await tournamentsService.joinTournament(
        userId,
        slug,
        request,
      );

      res.status(201).json(participant);
    } catch (err) {
      next(err);
    }
  }

  async getParticipation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { slug } = req.params;
      const participation = await tournamentsService.getParticipation(
        userId,
        slug,
      );

      res.json(participation);
    } catch (err) {
      next(err);
    }
  }

  async updateParticipantPayment(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { slug } = req.params;
      const request = req.body as UpdateParticipantPaymentRequest;
      const participant = await tournamentsService.updateParticipantPayment(
        userId,
        slug,
        request,
      );

      res.json(participant);
    } catch (err) {
      next(err);
    }
  }
}

export const tournamentsController = new TournamentsController();
