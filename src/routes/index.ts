import { Router } from 'express';
import authRouter from '../modules/auth';
import tournamentsRouter from '../modules/tournaments';
import teamsRouter from '../modules/teams';
import matchesRouter from '../modules/matches';
import predictionsRouter from '../modules/predictions';
import leaderboardRouter from '../modules/leaderboard';
import paymentsRouter from '../modules/payments';
import adminRouter from '../modules/admin';
import apiFootballRoutes from '../modules/api-football';
import usersRouter from '../modules/users';

const router = Router();

// Health-check
router.get('/health', (_req, res) =>
	res.json({ status: 'ok', service: 'world-cup-2026-predictor-api' })
);

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/tournaments', tournamentsRouter);
router.use('/teams', teamsRouter);
router.use('/matches', matchesRouter);
router.use('/predictions', predictionsRouter);
router.use('/leaderboard', leaderboardRouter);
router.use('/payments', paymentsRouter);
router.use('/admin', adminRouter);
router.use('/api-football', apiFootballRoutes);

export default router;
