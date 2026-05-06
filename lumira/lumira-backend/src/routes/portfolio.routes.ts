import { Router } from 'express';
import { portfolioController } from '../controllers/portfolio.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/summary', portfolioController.getSummary);
router.get('/allocation', portfolioController.getAllocation);
router.get('/top-holdings', portfolioController.getTopHoldings);
router.get('/bottom-holdings', portfolioController.getBottomHoldings);
router.get('/profit-calendar', portfolioController.getProfitCalendar);

export default router;
