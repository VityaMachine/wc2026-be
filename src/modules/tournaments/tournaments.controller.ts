import { Request, Response, NextFunction } from 'express';
import { tournamentsService } from './tournaments.service';
import { JoinTournamentRequest } from './tournaments.types';

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

  async joinTournament(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
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
}

export const tournamentsController = new TournamentsController();
