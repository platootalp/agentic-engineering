'use client';

import { useQuery } from '@tanstack/react-query';
import { portfolioApi } from '@/lib/api';

const PORTFOLIO_SUMMARY_QUERY_KEY = ['portfolio', 'summary'];
const PORTFOLIO_ALLOCATION_QUERY_KEY = ['portfolio', 'allocation'];
const TOP_HOLDINGS_QUERY_KEY = (limit?: number) => ['portfolio', 'top-holdings', limit];
const BOTTOM_HOLDINGS_QUERY_KEY = (limit?: number) => ['portfolio', 'bottom-holdings', limit];

export function usePortfolioSummary() {
  return useQuery({
    queryKey: PORTFOLIO_SUMMARY_QUERY_KEY,
    queryFn: portfolioApi.getPortfolioSummary,
  });
}

export function usePortfolioAllocation() {
  return useQuery({
    queryKey: PORTFOLIO_ALLOCATION_QUERY_KEY,
    queryFn: portfolioApi.getPortfolioAllocation,
  });
}

export function useTopHoldings(limit?: number) {
  return useQuery({
    queryKey: TOP_HOLDINGS_QUERY_KEY(limit),
    queryFn: () => portfolioApi.getTopHoldings(limit),
  });
}

export function useBottomHoldings(limit?: number) {
  return useQuery({
    queryKey: BOTTOM_HOLDINGS_QUERY_KEY(limit),
    queryFn: () => portfolioApi.getBottomHoldings(limit),
  });
}
