import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { leaderboardController } from "./leaderboard.controller";

const router = Router();

router.get("/prize", asyncHandler(leaderboardController.getPrizeLeaderboard));
router.get("/", asyncHandler(leaderboardController.getLeaderboard));

export default router;
