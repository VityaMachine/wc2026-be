import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import type { RegisterRequest, LoginRequest } from './auth.types';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as RegisterRequest;
      const result = await authService.register(body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.query.token as string;
      const result = await authService.verifyEmail(token);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as LoginRequest;
      const result = await authService.login(body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const user = await authService.getUserById(userId);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
