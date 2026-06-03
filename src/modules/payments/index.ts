import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => res.json({ module: 'payments' }));

export default router;
