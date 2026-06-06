import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { apiFootballSyncService } from "./api-football.sync.service";

async function requireAdminUser(req: Request): Promise<void> {
  const userId = req.user?.userId;
  if (!userId) {
    throw { status: 401, message: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    throw { status: 403, message: "Forbidden" };
  }
}

function parseRequiredNumber(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export class ApiFootballController {
  async syncWorldCupTeams(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      await requireAdminUser(req);

      const season = parseRequiredNumber(req.body?.season);
      if (season === null) {
        return res.status(400).json({ message: "season is required" });
      }

      const result = await apiFootballSyncService.syncWorldCupTeams(season);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async syncWorldCupFixtures(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      await requireAdminUser(req);

      const season = parseRequiredNumber(req.body?.season);
      if (season === null) {
        return res.status(400).json({ message: "season is required" });
      }

      const result = await apiFootballSyncService.syncWorldCupFixtures(season);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async syncFixtureResult(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      await requireAdminUser(req);

      const fixtureId = parseRequiredNumber(req.params.fixtureId);
      if (fixtureId === null) {
        return res.status(400).json({ message: "fixtureId is required" });
      }

      const result = await apiFootballSyncService.syncFixtureResult(fixtureId);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const apiFootballController = new ApiFootballController();
