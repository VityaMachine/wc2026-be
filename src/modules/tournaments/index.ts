import { Router } from 'express';
import { asyncHandler } from '../../utils/async-handler';
import { tournamentsController } from './tournaments.controller';

const router = Router();

router.get('/:slug', asyncHandler(tournamentsController.getBySlug));
router.get('/', asyncHandler(tournamentsController.list));

export default router;
