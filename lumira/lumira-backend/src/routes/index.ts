import { Router } from 'express';
import authRoutes from './auth.routes';
import fundRoutes from './fund.routes';
import holdingRoutes from './holding.routes';
import transactionRoutes from './transaction.routes';
import portfolioRoutes from './portfolio.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/funds', fundRoutes);
router.use('/holdings', holdingRoutes);
router.use('/transactions', transactionRoutes);
router.use('/portfolio', portfolioRoutes);

export default router;
