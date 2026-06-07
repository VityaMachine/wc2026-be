import { Router } from 'express';
import { authController } from './auth.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { authRateLimiter } from '../../middlewares/rate-limit.middleware';
import { asyncHandler } from '../../utils/async-handler';

const router = Router();

router.post('/register', authRateLimiter, asyncHandler((req, res, next) => authController.register(req, res, next)));
router.get('/verify-email', asyncHandler((req, res, next) => authController.verifyEmail(req, res, next)));
router.post('/login', authRateLimiter, asyncHandler((req, res, next) => authController.login(req, res, next)));
router.post('/forgot-password', authRateLimiter, asyncHandler((req, res, next) => authController.forgotPassword(req, res, next)));
router.post('/reset-password', authRateLimiter, asyncHandler((req, res, next) => authController.resetPassword(req, res, next)));
router.get('/me', authMiddleware, asyncHandler((req, res, next) => authController.me(req, res, next)));

export default router;
