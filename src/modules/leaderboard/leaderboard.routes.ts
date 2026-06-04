import { Router } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { leaderboardController } from './leaderboard.controller';

const router = Router();

router.get('/', asyncHandler(leaderboardController.getLeaderboard));

export default router;
