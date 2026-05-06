import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { HoldingService } from '../holding.service';
import { prisma } from '../../config/database';

// Mock dependencies
jest.mock('../../config/database', () => ({
  prisma: {
    holding: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    fund: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
  },
}));

describe('HoldingService', () => {
  let holdingService: HoldingService;
  const mockDate = new Date('2024-01-15T10:00:00Z');
  const mockUserId = 'user-123';

  beforeEach(() => {
    holdingService = new HoldingService();
    jest.clearAllMocks();
  });

  describe('getUserHoldings', () => {
    it('should return user holdings with fund data', async () => {
      const mockHoldings = [
        {
          id: 'holding-1',
          userId: mockUserId,
          fundId: '000001',
          fundName: 'Test Fund',
          fundType: 'STOCK',
          totalShares: 1000,
          avgCost: 1.5,
          totalCost: 1500,
          channel: '蚂蚁财富',
          group: '股票基金',
          tags: ['科技', '成长'],
          createdAt: mockDate,
          updatedAt: mockDate,
          fund: {
            id: '000001',
            name: 'Test Fund',
            nav: 1.6,
            accumNav: 1.7,
            navDate: '2024-01-15',
          },
        },
      ];

      (prisma.holding.findMany as jest.MockedFunction<typeof prisma.holding.findMany>).mockResolvedValue(mockHoldings as any);

      const result = await holdingService.getUserHoldings(mockUserId);

      expect(prisma.holding.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
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

      expect(result).toHaveLength(1);
      expect(result[0].totalShares).toBe(1000);
      expect(result[0].fund?.nav).toBe(1.6);
    });

    it('should return empty array when user has no holdings', async () => {
      (prisma.holding.findMany as jest.MockedFunction<typeof prisma.holding.findMany>).mockResolvedValue([]);

      const result = await holdingService.getUserHoldings(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('getHoldingById', () => {
    it('should return holding when found', async () => {
      const mockHolding = {
        id: 'holding-1',
        userId: mockUserId,
        fundId: '000001',
        fundName: 'Test Fund',
        fundType: 'STOCK',
        totalShares: 1000,
        avgCost: 1.5,
        totalCost: 1500,
        channel: null,
        group: null,
        tags: [],
        createdAt: mockDate,
        updatedAt: mockDate,
        fund: {
          id: '000001',
          name: 'Test Fund',
          nav: 1.6,
          accumNav: 1.7,
          navDate: '2024-01-15',
        },
      };

      (prisma.holding.findFirst as jest.MockedFunction<typeof prisma.holding.findFirst>).mockResolvedValue(mockHolding as any);

      const result = await holdingService.getHoldingById('holding-1', mockUserId);

      expect(result?.id).toBe('holding-1');
    });

    it('should return null when holding not found', async () => {
      (prisma.holding.findFirst as jest.MockedFunction<typeof prisma.holding.findFirst>).mockResolvedValue(null);

      const result = await holdingService.getHoldingById('nonexistent', mockUserId);

      expect(result).toBeNull();
    });
  });

  describe('createHolding', () => {
    const createInput = {
      fundId: '000001',
      totalShares: 1000,
      avgCost: 1.5,
      totalCost: 1500,
      channel: '蚂蚁财富',
      group: '股票基金',
      tags: ['科技'],
    };

    it('should create holding successfully', async () => {
      const mockFund = {
        id: '000001',
        name: 'Test Fund',
        type: 'STOCK',
      };

      const mockHolding = {
        id: 'holding-1',
        userId: mockUserId,
        ...createInput,
        fundName: 'Test Fund',
        fundType: 'STOCK',
        createdAt: mockDate,
        updatedAt: mockDate,
        fund: mockFund,
      };

      (prisma.fund.findUnique as jest.MockedFunction<typeof prisma.fund.findUnique>).mockResolvedValue(mockFund as any);
      (prisma.holding.findFirst as jest.MockedFunction<typeof prisma.holding.findFirst>).mockResolvedValue(null);
      (prisma.holding.create as jest.MockedFunction<typeof prisma.holding.create>).mockResolvedValue(mockHolding as any);

      const result = await holdingService.createHolding(mockUserId, createInput);

      expect(result.fundName).toBe('Test Fund');
    });

    it('should throw error when fund not found', async () => {
      (prisma.fund.findUnique as jest.MockedFunction<typeof prisma.fund.findUnique>).mockResolvedValue(null);

      await expect(holdingService.createHolding(mockUserId, createInput)).rejects.toThrow('Fund not found');
    });

    it('should throw error when holding already exists', async () => {
      const mockFund = { id: '000001', name: 'Test Fund', type: 'STOCK' };
      (prisma.fund.findUnique as jest.MockedFunction<typeof prisma.fund.findUnique>).mockResolvedValue(mockFund as any);
      (prisma.holding.findFirst as jest.MockedFunction<typeof prisma.holding.findFirst>).mockResolvedValue({ id: 'existing' } as any);

      await expect(holdingService.createHolding(mockUserId, createInput)).rejects.toThrow('Holding already exists');
    });
  });

  describe('deleteHolding', () => {
    it('should delete holding successfully', async () => {
      (prisma.holding.findFirst as jest.MockedFunction<typeof prisma.holding.findFirst>).mockResolvedValue({ id: 'holding-1' } as any);
      (prisma.holding.delete as jest.MockedFunction<typeof prisma.holding.delete>).mockResolvedValue({} as any);

      await holdingService.deleteHolding('holding-1', mockUserId);

      expect(prisma.holding.delete).toHaveBeenCalledWith({ where: { id: 'holding-1' } });
    });

    it('should throw error when holding not found', async () => {
      (prisma.holding.findFirst as jest.MockedFunction<typeof prisma.holding.findFirst>).mockResolvedValue(null);

      await expect(holdingService.deleteHolding('nonexistent', mockUserId)).rejects.toThrow('Holding not found');
    });
  });
});
