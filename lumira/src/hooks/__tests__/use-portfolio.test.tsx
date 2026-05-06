/**
 * @fileoverview usePortfolio Hook Tests
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  usePortfolioSummary,
  usePortfolioAllocation,
  useTopHoldings,
  useBottomHoldings,
} from '@/hooks/use-portfolio';
import { portfolioApi } from '@/lib/api';

jest.mock('@/lib/api');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
};

describe('usePortfolioSummary', () => {
  const mockSummary = {
    totalValue: 100000,
    totalCost: 90000,
    totalProfit: 10000,
    profitRate: 11.11,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch portfolio summary', async () => {
    (portfolioApi.getPortfolioSummary as jest.Mock).mockResolvedValue(mockSummary);
    
    const { result } = renderHook(() => usePortfolioSummary(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockSummary);
    expect(portfolioApi.getPortfolioSummary).toHaveBeenCalled();
  });

  it('should handle error state', async () => {
    (portfolioApi.getPortfolioSummary as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    const { result } = renderHook(() => usePortfolioSummary(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});

describe('usePortfolioAllocation', () => {
  it('should fetch portfolio allocation', async () => {
    const mockAllocation = { stocks: 60, bonds: 30, cash: 10 };
    (portfolioApi.getPortfolioAllocation as jest.Mock).mockResolvedValue(mockAllocation);
    
    const { result } = renderHook(() => usePortfolioAllocation(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockAllocation);
  });
});

describe('useTopHoldings', () => {
  it('should fetch top holdings with limit', async () => {
    const mockHoldings = [{ fundName: 'Fund A', profit: 5000 }];
    (portfolioApi.getTopHoldings as jest.Mock).mockResolvedValue(mockHoldings);
    
    const { result } = renderHook(() => useTopHoldings(5), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(portfolioApi.getTopHoldings).toHaveBeenCalledWith(5);
  });
});

describe('useBottomHoldings', () => {
  it('should fetch bottom holdings', async () => {
    const mockHoldings = [{ fundName: 'Fund B', profit: -1000 }];
    (portfolioApi.getBottomHoldings as jest.Mock).mockResolvedValue(mockHoldings);
    
    const { result } = renderHook(() => useBottomHoldings(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(portfolioApi.getBottomHoldings).toHaveBeenCalledWith(undefined);
  });
});
