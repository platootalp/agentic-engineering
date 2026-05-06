import { Router } from 'express';
import { transactionController } from '../controllers/transaction.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', transactionController.list);
router.post('/', transactionController.create);
router.get('/holding/:holdingId', transactionController.getByHolding);
router.put('/:id', transactionController.update);
router.delete('/:id', transactionController.delete);

export default router;
