import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { FundService } from '../fund.service';
import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { eastmoneyService } from '../external/eastmoney.service';

// Mock dependencies
jest.mock('../../config/database', () => ({
  prisma: {
    fund: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('../../config/redis', () => ({
  redis: {
    get: jest.fn(),
    setex: jest.fn(),
  },
  CACHE_TTL: {
    FUND_HISTORY: 3600,
  },
}));

jest.mock('../external/eastmoney.service', () => ({
  eastmoneyService: {
    searchFunds: jest.fn(),
    getFundEstimate: jest.fn(),
    getFundNavHistory: jest.fn(),
  },
}));

describe('FundService', () => {
  let fundService: FundService;

  beforeEach(() => {
    fundService = new FundService();
    jest.clearAllMocks();
  });

  describe('searchFunds', () => {
    it('calls eastmoneyService.searchFunds with query and limit', async () => {
      const mockResults = [{ code: '000001', name: 'Test Fund', type: 'STOCK' }];
      (eastmoneyService.searchFunds as jest.MockedFunction<typeof eastmoneyService.searchFunds>).mockResolvedValue(mockResults);

      const result = await fundService.searchFunds('test', 10);

      expect(eastmoneyService.searchFunds).toHaveBeenCalledWith('test', 10);
      expect(result).toEqual(mockResults);
    });

    it('uses default limit of 10 when not specified', async () => {
      (eastmoneyService.searchFunds as jest.MockedFunction<typeof eastmoneyService.searchFunds>).mockResolvedValue([]);

      await fundService.searchFunds('test');

      expect(eastmoneyService.searchFunds).toHaveBeenCalledWith('test', 10);
    });
  });

  describe('getFund', () => {
    it('returns fund from database when found', async () => {
      const mockFund = {
        id: '000001',
        name: 'Test Fund',
        navHistory: [],
      };
      (prisma.fund.findUnique as jest.MockedFunction<typeof prisma.fund.findUnique>).mockResolvedValue(mockFund as any);

      const result = await fundService.getFund('000001');

      expect(prisma.fund.findUnique).toHaveBeenCalledWith({
        where: { id: '000001' },
        include: {
          navHistory: {
            orderBy: { date: 'desc' },
            take: 30,
          },
        },
      });
      expect(result).toEqual(mockFund);
    });

    it('syncs from Eastmoney when fund not in database', async () => {
      (prisma.fund.findUnique as jest.MockedFunction<typeof prisma.fund.findUnique>).mockResolvedValue(null);
      const mockSyncedFund = { id: '000001', name: 'Synced Fund' };
      jest.spyOn(fundService, 'syncFundFromEastmoney').mockResolvedValue(mockSyncedFund as any);

      const result = await fundService.getFund('000001');

      expect(fundService.syncFundFromEastmoney).toHaveBeenCalledWith('000001');
      expect(result).toEqual(mockSyncedFund);
    });
  });

  describe('getFundEstimate', () => {
    it('calls eastmoneyService.getFundEstimate', async () => {
      const mockEstimate = {
        fundId: '000001',
        fundName: 'Test Fund',
        estimateNav: 1.5,
        estimateTime: '2024-01-01 15:00:00',
        estimateChange: 0.02,
        estimateChangePercent: 1.35,
        lastNav: 1.48,
        lastNavDate: '2024-01-01',
      };
      (eastmoneyService.getFundEstimate as jest.MockedFunction<typeof eastmoneyService.getFundEstimate>).mockResolvedValue(mockEstimate);

      const result = await fundService.getFundEstimate('000001');

      expect(eastmoneyService.getFundEstimate).toHaveBeenCalledWith('000001');
      expect(result).toEqual(mockEstimate);
    });
  });

  describe('getFundNavHistory', () => {
    it('returns cached data when available', async () => {
      const cachedData = [{ date: '2024-01-01', nav: 1.5, accumNav: 1.6 }];
      (redis.get as jest.MockedFunction<typeof redis.get>).mockResolvedValue(JSON.stringify(cachedData));

      const result = await fundService.getFundNavHistory('000001', '1y');

      expect(redis.get).toHaveBeenCalledWith('fund:history:000001:1y');
      expect(result).toEqual(cachedData);
      expect(eastmoneyService.getFundNavHistory).not.toHaveBeenCalled();
    });

    it('fetches from API and caches when not in cache', async () => {
      const apiData = [{ date: '2024-01-01', nav: 1.5, accumNav: 1.6 }];
      (redis.get as jest.MockedFunction<typeof redis.get>).mockResolvedValue(null);
      (eastmoneyService.getFundNavHistory as jest.MockedFunction<typeof eastmoneyService.getFundNavHistory>).mockResolvedValue(apiData);

      const result = await fundService.getFundNavHistory('000001', '1y');

      expect(eastmoneyService.getFundNavHistory).toHaveBeenCalledWith('000001', '1y');
      expect(redis.setex).toHaveBeenCalled();
      expect(result).toEqual(apiData);
    });

    it('does not cache empty results', async () => {
      (redis.get as jest.MockedFunction<typeof redis.get>).mockResolvedValue(null);
      (eastmoneyService.getFundNavHistory as jest.MockedFunction<typeof eastmoneyService.getFundNavHistory>).mockResolvedValue([]);

      await fundService.getFundNavHistory('000001', '1y');

      expect(redis.setex).not.toHaveBeenCalled();
    });
  });
});
