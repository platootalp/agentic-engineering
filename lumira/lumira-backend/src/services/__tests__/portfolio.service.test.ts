import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { PortfolioService } from '../portfolio.service';
import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { eastmoneyService } from '../external/eastmoney.service';

// Mock dependencies
jest.mock('../../config/database', () => ({
  prisma: {
    holding: {
      findMany: jest.fn(),
    },
    transaction: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('../../config/redis', () => ({
  redis: {
    get: jest.fn(),
    setex: jest.fn(),
  },
  CACHE_TTL: {
    PORTFOLIO_SUMMARY: 300,
  },
}));

jest.mock('../external/eastmoney.service', () => ({
  eastmoneyService: {
    getFundEstimate: jest.fn(),
  },
}));

describe('PortfolioService', () => {
  let portfolioService: PortfolioService;
  const mockUserId = 'user-123';

  beforeEach(() => {
    portfolioService = new PortfolioService();
    jest.clearAllMocks();
  });

  describe('getPortfolioSummary', () => {
    it('should return cached summary when available', async () => {
      const cachedSummary = {
        totalAssets: 10000,
        totalCost: 9000,
        totalProfit: 1000,
        totalProfitRate: 11.11,
        todayProfit: 100,
        todayProfitRate: 1.0,
        holdingCount: 2,
      };

      (redis.get as jest.MockedFunction<typeof redis.get>).mockResolvedValue(JSON.stringify(cachedSummary));

      const result = await portfolioService.getPortfolioSummary(mockUserId);

      expect(redis.get).toHaveBeenCalledWith(`portfolio:summary:${mockUserId}`);
      expect(result).toEqual(cachedSummary);
      expect(prisma.holding.findMany).not.toHaveBeenCalled();
    });

    it('should calculate summary from holdings', async () => {
      const mockHoldings = [
        {
          id: 'holding-1',
          userId: mockUserId,
          fundId: '000001',
          totalShares: 1000,
          totalCost: 1500,
          fund: { id: '000001', nav: 1.6 },
        },
        {
          id: 'holding-2',
          userId: mockUserId,
          fundId: '000002',
          totalShares: 2000,
          totalCost: 3000,
          fund: { id: '000002', nav: 1.7 },
        },
      ];

      (redis.get as jest.MockedFunction<typeof redis.get>).mockResolvedValue(null);
      (prisma.holding.findMany as jest.MockedFunction<typeof prisma.holding.findMany>).mockResolvedValue(mockHoldings as any);
      (eastmoneyService.getFundEstimate as jest.MockedFunction<typeof eastmoneyService.getFundEstimate>).mockResolvedValue(null);
      (redis.setex as jest.MockedFunction<typeof redis.setex>).mockResolvedValue('OK');

      const result = await portfolioService.getPortfolioSummary(mockUserId);

      expect(result.totalAssets).toBe(5000); // 1000*1.6 + 2000*1.7
      expect(result.totalCost).toBe(4500);
      expect(result.holdingCount).toBe(2);
    });

    it('should handle zero total cost for profit rate calculation', async () => {
      const mockHoldings = [
        {
          id: 'holding-1',
          userId: mockUserId,
          fundId: '000001',
          totalShares: 1000,
          totalCost: 0,
          fund: { id: '000001', nav: 1.6 },
        },
      ];

      (redis.get as jest.MockedFunction<typeof redis.get>).mockResolvedValue(null);
      (prisma.holding.findMany as jest.MockedFunction<typeof prisma.holding.findMany>).mockResolvedValue(mockHoldings as any);
      (eastmoneyService.getFundEstimate as jest.MockedFunction<typeof eastmoneyService.getFundEstimate>).mockResolvedValue(null);

      const result = await portfolioService.getPortfolioSummary(mockUserId);

      expect(result.totalProfitRate).toBe(0);
    });
  });

  describe('getAssetAllocation', () => {
    it('should return allocation data', async () => {
      const mockHoldings = [
        {
          id: 'holding-1',
          userId: mockUserId,
          fundId: '000001',
          fundType: 'STOCK',
          riskLevel: 'HIGH',
          channel: '蚂蚁财富',
          group: '股票基金',
          totalShares: 1000,
          fund: { id: '000001', nav: 1.6 },
        },
      ];

      (prisma.holding.findMany as jest.MockedFunction<typeof prisma.holding.findMany>).mockResolvedValue(mockHoldings as any);

      const result = await portfolioService.getAssetAllocation(mockUserId);

      expect(result.byType).toBeDefined();
      expect(result.byRisk).toBeDefined();
      expect(result.byChannel).toBeDefined();
      expect(result.byGroup).toBeDefined();
    });
  });

  describe('getTopHoldings', () => {
    it('should return top holdings sorted by profit', async () => {
      const mockHoldings = [
        {
          id: 'holding-1',
          userId: mockUserId,
          fundId: '000001',
          fundName: 'Fund A',
          totalShares: 1000,
          totalCost: 1500,
          fund: { id: '000001', nav: 2.0 },
        },
        {
          id: 'holding-2',
          userId: mockUserId,
          fundId: '000002',
          fundName: 'Fund B',
          totalShares: 1000,
          totalCost: 1500,
          fund: { id: '000002', nav: 1.5 },
        },
      ];

      (prisma.holding.findMany as jest.MockedFunction<typeof prisma.holding.findMany>).mockResolvedValue(mockHoldings as any);
      jest.spyOn(portfolioService, 'getPortfolioSummary').mockResolvedValue({
        totalAssets: 3500, totalCost: 3000, totalProfit: 500, totalProfitRate: 16.67,
        todayProfit: 0, todayProfitRate: 0, holdingCount: 2,
      });

      const result = await portfolioService.getTopHoldings(mockUserId, 5);

      expect(result).toHaveLength(2);
      expect(result[0].fundId).toBe('000001'); // Higher profit
      expect(result[1].fundId).toBe('000002'); // Lower profit
    });
  });

  describe('getBottomHoldings', () => {
    it('should return bottom holdings sorted by profit ascending', async () => {
      const mockHoldings = [
        {
          id: 'holding-1',
          userId: mockUserId,
          fundId: '000001',
          fundName: 'Fund A',
          totalShares: 1000,
          totalCost: 1500,
          fund: { id: '000001', nav: 1.2 },
        },
        {
          id: 'holding-2',
          userId: mockUserId,
          fundId: '000002',
          fundName: 'Fund B',
          totalShares: 1000,
          totalCost: 1500,
          fund: { id: '000002', nav: 1.8 },
        },
      ];

      (prisma.holding.findMany as jest.MockedFunction<typeof prisma.holding.findMany>).mockResolvedValue(mockHoldings as any);
      jest.spyOn(portfolioService, 'getPortfolioSummary').mockResolvedValue({
        totalAssets: 3000, totalCost: 3000, totalProfit: -300, totalProfitRate: -10,
        todayProfit: 0, todayProfitRate: 0, holdingCount: 2,
      });

      const result = await portfolioService.getBottomHoldings(mockUserId, 5);

      expect(result[0].fundId).toBe('000001'); // Lower profit
      expect(result[1].fundId).toBe('000002'); // Higher profit
    });
  });

  describe('getProfitCalendar', () => {
    it('should return daily profit for SELL transactions', async () => {
      const mockTransactions = [
        {
          id: 'tx-1',
          userId: mockUserId,
          date: '2024-01-15',
          type: 'SELL',
          shares: 1000,
          price: 1.6,
          amount: 1600,
          fee: 10,
          holding: { avgCost: 1.5, fund: { id: '000001' } },
        },
      ];

      (prisma.transaction.findMany as jest.MockedFunction<typeof prisma.transaction.findMany>).mockResolvedValue(mockTransactions as any);

      const result = await portfolioService.getProfitCalendar(mockUserId, 2024, 1);

      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2024-01-15');
    });
  });
});
