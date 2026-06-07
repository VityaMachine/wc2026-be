import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../utils/async-handler";
import { usersController } from "./users.controller";

const router = Router();

router.get(
  "/me/profile",
  authMiddleware,
  asyncHandler((req, res, next) =>
    usersController.getCurrentUserProfile(req, res, next),
  ),
);

export default router;
