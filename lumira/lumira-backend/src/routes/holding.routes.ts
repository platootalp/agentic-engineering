import { Router } from 'express';
import { holdingController } from '../controllers/holding.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', holdingController.list);
router.post('/', holdingController.create);
router.get('/:id', holdingController.getById);
router.put('/:id', holdingController.update);
router.delete('/:id', holdingController.delete);

export default router;
