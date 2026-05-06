import { prisma } from '../config/database';
import { redis, CACHE_TTL } from '../config/redis';
import { logger } from '../utils/logger';
import { eastmoneyService } from './external/eastmoney.service';
import { Decimal } from '@prisma/client/runtime/library';

export interface FundWithHistory {
  id: string;
  name: string;
  type: string;
  riskLevel: string;
  company: string;
  managerName?: string | null;
  nav: Decimal;
  accumNav: Decimal;
  navDate: string;
  feeRateBuy: Decimal;
  feeRateSell: Decimal;
  feeRateMgmt: Decimal;
  feeRateCustody?: Decimal | null;
  scale?: Decimal | null;
  establishDate?: string | null;
  navHistory?: Array<{
    id: string;
    fundId: string;
    date: string;
    nav: Decimal;
    accumNav: Decimal;
    change: Decimal | null;
    changePercent: Decimal | null;
    createdAt: Date;
  }>;
}

export class FundService {
  async searchFunds(query: string, limit: number = 10): Promise<Array<{ code: string; name: string; type: string }>> {
    return eastmoneyService.searchFunds(query, limit);
  }

  async getFund(fundId: string): Promise<FundWithHistory | null> {
    const fund = await prisma.fund.findUnique({
      where: { id: fundId },
      include: {
        navHistory: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });

    if (!fund) {
      const synced = await this.syncFundFromEastmoney(fundId);
      return synced;
    }

    return fund;
  }

  async getFundEstimate(fundId: string) {
    return eastmoneyService.getFundEstimate(fundId);
  }

  async getFundNavHistory(fundId: string, timeRange: string): Promise<Array<{ date: string; nav: number; accumNav: number }>> {
    const cacheKey = `fund:history:${fundId}:${timeRange}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const history = await eastmoneyService.getFundNavHistory(fundId, timeRange);

    if (history.length > 0) {
      await redis.setex(cacheKey, CACHE_TTL.FUND_DETAIL, JSON.stringify(history));
    }

    return history;
  }

  async syncFundFromEastmoney(fundId: string): Promise<FundWithHistory | null> {
    const detail = await eastmoneyService.getFundDetail(fundId);

    if (!detail) {
      return null;
    }

    const fundData = {
      name: detail.name,
      type: this.mapFundType(detail.type),
      riskLevel: this.mapRiskLevel(detail.riskLevel),
      company: detail.company,
      managerName: detail.managerName ?? null,
      nav: detail.nav,
      accumNav: detail.accumNav,
      navDate: detail.navDate,
      feeRateBuy: detail.feeRateBuy,
      feeRateSell: detail.feeRateSell,
      feeRateMgmt: detail.feeRateMgmt,
      feeRateCustody: detail.feeRateCustody ?? null,
      scale: detail.scale ?? null,
      establishDate: detail.establishDate ?? null,
    };

    await prisma.fund.upsert({
      where: { id: fundId },
      update: fundData,
      create: {
        id: fundId,
        ...fundData,
      },
    });

    logger.info(`Fund synced from Eastmoney: ${fundId}`);

    return prisma.fund.findUnique({
      where: { id: fundId },
      include: {
        navHistory: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });
  }

  async syncNavHistory(fundId: string, days: number = 365): Promise<void> {
    const history = await eastmoneyService.getFundNavHistory(fundId, 'all');

    if (history.length === 0) {
      return;
    }

    const recentHistory = history.slice(0, days);

    for (const item of recentHistory) {
      await prisma.fundNavHistory.upsert({
        where: {
          fundId_date: {
            fundId,
            date: item.date,
          },
        },
        update: {
          nav: item.nav,
          accumNav: item.accumNav,
        },
        create: {
          fundId,
          date: item.date,
          nav: item.nav,
          accumNav: item.accumNav,
        },
      });
    }

    logger.info(`Nav history synced for ${fundId}: ${recentHistory.length} records`);
  }

  private mapFundType(type: string): 'STOCK' | 'BOND' | 'MIX' | 'INDEX' | 'QDII' | 'FOF' | 'MONEY' {
    const typeMap: Record<string, any> = {
      '股票型': 'STOCK',
      '债券型': 'BOND',
      '混合型': 'MIX',
      '指数型': 'INDEX',
      'QDII': 'QDII',
      'FOF': 'FOF',
      '货币型': 'MONEY',
    };
    return typeMap[type] || 'MIX';
  }

  private mapRiskLevel(level: string): 'LOW' | 'LOW_MEDIUM' | 'MEDIUM' | 'MEDIUM_HIGH' | 'HIGH' {
    const riskMap: Record<string, any> = {
      '低风险': 'LOW',
      '中低风险': 'LOW_MEDIUM',
      '中等风险': 'MEDIUM',
      '中高风险': 'MEDIUM_HIGH',
      '高风险': 'HIGH',
    };
    return riskMap[level] || 'MEDIUM';
  }
}

export const fundService = new FundService();
