import { Router } from 'express';
import { fundController } from '../controllers/fund.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/search', fundController.search);
router.get('/:id', fundController.getById);
router.get('/:id/estimate', fundController.getEstimate);
router.get('/:id/history', fundController.getHistory);
router.post('/:id/sync', fundController.sync);

export default router;
