/**
 * @fileoverview Frontend API Module Tests
 * 
 * Tests for API domain modules:
 * - authApi
 * - holdingsApi
 * - transactionsApi
 * - portfolioApi
 */

import { 
  authApi, 
  holdingsApi, 
  transactionsApi, 
  portfolioApi 
} from '@/lib/api';
import { apiClient } from '@/lib/api-client';
import { server } from '@/test/server';
import { rest } from 'msw';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Mock apiClient
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    setTokens: jest.fn(),
    getRefreshToken: jest.fn(),
    clearTokens: jest.fn(),
  },
  ApiError: class ApiError extends Error {
    constructor(message: string, public status: number, public code: string) {
      super(message);
    }
  },
}));

describe('authApi', () => {
  const mockTokens = {
    accessToken: 'test-access',
    refreshToken: 'test-refresh',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should login successfully', async () => {
    const mockResponse = {
      success: true,
      data: {
        user: { id: '1', email: 'test@example.com' },
        tokens: mockTokens,
      },
    };
    (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

    const result = await authApi.login({ email: 'test@example.com', password: 'password' });

    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'password',
    });
    expect(apiClient.setTokens).toHaveBeenCalledWith(mockTokens);
    expect(result.user.email).toBe('test@example.com');
  });

  it('should register successfully', async () => {
    const mockResponse = {
      success: true,
      data: {
        user: { id: '1', email: 'new@example.com' },
        tokens: mockTokens,
      },
    };
    (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

    await authApi.register({
      email: 'new@example.com',
      password: 'password',
      name: 'New User',
    });

    expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
      email: 'new@example.com',
      password: 'password',
      name: 'New User',
    });
    expect(apiClient.setTokens).toHaveBeenCalledWith(mockTokens);
  });

  it('should logout successfully', async () => {
    (apiClient.getRefreshToken as jest.Mock).mockReturnValue('refresh-token');
    (apiClient.post as jest.Mock).mockResolvedValue({ success: true });

    await authApi.logout();

    expect(apiClient.post).toHaveBeenCalledWith('/auth/logout', { refreshToken: 'refresh-token' });
    expect(apiClient.clearTokens).toHaveBeenCalled();
  });

  it('should handle logout without refresh token', async () => {
    (apiClient.getRefreshToken as jest.Mock).mockReturnValue(null);

    await authApi.logout();

    expect(apiClient.post).not.toHaveBeenCalled();
    expect(apiClient.clearTokens).toHaveBeenCalled();
  });

  it('should get current user', async () => {
    const mockResponse = {
      success: true,
      data: { id: '1', email: 'test@example.com' },
    };
    (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

    const user = await authApi.getCurrentUser();

    expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
    expect(user.email).toBe('test@example.com');
  });

  it('should throw ApiError on failed login', async () => {
    const mockResponse = {
      success: false,
      error: { message: 'Invalid credentials', code: 'AUTH_ERROR' },
    };
    (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

    await expect(authApi.login({ email: 'test@test.com', password: 'wrong' }))
      .rejects.toThrow('Invalid credentials');
  });
});

