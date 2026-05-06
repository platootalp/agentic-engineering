'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '@/lib/api';
import type {
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionQueryParams,
} from '@/types/api';

const TRANSACTIONS_QUERY_KEY = ['transactions'];
const TRANSACTIONS_BY_HOLDING_QUERY_KEY = (holdingId: string) => ['transactions', 'holding', holdingId];
const HOLDINGS_QUERY_KEY = ['holdings'];
const PORTFOLIO_QUERY_KEY = ['portfolio'];

export function useTransactions(params?: TransactionQueryParams) {
  return useQuery({
    queryKey: [...TRANSACTIONS_QUERY_KEY, params],
    queryFn: () => transactionsApi.getTransactions(params),
  });
}

export function useTransactionsByHolding(holdingId: string) {
  return useQuery({
    queryKey: TRANSACTIONS_BY_HOLDING_QUERY_KEY(holdingId),
    queryFn: () => transactionsApi.getTransactionsByHolding(holdingId),
    enabled: !!holdingId,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transaction: CreateTransactionRequest) =>
      transactionsApi.createTransaction(transaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: HOLDINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PORTFOLIO_QUERY_KEY });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, changes }: { id: string; changes: UpdateTransactionRequest }) =>
      transactionsApi.updateTransaction(id, changes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: HOLDINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PORTFOLIO_QUERY_KEY });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => transactionsApi.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: HOLDINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PORTFOLIO_QUERY_KEY });
    },
  });
}
