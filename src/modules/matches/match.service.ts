import { matchRepository } from "./match.repository";
import { predictionsRepository } from "../predictions/predictions.repository";
import { scoringService } from "../scoring/scoring.service";
import { MatchPredictionsVisibilityResponse } from "../predictions/predictions.types";

export class MatchService {
  async list(tournamentId?: string) {
    const matches = await matchRepository.findAll(tournamentId);
    return matches.map((m) => ({
      id: m.id,
      tournamentId: m.tournamentId,
      kickoffAt: m.startsAt,
      status: (m.status ?? "SCHEDULED").toLowerCase(),
      homeTeam: m.homeTeam
        ? { id: m.homeTeam.id, name: m.homeTeam.name, code: m.homeTeam.code }
        : null,
      awayTeam: m.awayTeam
        ? { id: m.awayTeam.id, name: m.awayTeam.name, code: m.awayTeam.code }
        : null,
    }));
  }

  async setResult(matchId: string, homeScore: number, awayScore: number) {
    // Validate homeScore
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

    // Validate awayScore
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

    // Check if match exists
    const match = await matchRepository.findById(matchId);
    if (!match) {
      throw { status: 404, message: "Match not found" };
    }

    // Update the match result
    const updatedMatch = await matchRepository.updateResult(
      matchId,
      homeScore,
      awayScore,
    );

    return {
      id: updatedMatch.id,
      homeScore: updatedMatch.homeScore,
      awayScore: updatedMatch.awayScore,
      status: updatedMatch.status,
    };
  }

  async calculateMatchPredictionPoints(matchId: string) {
    // Check if match exists
    const match = await matchRepository.findById(matchId);
    if (!match) {
      throw { status: 404, message: "Match not found" };
    }

    // Check if match is finished and has actual scores
    if (
      match.status !== "FINISHED" ||
      match.homeScore === null ||
      match.awayScore === null
    ) {
      throw {
        status: 400,
        message: "Match is not finished or scores are missing",
      };
    }

    // Get all predictions for this match
    const predictions = await predictionsRepository.findByMatchId(matchId);

    const now = new Date();

    // Calculate points for each prediction and persist them
    const results = await Promise.all(
      predictions.map(async (prediction) => {
        const points = scoringService.calculatePredictionPoints({
          predictedHomeScore: prediction.homeScore,
          predictedAwayScore: prediction.awayScore,
          actualHomeScore: match.homeScore,
          actualAwayScore: match.awayScore,
          matchStatus: match.status,
        });

        if (points === null) {
          return {
            predictionId: prediction.id,
            userId: prediction.userId,
            predictedHomeScore: prediction.homeScore,
            predictedAwayScore: prediction.awayScore,
            actualHomeScore: match.homeScore,
            actualAwayScore: match.awayScore,
            points: null,
            calculatedAt: null,
          };
        }

        const updatedPrediction =
          await predictionsRepository.updatePredictionPoints(
            prediction.id,
            points,
            now,
          );

        return {
          predictionId: updatedPrediction.id,
          userId: updatedPrediction.userId,
          predictedHomeScore: updatedPrediction.homeScore,
          predictedAwayScore: updatedPrediction.awayScore,
          actualHomeScore: match.homeScore,
          actualAwayScore: match.awayScore,
          points:
            updatedPrediction.points !== null
              ? Number(updatedPrediction.points)
              : null,
          calculatedAt: updatedPrediction.calculatedAt,
        };
      }),
    );

    return {
      match: {
        id: match.id,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        status: match.status,
      },
      results,
    };
  }

  async getMatchPredictions(
    matchId: string,
    currentUserId: string,
  ): Promise<MatchPredictionsVisibilityResponse> {
    const match = await matchRepository.findById(matchId);
    if (!match) {
      throw { status: 404, message: "Match not found" };
    }

    const ownPrediction = await predictionsRepository.findByUserAndMatch(
      currentUserId,
      matchId,
    );

    if (!ownPrediction) {
      return {
        canViewPredictions: false,
        hasOwnPrediction: false,
        predictions: [],
      };
    }

    const predictions =
      await predictionsRepository.findDisplayByMatchId(matchId);

    return {
      canViewPredictions: true,
      hasOwnPrediction: true,
      predictions: predictions.map((prediction) => ({
        id: prediction.id,
        matchId: prediction.matchId,
        userId: prediction.userId,
        username: prediction.user.username,
        homeScore: prediction.homeScore,
        awayScore: prediction.awayScore,
        points:
          prediction.points !== null ? Number(prediction.points) : null,
        calculatedAt: prediction.calculatedAt,
        createdAt: prediction.createdAt,
      })),
    };
  }
}

export const matchService = new MatchService();
