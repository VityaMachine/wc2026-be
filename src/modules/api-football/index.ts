import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { apiFootballController } from "./api-football.controller";

const router = Router();

router.post(
  "/sync/teams",
  authMiddleware,
  asyncHandler(apiFootballController.syncWorldCupTeams),
);
router.post(
  "/sync/fixtures",
  authMiddleware,
  asyncHandler(apiFootballController.syncWorldCupFixtures),
);
router.post(
  "/sync/fixtures/:fixtureId/result",
  authMiddleware,
  asyncHandler(apiFootballController.syncFixtureResult),
);

export default router;
