import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import { holdingService } from './holding.service';

export interface CreateTransactionInput {
  holdingId: string;
  fundId: string;
  type: 'BUY' | 'SELL' | 'DIVIDEND';
  date: string;
  shares: number;
  price: number;
  amount: number;
  fee: number;
  notes?: string | undefined;
}

export interface UpdateTransactionInput {
  date?: string | undefined;
  shares?: number | undefined;
  price?: number | undefined;
  amount?: number | undefined;
  fee?: number | undefined;
  notes?: string | undefined;
}

export interface TransactionWithFund {
  id: string;
  userId: string;
  holdingId: string;
  fundId: string;
  fundName: string | null;
  type: string;
  date: string;
  shares: number;
  price: number;
  amount: number;
  fee: number;
  notes: string | null;
  createdAt: Date;
}

export class TransactionService {
  async getHoldingTransactions(holdingId: string, userId: string): Promise<TransactionWithFund[]> {
    const transactions = await prisma.transaction.findMany({
      where: { holdingId, userId },
      orderBy: { date: 'desc' },
    });

    return transactions.map(t => ({
      ...t,
      shares: Number(t.shares),
      price: Number(t.price),
      amount: Number(t.amount),
      fee: Number(t.fee),
    }));
  }

  async getUserTransactions(
    userId: string,
    options?: {
      fundId?: string | undefined;
      type?: 'BUY' | 'SELL' | 'DIVIDEND' | undefined;
      startDate?: string | undefined;
      endDate?: string | undefined;
      limit?: number | undefined;
      offset?: number | undefined;
    }
  ): Promise<{ transactions: TransactionWithFund[]; total: number }> {
    const where: any = { userId };

    if (options?.fundId) {
      where.fundId = options.fundId;
    }

    if (options?.type) {
      where.type = options.type;
    }

    if (options?.startDate || options?.endDate) {
      where.date = {};
      if (options.startDate) {
        where.date.gte = options.startDate;
      }
      if (options.endDate) {
        where.date.lte = options.endDate;
      }
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions: transactions.map(t => ({
        ...t,
        shares: Number(t.shares),
        price: Number(t.price),
        amount: Number(t.amount),
        fee: Number(t.fee),
      })),
      total,
    };
  }

  async createTransaction(userId: string, data: CreateTransactionInput): Promise<TransactionWithFund> {
    const holding = await prisma.holding.findFirst({
      where: { id: data.holdingId, userId },
    });

    if (!holding) {
      throw new Error('Holding not found');
    }

    const transaction = await prisma.$transaction(async (tx) => {
      const created = await tx.transaction.create({
        data: {
          userId,
          holdingId: data.holdingId,
          fundId: data.fundId,
          fundName: holding.fundName,
          type: data.type,
          date: data.date,
          shares: data.shares,
          price: data.price,
          amount: data.amount,
          fee: data.fee,
          notes: data.notes ?? null,
        },
      });

      await holdingService.updateHoldingAfterTransaction(data.holdingId, {
        type: data.type,
        shares: data.shares,
        price: data.price,
        amount: data.amount,
      });

      return created;
    });

    logger.info(`Transaction created: ${transaction.id} for holding ${data.holdingId}`);

    return {
      ...transaction,
      shares: Number(transaction.shares),
      price: Number(transaction.price),
      amount: Number(transaction.amount),
      fee: Number(transaction.fee),
    };
  }

  async updateTransaction(
    transactionId: string,
    userId: string,
    data: UpdateTransactionInput
  ): Promise<TransactionWithFund> {
    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const updateData = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    );

    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: updateData,
    });

    logger.info(`Transaction updated: ${transactionId}`);

    return {
      ...updated,
      shares: Number(updated.shares),
      price: Number(updated.price),
      amount: Number(updated.amount),
      fee: Number(updated.fee),
    };
  }

  async deleteTransaction(transactionId: string, userId: string): Promise<void> {
    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    await prisma.$transaction(async (tx) => {
      await tx.transaction.delete({
        where: { id: transactionId },
      });

      const reverseType = transaction.type === 'BUY' ? 'SELL' : 'BUY';
      await holdingService.updateHoldingAfterTransaction(transaction.holdingId, {
        type: reverseType,
        shares: Number(transaction.shares),
        price: Number(transaction.price),
        amount: Number(transaction.amount),
      });
    });

    logger.info(`Transaction deleted: ${transactionId}`);
  }
}

export const transactionService = new TransactionService();
