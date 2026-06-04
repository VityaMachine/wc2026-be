import { Request, Response, NextFunction } from 'express';
import { tournamentsService } from './tournaments.service';

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
}

export const tournamentsController = new TournamentsController();
