/**
 * 投资组合状态管理 (Zustand)
 *
 * Skills: portfolio-analysis
 *
 * NOTE: This store now only manages UI state.
 * Data fetching is handled by React Query (useHoldings hook).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PortfolioAnalysis } from '@/types';

interface PortfolioState {
  // UI State
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;

  // Analysis (persisted)
  analysis: PortfolioAnalysis | null;

  // Actions
  setLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
  setLastUpdated: (date: Date) => void;
  setAnalysis: (analysis: PortfolioAnalysis) => void;
  clearAnalysis: () => void;
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      // Initial state
      isLoading: false,
      error: null,
      lastUpdated: null,
      analysis: null,

      // Actions
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setLastUpdated: (date) => set({ lastUpdated: date }),
      setAnalysis: (analysis) => set({ analysis }),
      clearAnalysis: () => set({ analysis: null }),
    }),
    {
      name: 'portfolio-storage',
      partialize: (state) => ({
        // Only persist analysis
        analysis: state.analysis,
      }),
    }
  )
);

// Selectors
export const selectTotalAssets = (state: PortfolioState) =>
  state.analysis?.summary.totalAssets ?? 0;

export const selectTotalProfit = (state: PortfolioState) =>
  state.analysis?.summary.totalProfit ?? 0;

export const selectTodayProfit = (state: PortfolioState) =>
  state.analysis?.summary.todayProfit ?? 0;
