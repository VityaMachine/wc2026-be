import { Router } from 'express';

const router = Router();

// Module routes will be implemented later.
router.get('/', (_req, res) => res.json({ module: 'tournaments' }));

export default router;
