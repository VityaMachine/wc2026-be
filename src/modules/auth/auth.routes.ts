import { Router } from 'express';
import { authController } from './auth.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/async-handler';

const router = Router();

router.post('/register', asyncHandler((req, res, next) => authController.register(req, res, next)));
router.get('/verify-email', asyncHandler((req, res, next) => authController.verifyEmail(req, res, next)));
router.post('/login', asyncHandler((req, res, next) => authController.login(req, res, next)));
router.get('/me', authMiddleware, asyncHandler((req, res, next) => authController.me(req, res, next)));

export default router;
