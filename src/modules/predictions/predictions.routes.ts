import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { predictionsController } from "./predictions.controller";

const router = Router();

router.get("/my", authMiddleware, async (req, res) =>
  predictionsController.getUserPredictions(req, res),
);
router.get("/my/stats", authMiddleware, async (req, res) =>
  predictionsController.getUserPredictionStats(req, res),
);
router.post("/", authMiddleware, async (req, res) =>
  predictionsController.createPrediction(req, res),
);

export default router;
