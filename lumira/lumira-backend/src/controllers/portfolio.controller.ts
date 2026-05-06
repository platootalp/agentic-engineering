import { Request, Response, NextFunction } from 'express';
import { portfolioService } from '../services/portfolio.service';
import { successResponse } from '../utils/response';

export class PortfolioController {
  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const summary = await portfolioService.getPortfolioSummary(userId);
      res.json(successResponse(summary));
    } catch (error) {
      next(error);
    }
  }

  async getAllocation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const allocation = await portfolioService.getAssetAllocation(userId);
      res.json(successResponse(allocation));
    } catch (error) {
      next(error);
    }
  }

  async getTopHoldings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const holdings = await portfolioService.getTopHoldings(userId, limit);
      res.json(successResponse(holdings));
    } catch (error) {
      next(error);
    }
  }

  async getBottomHoldings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const holdings = await portfolioService.getBottomHoldings(userId, limit);
      res.json(successResponse(holdings));
    } catch (error) {
      next(error);
    }
  }

  async getProfitCalendar(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
      const calendar = await portfolioService.getProfitCalendar(userId, year, month);
      res.json(successResponse(calendar));
    } catch (error) {
      next(error);
    }
  }
}

export const portfolioController = new PortfolioController();
