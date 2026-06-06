import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { matchController } from "./match.controller";

const router = Router();

router.get("/", asyncHandler(matchController.list));
router.patch("/:id/result", asyncHandler(matchController.setResult));
router.post(
  "/:id/calculate",
  asyncHandler(matchController.calculatePredictionPoints),
);
router.get(
  "/:id/predictions",
  authMiddleware,
  asyncHandler(matchController.getPredictions),
);
router.get("/:id", asyncHandler(matchController.getById));

export default router;
