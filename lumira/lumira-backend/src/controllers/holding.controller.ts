import { Request, Response, NextFunction } from 'express';
import { holdingService } from '../services/holding.service';
import { successResponse, errorResponse } from '../utils/response';
import { createHoldingSchema, updateHoldingSchema } from '../utils/validators';

export class HoldingController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const holdings = await holdingService.getUserHoldings(userId);
      res.json(successResponse(holdings));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      const holding = await holdingService.getHoldingById(id, userId);
      if (!holding) {
        return res.status(404).json(errorResponse('NOT_FOUND', 'Holding not found'));
      }
      res.json(successResponse(holding));
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const validated = createHoldingSchema.parse(req.body);
      const holding = await holdingService.createHolding(userId, validated);
      res.status(201).json(successResponse(holding));
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      const validated = updateHoldingSchema.parse(req.body);
      const holding = await holdingService.updateHolding(id, userId, validated);
      res.json(successResponse(holding));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      await holdingService.deleteHolding(id, userId);
      res.json(successResponse({ message: 'Holding deleted successfully' }));
    } catch (error) {
      next(error);
    }
  }
}

export const holdingController = new HoldingController();
