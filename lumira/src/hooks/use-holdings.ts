'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { holdingsApi } from '@/lib/api';
import type { CreateHoldingRequest, UpdateHoldingRequest } from '@/types/api';

const HOLDINGS_QUERY_KEY = ['holdings'];
const HOLDING_QUERY_KEY = (id: string) => ['holdings', id];
const PORTFOLIO_QUERY_KEY = ['portfolio'];

export function useHoldings() {
  return useQuery({
    queryKey: HOLDINGS_QUERY_KEY,
    queryFn: holdingsApi.getHoldings,
  });
}

export function useHolding(id: string) {
  return useQuery({
    queryKey: HOLDING_QUERY_KEY(id),
    queryFn: () => holdingsApi.getHolding(id),
    enabled: !!id,
  });
}

export function useCreateHolding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (holding: CreateHoldingRequest) => holdingsApi.createHolding(holding),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOLDINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PORTFOLIO_QUERY_KEY });
    },
  });
}

export function useUpdateHolding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: UpdateHoldingRequest }) =>
      holdingsApi.updateHolding(id, changes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: HOLDING_QUERY_KEY(variables.id) });
      queryClient.invalidateQueries({ queryKey: HOLDINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PORTFOLIO_QUERY_KEY });
    },
  });
}

export function useDeleteHolding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => holdingsApi.deleteHolding(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: HOLDING_QUERY_KEY(id) });
      queryClient.invalidateQueries({ queryKey: HOLDINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PORTFOLIO_QUERY_KEY });
    },
  });
}
