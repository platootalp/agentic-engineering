import { Request, Response, NextFunction } from 'express';
import { transactionService } from '../services/transaction.service';
import { successResponse } from '../utils/response';
import { createTransactionSchema, updateTransactionSchema } from '../utils/validators';

export class TransactionController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { fundId, type, startDate, endDate, limit, offset } = req.query;
      const result = await transactionService.getUserTransactions(userId, {
        fundId: fundId as string,
        type: type as any,
        startDate: startDate as string,
        endDate: endDate as string,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
      });
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async getByHolding(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { holdingId } = req.params;
      const transactions = await transactionService.getHoldingTransactions(holdingId, userId);
      res.json(successResponse(transactions));
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const validated = createTransactionSchema.parse(req.body);
      const transaction = await transactionService.createTransaction(userId, validated);
      res.status(201).json(successResponse(transaction));
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      const validated = updateTransactionSchema.parse(req.body);
      const transaction = await transactionService.updateTransaction(id, userId, validated);
      res.json(successResponse(transaction));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      await transactionService.deleteTransaction(id, userId);
      res.json(successResponse({ message: 'Transaction deleted successfully' }));
    } catch (error) {
      next(error);
    }
  }
}

export const transactionController = new TransactionController();
