import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { tournamentsController } from "./tournaments.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.post(
  "/:slug/join",
  authMiddleware,
  asyncHandler(tournamentsController.joinTournament),
);
router.get("/:slug", asyncHandler(tournamentsController.getBySlug));
router.get("/", asyncHandler(tournamentsController.list));

export default router;
