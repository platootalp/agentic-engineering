import { Request, Response, NextFunction } from 'express';
import { fundService } from '../services/fund.service';
import { successResponse, errorResponse } from '../utils/response';
import { fundSearchSchema, timeRangeSchema } from '../utils/validators';

export class FundController {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = fundSearchSchema.parse(req.query);
      const results = await fundService.searchFunds(validated.query, validated.limit);
      res.json(successResponse(results));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const fund = await fundService.getFund(id);
      if (!fund) {
        return res.status(404).json(errorResponse('NOT_FOUND', 'Fund not found'));
      }
      res.json(successResponse(fund));
    } catch (error) {
      next(error);
    }
  }

  async getEstimate(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const estimate = await fundService.getFundEstimate(id);
      if (!estimate) {
        return res.status(404).json(errorResponse('NOT_FOUND', 'Fund estimate not available'));
      }
      res.json(successResponse(estimate, { cached: false, source: 'eastmoney' }));
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const timeRange = timeRangeSchema.parse(req.query.range || '1y');
      const history = await fundService.getFundNavHistory(id, timeRange);
      res.json(successResponse(history));
    } catch (error) {
      next(error);
    }
  }

  async sync(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const fund = await fundService.syncFundFromEastmoney(id);
      if (!fund) {
        return res.status(404).json(errorResponse('NOT_FOUND', 'Fund not found in external API'));
      }
      res.json(successResponse(fund));
    } catch (error) {
      next(error);
    }
  }
}

export const fundController = new FundController();
