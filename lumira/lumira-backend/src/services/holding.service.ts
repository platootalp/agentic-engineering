import { prisma } from '../config/database';
import { logger } from '../utils/logger';

export interface CreateHoldingInput {
  fundId: string;
  totalShares: number;
  avgCost: number;
  totalCost: number;
  channel?: string | undefined;
  group?: string | undefined;
  tags?: string[] | undefined;
}

export interface UpdateHoldingInput {
  totalShares?: number | undefined;
  avgCost?: number | undefined;
  totalCost?: number | undefined;
  channel?: string | undefined;
  group?: string | undefined;
  tags?: string[] | undefined;
}

export interface HoldingWithFund {
  id: string;
  userId: string;
  fundId: string;
  fundName: string;
  fundType: string;
  totalShares: number;
  avgCost: number;
  totalCost: number;
  channel: string | null;
  group: string | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  fund: {
    id: string;
    name: string;
    nav: number;
    accumNav: number;
    navDate: string;
  } | null;
}

export class HoldingService {
  async getUserHoldings(userId: string): Promise<HoldingWithFund[]> {
    const holdings = await prisma.holding.findMany({
      where: { userId },
      include: {
        fund: {
          select: {
            id: true,
            name: true,
            nav: true,
            accumNav: true,
            navDate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return holdings.map(h => ({
      ...h,
      totalShares: Number(h.totalShares),
      avgCost: Number(h.avgCost),
      totalCost: Number(h.totalCost),
      fund: h.fund ? {
        ...h.fund,
        nav: Number(h.fund.nav),
        accumNav: Number(h.fund.accumNav),
      } : null,
    }));
  }

  async getHoldingById(holdingId: string, userId: string): Promise<HoldingWithFund | null> {
    const holding = await prisma.holding.findFirst({
      where: { id: holdingId, userId },
      include: {
        fund: {
          select: {
            id: true,
            name: true,
            nav: true,
            accumNav: true,
            navDate: true,
          },
        },
      },
    });

    if (!holding) {
      return null;
    }

    return {
      ...holding,
      totalShares: Number(holding.totalShares),
      avgCost: Number(holding.avgCost),
      totalCost: Number(holding.totalCost),
      fund: holding.fund ? {
        ...holding.fund,
        nav: Number(holding.fund.nav),
        accumNav: Number(holding.fund.accumNav),
      } : null,
    };
  }

  async createHolding(userId: string, data: CreateHoldingInput): Promise<HoldingWithFund> {
    const fund = await prisma.fund.findUnique({
      where: { id: data.fundId },
    });

    if (!fund) {
      throw new Error('Fund not found');
    }

    const existingHolding = await prisma.holding.findFirst({
      where: { userId, fundId: data.fundId },
    });

    if (existingHolding) {
      throw new Error('Holding already exists for this fund');
    }

    const holding = await prisma.holding.create({
      data: {
        userId,
        fundId: data.fundId,
        fundName: fund.name,
        fundType: fund.type,
        totalShares: data.totalShares,
        avgCost: data.avgCost,
        totalCost: data.totalCost,
        channel: data.channel ?? null,
        group: data.group ?? null,
        tags: data.tags || [],
      },
      include: {
        fund: {
          select: {
            id: true,
            name: true,
            nav: true,
            accumNav: true,
            navDate: true,
          },
        },
      },
    });

    logger.info(`Holding created: ${holding.id} for user ${userId}`);

    return {
      ...holding,
      totalShares: Number(holding.totalShares),
      avgCost: Number(holding.avgCost),
      totalCost: Number(holding.totalCost),
      fund: holding.fund ? {
        ...holding.fund,
        nav: Number(holding.fund.nav),
        accumNav: Number(holding.fund.accumNav),
      } : null,
    };
  }

  async updateHolding(holdingId: string, userId: string, data: UpdateHoldingInput): Promise<HoldingWithFund> {
    const holding = await prisma.holding.findFirst({
      where: { id: holdingId, userId },
    });

    if (!holding) {
      throw new Error('Holding not found');
    }

    const updateData = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    );
    
    const updated = await prisma.holding.update({
      where: { id: holdingId },
      data: {
        ...updateData,
        version: { increment: 1 },
      },
      include: {
        fund: {
          select: {
            id: true,
            name: true,
            nav: true,
            accumNav: true,
            navDate: true,
          },
        },
      },
    });

    logger.info(`Holding updated: ${holdingId}`);

    return {
      ...updated,
      totalShares: Number(updated.totalShares),
      avgCost: Number(updated.avgCost),
      totalCost: Number(updated.totalCost),
      fund: updated.fund ? {
        ...updated.fund,
        nav: Number(updated.fund.nav),
        accumNav: Number(updated.fund.accumNav),
      } : null,
    };
  }

  async deleteHolding(holdingId: string, userId: string): Promise<void> {
    const holding = await prisma.holding.findFirst({
      where: { id: holdingId, userId },
    });

    if (!holding) {
      throw new Error('Holding not found');
    }

    await prisma.holding.delete({
      where: { id: holdingId },
    });

    logger.info(`Holding deleted: ${holdingId}`);
  }

  async updateHoldingAfterTransaction(
    holdingId: string,
    transaction: { type: 'BUY' | 'SELL' | 'DIVIDEND'; shares: number; price: number; amount: number }
  ): Promise<void> {
    const holding = await prisma.holding.findUnique({
      where: { id: holdingId },
    });

    if (!holding) {
      throw new Error('Holding not found');
    }

    let newShares = Number(holding.totalShares);
    let newTotalCost = Number(holding.totalCost);
    let newAvgCost = Number(holding.avgCost);

    if (transaction.type === 'BUY') {
      newTotalCost += transaction.amount;
      newShares += transaction.shares;
      newAvgCost = newShares > 0 ? newTotalCost / newShares : 0;
    } else if (transaction.type === 'SELL') {
      const costBasis = transaction.shares * newAvgCost;
      newTotalCost -= costBasis;
      newShares -= transaction.shares;
    }

    await prisma.holding.update({
      where: { id: holdingId },
      data: {
        totalShares: newShares,
        avgCost: newAvgCost,
        totalCost: newTotalCost,
        version: { increment: 1 },
      },
    });

    logger.info(`Holding updated after transaction: ${holdingId}`);
  }
}

export const holdingService = new HoldingService();
