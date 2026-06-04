import {
  CreatePredictionRequest,
  PredictionResponse,
  PredictionStatsResponse,
  UserPredictionResponse,
} from "./predictions.types";
import { predictionsRepository } from "./predictions.repository";

export const predictionsService = {
  async createPrediction(
    userId: string,
    request: CreatePredictionRequest,
  ): Promise<PredictionResponse> {
    if (!request.matchId || typeof request.matchId !== "string") {
      throw { status: 400, message: "matchId is required" };
    }

    const homeScore = request.homeScore;
    const awayScore = request.awayScore;

    if (
      typeof homeScore !== "number" ||
      !Number.isInteger(homeScore) ||
      homeScore < 0
    ) {
      throw {
        status: 400,
        message: "homeScore must be a non-negative integer",
      };
    }

    if (
      typeof awayScore !== "number" ||
      !Number.isInteger(awayScore) ||
      awayScore < 0
    ) {
      throw {
        status: 400,
        message: "awayScore must be a non-negative integer",
      };
    }

    const match = await predictionsRepository.findMatchById(request.matchId);
    if (!match) {
      throw { status: 404, message: "Match not found" };
    }

    const existingPrediction = await predictionsRepository.findByUserAndMatch(
      userId,
      request.matchId,
    );
    if (existingPrediction) {
      throw {
        status: 409,
        message: "Prediction for this match already exists",
      };
    }

    const prediction = await predictionsRepository.createPrediction({
      userId,
      matchId: request.matchId,
      tournamentId: match.tournamentId,
      homeScore,
      awayScore,
    });

    return {
      id: prediction.id,
      userId: prediction.userId,
      matchId: prediction.matchId,
      homeScore: prediction.homeScore,
      awayScore: prediction.awayScore,
    };
  },

  async getUserPredictions(userId: string): Promise<UserPredictionResponse[]> {
    const predictions = await predictionsRepository.findUserPredictions(userId);

    return predictions.map((prediction) => ({
      id: prediction.id,
      matchId: prediction.matchId,
      homeScore: prediction.homeScore,
      awayScore: prediction.awayScore,
      match: {
        id: prediction.match.id,
        kickoffAt: prediction.match.startsAt.toISOString(),
        status: prediction.match.status,
        homeTeam: prediction.match.homeTeam
          ? {
              id: prediction.match.homeTeam.id,
              name: prediction.match.homeTeam.name,
              code: prediction.match.homeTeam.code,
            }
          : null,
        awayTeam: prediction.match.awayTeam
          ? {
              id: prediction.match.awayTeam.id,
              name: prediction.match.awayTeam.name,
              code: prediction.match.awayTeam.code,
            }
          : null,
      },
    }));
  },

  async getUserPredictionStats(
    userId: string,
  ): Promise<PredictionStatsResponse> {
    const [predictionsCount, calculatedPredictionsCount, pointsAggregate] =
      await Promise.all([
        predictionsRepository.countByUserId(userId),
        predictionsRepository.countCalculatedByUserId(userId),
        predictionsRepository.sumPointsByUserId(userId),
      ]);

    const totalPoints = pointsAggregate._sum.points
      ? Number(pointsAggregate._sum.points)
      : 0;

    const averagePoints =
      calculatedPredictionsCount === 0
        ? 0
        : Math.round((totalPoints / calculatedPredictionsCount) * 100) / 100;

    return {
      predictionsCount,
      calculatedPredictionsCount,
      totalPoints,
      averagePoints,
    };
  },
};
