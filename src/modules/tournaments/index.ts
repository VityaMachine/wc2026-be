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
router.get(
  "/:slug/participation",
  authMiddleware,
  asyncHandler(tournamentsController.getParticipation),
);
router.patch(
  "/:slug/participant/payment",
  authMiddleware,
  asyncHandler(tournamentsController.updateParticipantPayment),
);
router.get("/", asyncHandler(tournamentsController.list));
router.get("/:id/standings", asyncHandler(tournamentsController.getStandings));
router.get("/:slug/prize-pool", asyncHandler(tournamentsController.getPrizePool));
router.get("/:slug", asyncHandler(tournamentsController.getBySlug));

export default router;
