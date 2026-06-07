import { MatchStage, MatchStatus } from "@prisma/client";
import { matchRepository } from "./match.repository";
import { predictionsRepository } from "../predictions/predictions.repository";
import { scoringService } from "../scoring/scoring.service";
import { MatchPredictionsVisibilityResponse } from "../predictions/predictions.types";
import { HttpError } from "../../lib/http-error";
import { MatchListFilters, MatchListQuery } from "./match.types";

const ALLOWED_MATCH_STATUSES = Object.values(MatchStatus);
const ALLOWED_MATCH_STAGES = Object.values(MatchStage);
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export class MatchService {
  async list(query: MatchListQuery = {}) {
    const page = this.parsePage(query.page);
    const limit = this.parseLimit(query.limit);
    const filters = this.parseFilters(query);
    const { items, total } = await matchRepository.findAll({
      filters,
      page,
      limit,
    });

    return {
      items: items.map((m) => ({
        id: m.id,
        tournamentId: m.tournamentId,
        externalFixtureId: m.externalFixtureId,
        kickoffAt: m.startsAt,
        startsAt: m.startsAt,
        stage: m.stage,
        groupName: m.groupName,
        status: m.status,
        elapsed: m.elapsed,
        homeTeam: m.homeTeam
          ? {
              id: m.homeTeam.id,
              name: m.homeTeam.name,
              code: m.homeTeam.code,
              group: m.homeTeam.groupName,
            }
          : null,
        awayTeam: m.awayTeam
          ? {
              id: m.awayTeam.id,
              name: m.awayTeam.name,
              code: m.awayTeam.code,
              group: m.awayTeam.groupName,
            }
          : null,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private parseFilters(query: MatchListQuery): MatchListFilters {
    const status = this.singleQueryValue(query.status);
    if (status && !ALLOWED_MATCH_STATUSES.includes(status as MatchStatus)) {
      throw new HttpError(400, "Invalid match status");
    }

    const stage = this.singleQueryValue(query.stage);
    if (stage && !ALLOWED_MATCH_STAGES.includes(stage as MatchStage)) {
      throw new HttpError(400, "Invalid match stage");
    }

    const groupName = this.singleQueryValue(query.groupName)?.trim();
    const tournamentId = this.singleQueryValue(query.tournamentId)?.trim();

    return {
      ...(tournamentId ? { tournamentId } : {}),
      ...(status ? { status: status as MatchStatus } : {}),
      ...(stage ? { stage: stage as MatchStage } : {}),
      ...(groupName ? { groupName } : {}),
    };
  }

  private parsePage(value: unknown): number {
    if (value === undefined) {
      return DEFAULT_PAGE;
    }

    const page = this.parsePositiveInteger(value);
    if (!page) {
      throw new HttpError(400, "page must be a positive integer");
    }

    return page;
  }

  private parseLimit(value: unknown): number {
    if (value === undefined) {
      return DEFAULT_LIMIT;
    }

    const limit = this.parsePositiveInteger(value);
    if (!limit || limit > MAX_LIMIT) {
      throw new HttpError(400, "limit must be between 1 and 100");
    }

    return limit;
  }

  private parsePositiveInteger(value: unknown): number | null {
    const rawValue = this.singleQueryValue(value);
    if (!rawValue || !/^\d+$/.test(rawValue)) {
      return null;
    }

    const parsed = Number(rawValue);
    if (!Number.isSafeInteger(parsed) || parsed < 1) {
      return null;
    }

    return parsed;
  }

  private singleQueryValue(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
  }

  async getById(matchId: string) {
    const match = await matchRepository.findDetailsById(matchId);
    if (!match) {
      throw new HttpError(404, "Match not found");
    }

    return {
      id: match.id,
      externalFixtureId: match.externalFixtureId,
      stage: match.stage,
      groupName: match.groupName,
      status: match.status,
      startsAt: match.startsAt,
      elapsed: match.elapsed,
      homeTeam: match.homeTeam
        ? {
            id: match.homeTeam.id,
            externalId: match.homeTeam.externalId,
            name: match.homeTeam.name,
            logoUrl: match.homeTeam.logoUrl,
          }
        : null,
      awayTeam: match.awayTeam
        ? {
            id: match.awayTeam.id,
            externalId: match.awayTeam.externalId,
            name: match.awayTeam.name,
            logoUrl: match.awayTeam.logoUrl,
          }
        : null,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      homeExtraTimeScore: match.homeExtraTimeScore,
      awayExtraTimeScore: match.awayExtraTimeScore,
      homePenaltyScore: match.homePenaltyScore,
      awayPenaltyScore: match.awayPenaltyScore,
      venueName: match.venueName,
      city: match.city,
      createdAt: match.createdAt,
      updatedAt: match.updatedAt,
    };
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
      throw new HttpError(404, "Match not found");
    }

    // Update the match result
    const updatedMatch = await matchRepository.updateResult(
      matchId,
      homeScore,
      awayScore,
    );

    if (updatedMatch.status === "FINISHED") {
      await this.calculateMatchPredictionPoints(matchId);
    }

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
      throw new HttpError(404, "Match not found");
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
      throw new HttpError(404, "Match not found");
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
