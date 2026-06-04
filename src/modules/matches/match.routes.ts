import { Router } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { matchController } from "./match.controller";

const router = Router();

router.get("/", asyncHandler(matchController.list));
router.patch("/:id/result", asyncHandler(matchController.setResult));
router.post(
  "/:id/calculate",
  asyncHandler(matchController.calculatePredictionPoints),
);

export default router;
