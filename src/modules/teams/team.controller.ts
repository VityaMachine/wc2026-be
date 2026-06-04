import { Request, Response, NextFunction } from 'express';
import { teamService } from './team.service';

class TeamController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      // optional tournament filter via query ?tournamentId=
      const tournamentId = req.query.tournamentId as string | undefined;
      const data = await teamService.list(tournamentId);
      res.json(data);
    } catch (err) {
      next(err);
    }
  }
}

export const teamController = new TeamController();
