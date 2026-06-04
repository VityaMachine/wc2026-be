import { Request, Response } from "express";
import { predictionsService } from "./predictions.service";
import {
  CreatePredictionRequest,
  PredictionStatsResponse,
} from "./predictions.types";

export const predictionsController = {
  async createPrediction(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const request = req.body as CreatePredictionRequest;
      const prediction = await predictionsService.createPrediction(
        userId,
        request,
      );
      return res.status(201).json(prediction);
    } catch (error: unknown) {
      const typedError = error as { status?: number; message?: string };
      return res
        .status(typedError.status ?? 500)
        .json({ message: typedError.message ?? "Internal server error" });
    }
  },

  async getUserPredictions(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const predictions = await predictionsService.getUserPredictions(userId);
      return res.status(200).json(predictions);
    } catch (error: unknown) {
      const typedError = error as { status?: number; message?: string };
      return res
        .status(typedError.status ?? 500)
        .json({ message: typedError.message ?? "Internal server error" });
    }
  },

  async getUserPredictionStats(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const stats = await predictionsService.getUserPredictionStats(userId);
      return res.status(200).json(stats);
    } catch (error: unknown) {
      const typedError = error as { status?: number; message?: string };
      return res
        .status(typedError.status ?? 500)
        .json({ message: typedError.message ?? "Internal server error" });
    }
  },
};
