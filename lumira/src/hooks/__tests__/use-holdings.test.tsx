/**
 * @fileoverview useHoldings Hook Tests
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useHoldings,
  useHolding,
  useCreateHolding,
  useUpdateHolding,
  useDeleteHolding,
} from '@/hooks/use-holdings';
import { holdingsApi } from '@/lib/api';

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

describe('useHoldings', () => {
  const mockHoldings = [
    { id: '1', fundName: 'Fund A', totalShares: 1000 },
    { id: '2', fundName: 'Fund B', totalShares: 2000 },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch holdings', async () => {
    (holdingsApi.getHoldings as jest.Mock).mockResolvedValue(mockHoldings);
    
    const { result } = renderHook(() => useHoldings(), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockHoldings);
    expect(holdingsApi.getHoldings).toHaveBeenCalled();
  });

  it('should fetch single holding', async () => {
    const mockHolding = { id: '1', fundName: 'Fund A', totalShares: 1000 };
    (holdingsApi.getHolding as jest.Mock).mockResolvedValue(mockHolding);
    
    const { result } = renderHook(() => useHolding('1'), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockHolding);
    expect(holdingsApi.getHolding).toHaveBeenCalledWith('1');
  });

  it('should not fetch holding when id is empty', () => {
    (holdingsApi.getHolding as jest.Mock).mockRejectedValue(new Error('Should not be called'));
    
    const { result } = renderHook(() => useHolding(''), { wrapper: createWrapper() });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
  });
});

describe('useCreateHolding', () => {
  it('should create holding and invalidate queries', async () => {
    const newHolding = { fundId: '000001', totalShares: 500 };
    const createdHolding = { id: '3', ...newHolding };
    
    (holdingsApi.createHolding as jest.Mock).mockResolvedValue(createdHolding);
    
    const { result } = renderHook(() => useCreateHolding(), { wrapper: createWrapper() });

    await result.current.mutateAsync(newHolding as any);

    expect(holdingsApi.createHolding).toHaveBeenCalledWith(newHolding);
  });
});

describe('useUpdateHolding', () => {
  it('should update holding', async () => {
    const updatedHolding = { id: '1', totalShares: 1500 };
    (holdingsApi.updateHolding as jest.Mock).mockResolvedValue(updatedHolding);
    
    const { result } = renderHook(() => useUpdateHolding(), { wrapper: createWrapper() });

    await result.current.mutateAsync({ id: '1', changes: { totalShares: 1500 } });

    expect(holdingsApi.updateHolding).toHaveBeenCalledWith('1', { totalShares: 1500 });
  });
});

describe('useDeleteHolding', () => {
  it('should delete holding', async () => {
    (holdingsApi.deleteHolding as jest.Mock).mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useDeleteHolding(), { wrapper: createWrapper() });

    await result.current.mutateAsync('1');

    expect(holdingsApi.deleteHolding).toHaveBeenCalledWith('1');
  });
});