describe('holdingsApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get all holdings', async () => {
    const mockResponse = {
      success: true,
      data: [{ id: '1', fundName: 'Test Fund' }],
    };
    (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

    const holdings = await holdingsApi.getHoldings();

    expect(apiClient.get).toHaveBeenCalledWith('/holdings');
    expect(holdings).toHaveLength(1);
  });

  it('should get single holding', async () => {
    const mockResponse = {
      success: true,
      data: { id: '1', fundName: 'Test Fund' },
    };
    (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

    const holding = await holdingsApi.getHolding('1');

    expect(apiClient.get).toHaveBeenCalledWith('/holdings/1');
    expect(holding.id).toBe('1');
  });

  it('should create holding', async () => {
    const newHolding = { fundId: '000001', totalShares: 1000 };
    const mockResponse = {
      success: true,
      data: { id: '1', ...newHolding },
    };
    (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

    const holding = await holdingsApi.createHolding(newHolding as any);

    expect(apiClient.post).toHaveBeenCalledWith('/holdings', newHolding);
    expect(holding.id).toBe('1');
  });

  it('should update holding', async () => {
    const updates = { totalShares: 2000 };
    const mockResponse = {
      success: true,
      data: { id: '1', ...updates },
    };
    (apiClient.put as jest.Mock).mockResolvedValue(mockResponse);

    const holding = await holdingsApi.updateHolding('1', updates as any);

    expect(apiClient.put).toHaveBeenCalledWith('/holdings/1', updates);
    expect(holding.totalShares).toBe(2000);
  });

  it('should delete holding', async () => {
    const mockResponse = { success: true };
    (apiClient.delete as jest.Mock).mockResolvedValue(mockResponse);

    await holdingsApi.deleteHolding('1');

    expect(apiClient.delete).toHaveBeenCalledWith('/holdings/1');
  });
});

describe('transactionsApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get transactions with params', async () => {
    const mockResponse = {
      success: true,
      data: {
        transactions: [{ id: '1', type: 'BUY' }],
        total: 1,
      },
    };
    (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

    await transactionsApi.getTransactions({ page: 1, limit: 10 });

    expect(apiClient.get).toHaveBeenCalledWith('/transactions', { page: 1, limit: 10 });
  });

  it('should get transactions by holding', async () => {
    const mockResponse = {
      success: true,
      data: [{ id: '1', holdingId: 'holding-1' }],
    };
    (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

    await transactionsApi.getTransactionsByHolding('holding-1');

    expect(apiClient.get).toHaveBeenCalledWith('/transactions/holding/holding-1');
  });

  it('should create transaction', async () => {
    const newTransaction = { type: 'BUY', amount: 1000 };
    const mockResponse = {
      success: true,
      data: { id: '1', ...newTransaction },
    };
    (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

    await transactionsApi.createTransaction(newTransaction as any);

    expect(apiClient.post).toHaveBeenCalledWith('/transactions', newTransaction);
  });

  it('should update transaction', async () => {
    const updates = { amount: 2000 };
    const mockResponse = {
      success: true,
      data: { id: '1', ...updates },
    };
    (apiClient.put as jest.Mock).mockResolvedValue(mockResponse);

    await transactionsApi.updateTransaction('1', updates as any);

    expect(apiClient.put).toHaveBeenCalledWith('/transactions/1', updates);
  });

  it('should delete transaction', async () => {
    const mockResponse = { success: true };
    (apiClient.delete as jest.Mock).mockResolvedValue(mockResponse);

    await transactionsApi.deleteTransaction('1');

    expect(apiClient.delete).toHaveBeenCalledWith('/transactions/1');
  });
});

describe('portfolioApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get portfolio summary', async () => {
    const mockResponse = {
      success: true,
      data: { totalValue: 100000, totalCost: 90000 },
    };
    (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

    const summary = await portfolioApi.getPortfolioSummary();

    expect(apiClient.get).toHaveBeenCalledWith('/portfolio/summary');
    expect(summary.totalValue).toBe(100000);
  });

  it('should get portfolio allocation', async () => {
    const mockResponse = {
      success: true,
      data: { stocks: 60, bonds: 40 },
    };
    (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

    const allocation = await portfolioApi.getPortfolioAllocation();

    expect(apiClient.get).toHaveBeenCalledWith('/portfolio/allocation');
    expect(allocation.stocks).toBe(60);
  });

  it('should get top holdings', async () => {
    const mockResponse = {
      success: true,
      data: [{ fundName: 'Top Fund', profit: 5000 }],
    };
    (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

    const holdings = await portfolioApi.getTopHoldings(5);

    expect(apiClient.get).toHaveBeenCalledWith('/portfolio/top-holdings', { limit: 5 });
    expect(holdings[0].fundName).toBe('Top Fund');
  });

  it('should get bottom holdings', async () => {
    const mockResponse = {
      success: true,
      data: [{ fundName: 'Bottom Fund', profit: -1000 }],
    };
    (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

    const holdings = await portfolioApi.getBottomHoldings();

    expect(apiClient.get).toHaveBeenCalledWith('/portfolio/bottom-holdings', {});
    expect(holdings[0].profit).toBe(-1000);
  });
});
