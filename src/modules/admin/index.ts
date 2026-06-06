import { Router } from 'express';
import { requireAdmin } from '../../middlewares/admin.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware, requireAdmin, (_req, res) =>
  res.json({ module: 'admin' }),
);

export default router;
