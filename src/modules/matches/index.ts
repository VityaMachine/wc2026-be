import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => res.json({ module: 'matches' }));

export default router;
