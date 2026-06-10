import {
  CalculatePredictionPointsInput,
  PredictionResultMetricsResult,
  PredictionPoints,
} from "./scoring.types";

/**
 * ScoringService - Calculates prediction points based on match results
 *
 * Scoring Rules (in priority order):
 * 1. Exact score (home and away match exactly): 3 points
 * 2. Draw (both predicted and actual are draws): 1.75 points
 * 3. Goal difference (predicted diff equals actual diff): 1.5 points
 * 4. Outcome (predicted outcome equals actual outcome): 1 point
 * 5. Total goals (total predicted equals total actual): 0.25 points
 * 6. No match: 0 points
 *
 * Example:
 * Predicted: Home 2, Away 1 (Home wins by 1)
 * Actual: Home 3, Away 2 (Home wins by 1)
 * Result: 1.5 points (goal difference matches)
 */
export class ScoringService {
  /**
   * Calculate prediction points based on predicted and actual scores
   * @param input - Contains predicted scores, actual scores, and match status
   * @returns Points as number, or null if match not finished or score missing
   */
  calculatePredictionPoints(
    input: CalculatePredictionPointsInput,
  ): PredictionPoints {
    const {
      predictedHomeScore,
      predictedAwayScore,
      actualHomeScore,
      actualAwayScore,
      matchStatus,
    } = input;

    // Rule 1: If match is not finished or actual score is missing, return null
    if (
      matchStatus !== "FINISHED" ||
      actualHomeScore === null ||
      actualAwayScore === null
    ) {
      return null;
    }

    // Rule 2: Exact score - both home and away match exactly
    if (
      predictedHomeScore === actualHomeScore &&
      predictedAwayScore === actualAwayScore
    ) {
      return 3;
    }

    // Rule 3: Draw - both predicted and actual are draws
    const isPredictedDraw = predictedHomeScore === predictedAwayScore;
    const isActualDraw = actualHomeScore === actualAwayScore;

    if (isPredictedDraw && isActualDraw) {
      return 1.75;
    }

    // Rule 4: Goal difference - predicted diff equals actual diff
    const predictedGoalDiff = predictedHomeScore - predictedAwayScore;
    const actualGoalDiff = actualHomeScore - actualAwayScore;

    if (predictedGoalDiff === actualGoalDiff) {
      return 1.5;
    }

    // Rule 5: Outcome - predicted outcome (winner/loser/draw) equals actual outcome
    const predictedOutcome = this.getOutcome(
      predictedHomeScore,
      predictedAwayScore,
    );
    const actualOutcome = this.getOutcome(actualHomeScore, actualAwayScore);

    if (predictedOutcome === actualOutcome) {
      return 1;
    }

    // Rule 6: Total goals - sum of predicted equals sum of actual
    const predictedTotalGoals = predictedHomeScore + predictedAwayScore;
    const actualTotalGoals = actualHomeScore + actualAwayScore;

    if (predictedTotalGoals === actualTotalGoals) {
      return 0.25;
    }

    // Rule 7: No match - nothing correct
    return 0;
  }

  calculatePredictionResultMetrics(
    input: CalculatePredictionPointsInput,
  ): PredictionResultMetricsResult {
    const {
      predictedHomeScore,
      predictedAwayScore,
      actualHomeScore,
      actualAwayScore,
      matchStatus,
    } = input;

    if (
      matchStatus !== "FINISHED" ||
      actualHomeScore === null ||
      actualAwayScore === null
    ) {
      return null;
    }

    const predictedOutcome = this.getOutcome(
      predictedHomeScore,
      predictedAwayScore,
    );
    const actualOutcome = this.getOutcome(actualHomeScore, actualAwayScore);
    const predictedGoalDifference = predictedHomeScore - predictedAwayScore;
    const actualGoalDifference = actualHomeScore - actualAwayScore;
    const predictedTotalGoals = predictedHomeScore + predictedAwayScore;
    const actualTotalGoals = actualHomeScore + actualAwayScore;

    return {
      isExactScore:
        predictedHomeScore === actualHomeScore &&
        predictedAwayScore === actualAwayScore,
      isDrawGuessed: actualOutcome === "DRAW" && predictedOutcome === "DRAW",
      isGoalDifferenceGuessed:
        actualGoalDifference === predictedGoalDifference,
      isWinnerGuessed:
        actualOutcome !== "DRAW" && predictedOutcome === actualOutcome,
      isTotalGoalsGuessed: actualTotalGoals === predictedTotalGoals,
    };
  }

  /**
   * Determine the outcome of a match
   * @param homeScore - Home team score
   * @param awayScore - Away team score
   * @returns 'HOME_WIN' | 'AWAY_WIN' | 'DRAW'
   */
  private getOutcome(homeScore: number, awayScore: number): string {
    if (homeScore > awayScore) {
      return "HOME_WIN";
    }
    if (homeScore < awayScore) {
      return "AWAY_WIN";
    }
    return "DRAW";
  }
}

export const scoringService = new ScoringService();
