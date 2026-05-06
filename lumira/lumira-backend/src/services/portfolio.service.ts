import { prisma } from '../config/database';
import { redis, CACHE_TTL } from '../config/redis';
import { eastmoneyService } from './external/eastmoney.service';

export interface PortfolioSummary {
  totalAssets: number;
  totalCost: number;
  totalProfit: number;
  totalProfitRate: number;
  todayProfit: number;
  todayProfitRate: number;
  holdingCount: number;
}

export interface AssetAllocation {
  byType: AllocationItem[];
  byRisk: AllocationItem[];
  byChannel: AllocationItem[];
  byGroup: AllocationItem[];
}

export interface AllocationItem {
  key: string;
  name: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface TopHolding {
  fundId: string;
  fundName: string;
  profit: number;
  profitRate: number;
  contribution: number;
  marketValue: number;
  percentage: number;
}

export class PortfolioService {
  async getPortfolioSummary(userId: string): Promise<PortfolioSummary> {
    const cacheKey = `portfolio:summary:${userId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const holdings = await prisma.holding.findMany({
      where: { userId },
      include: { fund: true },
    });

    let totalAssets = 0;
    let totalCost = 0;
    let todayProfit = 0;

    for (const holding of holdings) {
      if (!holding.fund) continue;

      const marketValue = Number(holding.totalShares) * Number(holding.fund.nav);
      const cost = Number(holding.totalCost);
      const estimate = await eastmoneyService.getFundEstimate(holding.fundId);

      totalAssets += marketValue;
      totalCost += cost;

      if (estimate) {
        const yesterdayNav = estimate.lastNav;
        const todayNav = estimate.estimateNav;
        const todayChange = (todayNav - yesterdayNav) * Number(holding.totalShares);
        todayProfit += todayChange;
      }
    }

    const totalProfit = totalAssets - totalCost;
    const totalProfitRate = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
    const todayProfitRate = totalAssets > 0 ? (todayProfit / totalAssets) * 100 : 0;

    const summary: PortfolioSummary = {
      totalAssets,
      totalCost,
      totalProfit,
      totalProfitRate,
      todayProfit,
      todayProfitRate,
      holdingCount: holdings.length,
    };

    await redis.setex(cacheKey, CACHE_TTL.PORTFOLIO_SUMMARY, JSON.stringify(summary));

    return summary;
  }

  async getAssetAllocation(userId: string): Promise<AssetAllocation> {
    const holdings = await prisma.holding.findMany({
      where: { userId },
      include: { fund: true },
    });

    const typeMap = new Map<string, { amount: number; count: number }>();
    const riskMap = new Map<string, { amount: number; count: number }>();
    const channelMap = new Map<string, { amount: number; count: number }>();
    const groupMap = new Map<string, { amount: number; count: number }>();

    let totalAssets = 0;

    for (const holding of holdings) {
      if (!holding.fund) continue;

      const marketValue = Number(holding.totalShares) * Number(holding.fund.nav);
      totalAssets += marketValue;

      const type = holding.fundType;
      const typeData = typeMap.get(type) || { amount: 0, count: 0 };
      typeData.amount += marketValue;
      typeData.count += 1;
      typeMap.set(type, typeData);

      const risk = holding.fund.riskLevel;
      const riskData = riskMap.get(risk) || { amount: 0, count: 0 };
      riskData.amount += marketValue;
      riskData.count += 1;
      riskMap.set(risk, riskData);

      const channel = holding.channel || '未分类';
      const channelData = channelMap.get(channel) || { amount: 0, count: 0 };
      channelData.amount += marketValue;
      channelData.count += 1;
      channelMap.set(channel, channelData);

      const group = holding.group || '未分组';
      const groupData = groupMap.get(group) || { amount: 0, count: 0 };
      groupData.amount += marketValue;
      groupData.count += 1;
      groupMap.set(group, groupData);
    }

    const toAllocationItems = (map: Map<string, { amount: number; count: number }>): AllocationItem[] => {
      return Array.from(map.entries()).map(([key, data]) => ({
        key,
        name: this.getDisplayName(key),
        amount: data.amount,
        percentage: totalAssets > 0 ? (data.amount / totalAssets) * 100 : 0,
        count: data.count,
      }));
    };

    return {
      byType: toAllocationItems(typeMap),
      byRisk: toAllocationItems(riskMap),
      byChannel: toAllocationItems(channelMap),
      byGroup: toAllocationItems(groupMap),
    };
  }

  async getTopHoldings(userId: string, limit: number = 5): Promise<TopHolding[]> {
    const holdings = await prisma.holding.findMany({
      where: { userId },
      include: { fund: true },
    });

    const summary = await this.getPortfolioSummary(userId);
    const totalAssets = summary.totalAssets;

    const holdingsWithProfit = await Promise.all(
      holdings.map(async (holding) => {
        if (!holding.fund) return null;

        const marketValue = Number(holding.totalShares) * Number(holding.fund.nav);
        const cost = Number(holding.totalCost);
        const profit = marketValue - cost;
        const profitRate = cost > 0 ? (profit / cost) * 100 : 0;
        const contribution = totalAssets > 0 ? (profit / summary.totalProfit) * 100 : 0;

        return {
          fundId: holding.fundId,
          fundName: holding.fundName,
          profit,
          profitRate,
          contribution,
          marketValue,
          percentage: totalAssets > 0 ? (marketValue / totalAssets) * 100 : 0,
        };
      })
    );

    return holdingsWithProfit
      .filter((h): h is NonNullable<typeof h> => h !== null)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, limit);
  }

  async getBottomHoldings(userId: string, limit: number = 5): Promise<TopHolding[]> {
    const holdings = await prisma.holding.findMany({
      where: { userId },
      include: { fund: true },
    });

    const summary = await this.getPortfolioSummary(userId);
    const totalAssets = summary.totalAssets;

    const holdingsWithProfit = await Promise.all(
      holdings.map(async (holding) => {
        if (!holding.fund) return null;

        const marketValue = Number(holding.totalShares) * Number(holding.fund.nav);
        const cost = Number(holding.totalCost);
        const profit = marketValue - cost;
        const profitRate = cost > 0 ? (profit / cost) * 100 : 0;
        const contribution = summary.totalProfit !== 0 ? (profit / summary.totalProfit) * 100 : 0;

        return {
          fundId: holding.fundId,
          fundName: holding.fundName,
          profit,
          profitRate,
          contribution,
          marketValue,
          percentage: totalAssets > 0 ? (marketValue / totalAssets) * 100 : 0,
        };
      })
    );

    return holdingsWithProfit
      .filter((h): h is NonNullable<typeof h> => h !== null)
      .sort((a, b) => a.profit - b.profit)
      .slice(0, limit);
  }

  async getProfitCalendar(userId: string, year: number, month: number): Promise<Array<{ date: string; profit: number; profitRate: number }>> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { holding: { include: { fund: true } } },
    });

    const dailyProfit = new Map<string, number>();

    for (const transaction of transactions) {
      if (!transaction.holding?.fund) continue;

      const date = transaction.date;
      const currentProfit = dailyProfit.get(date) || 0;

      let profit = 0;
      if (transaction.type === 'SELL') {
        const sellAmount = Number(transaction.amount);
        const costBasis = Number(transaction.shares) * Number(transaction.holding.avgCost);
        profit = sellAmount - costBasis - Number(transaction.fee);
      }

      dailyProfit.set(date, currentProfit + profit);
    }

    return Array.from(dailyProfit.entries()).map(([date, profit]) => ({
      date,
      profit,
      profitRate: 0,
    }));
  }

  private getDisplayName(key: string): string {
    const nameMap: Record<string, string> = {
      'STOCK': '股票型',
      'BOND': '债券型',
      'MIX': '混合型',
      'INDEX': '指数型',
      'QDII': 'QDII',
      'FOF': 'FOF',
      'MONEY': '货币型',
      'LOW': '低风险',
      'LOW_MEDIUM': '中低风险',
      'MEDIUM': '中等风险',
      'MEDIUM_HIGH': '中高风险',
      'HIGH': '高风险',
    };
    return nameMap[key] || key;
  }
}

export const portfolioService = new PortfolioService();
