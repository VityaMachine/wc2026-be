import type { Request, Response, NextFunction } from "express";
import { usersService } from "./users.service";

class UsersController {
  async getCurrentUserProfile(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const profile = await usersService.getCurrentUserProfile(userId);
      res.status(200).json(profile);
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
