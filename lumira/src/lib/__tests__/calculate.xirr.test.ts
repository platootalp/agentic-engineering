import { describe, it, expect } from '@jest/globals';
import { calculateXIRR } from '../calculate';
import type { CashFlow } from '@/types';

describe('calculateXIRR', () => {
  describe('Basic Cases', () => {
    it('returns error when less than 2 cashflows provided', () => {
      const cashflows: CashFlow[] = [
        { date: '2024-01-01', amount: 1000 },
      ];
      
      const result = calculateXIRR(cashflows);
      
      expect(result.xirr).toBeNull();
      expect(result.error).toBe('至少需要2笔现金流记录');
    });

    it('returns error when empty array provided', () => {
      const cashflows: CashFlow[] = [];
      
      const result = calculateXIRR(cashflows);
      
      expect(result.xirr).toBeNull();
      expect(result.error).toBe('至少需要2笔现金流记录');
    });

    it('calculates XIRR for simple buy and sell', () => {
      // Invest 1000, get back 1100 after 1 year = 10% return
      const cashflows: CashFlow[] = [
        { date: '2024-01-01', amount: 1000 },  // Investment (positive = inflow to investor)
        { date: '2025-01-01', amount: -1100 }, // Redemption (negative = outflow from investor)
      ];
      
      const result = calculateXIRR(cashflows);
      
      expect(result.xirr).not.toBeNull();
      expect(result.error).toBeUndefined();
      // Note: 2024 is a leap year, from Jan 1 to Jan 1 next year is 366 days
      expect(result.days).toBe(366);
      expect(result.totalInvested).toBe(1000);
      expect(result.totalRedeemed).toBe(1100);
      expect(result.profit).toBe(100);
    });

    it('calculates XIRR for multiple purchases and single redemption', () => {
      const cashflows: CashFlow[] = [
        { date: '2024-01-01', amount: 1000 },
        { date: '2024-06-01', amount: 1000 },
        { date: '2024-12-31', amount: -2200 },
      ];
      
      const result = calculateXIRR(cashflows);
      
      expect(result.xirr).not.toBeNull();
      expect(result.error).toBeUndefined();
      expect(result.totalInvested).toBe(2000);
      expect(result.totalRedeemed).toBe(2200);
      expect(result.profit).toBe(200);
    });

    it('calculates XIRR for partial redemption', () => {
      const cashflows: CashFlow[] = [
        { date: '2024-01-01', amount: 1000 },
        { date: '2024-06-01', amount: -500 },
        { date: '2024-12-31', amount: -600 },
      ];
      
      const result = calculateXIRR(cashflows);
      
      expect(result.xirr).not.toBeNull();
      expect(result.error).toBeUndefined();
      expect(result.totalInvested).toBe(1000);
      expect(result.totalRedeemed).toBe(1100);
    });
  });

  describe('Edge Cases - Critical', () => {
    it('handles all positive cashflows (no outflows)', () => {
      // XIRR is mathematically undefined when all cashflows are positive
      const cashflows: CashFlow[] = [
        { date: '2024-01-01', amount: 1000 },
        { date: '2024-06-01', amount: 500 },
        { date: '2024-12-31', amount: 200 },
      ];
      
      const result = calculateXIRR(cashflows);
      
      // Should either return null or an extremely large negative rate
      // depending on implementation
      expect(result.totalInvested).toBe(1700);
      expect(result.totalRedeemed).toBe(0);
      expect(result.profit).toBe(-1700);
    });

    it('handles all negative cashflows (no inflows)', () => {
      // XIRR is mathematically undefined when all cashflows are negative
      const cashflows: CashFlow[] = [
        { date: '2024-01-01', amount: -1000 },
        { date: '2024-06-01', amount: -500 },
        { date: '2024-12-31', amount: -200 },
      ];
      
      const result = calculateXIRR(cashflows);
      
      expect(result.totalInvested).toBe(0);
      expect(result.totalRedeemed).toBe(1700);
      expect(result.profit).toBe(1700);
    });

    it('handles same-day transactions', () => {
      // Multiple transactions on the same day
      const cashflows: CashFlow[] = [
        { date: '2024-01-01', amount: 1000 },
        { date: '2024-01-01', amount: 500 },
        { date: '2024-06-01', amount: -1600 },
      ];
      
      const result = calculateXIRR(cashflows);
      
      expect(result.xirr).not.toBeNull();
      expect(result.days).toBe(152); // From Jan 1 to Jun 1
      expect(result.totalInvested).toBe(1500);
      expect(result.totalRedeemed).toBe(1600);
    });

    it('handles very small amounts (< 0.01)', () => {
      const cashflows: CashFlow[] = [
        { date: '2024-01-01', amount: 0.001 },
        { date: '2024-12-31', amount: -0.0011 },
      ];
      
      const result = calculateXIRR(cashflows);
      
      expect(result.xirr).not.toBeNull();
      expect(result.totalInvested).toBe(0.001);
      expect(result.totalRedeemed).toBe(0.0011);
    });

    it('handles very large amounts (> 1 billion)', () => {
      const cashflows: CashFlow[] = [
        { date: '2024-01-01', amount: 1000000000 },
        { date: '2024-12-31', amount: -1100000000 },
      ];
      
      const result = calculateXIRR(cashflows);
      
      expect(result.xirr).not.toBeNull();
      expect(result.totalInvested).toBe(1000000000);
      expect(result.totalRedeemed).toBe(1100000000);
    });

    it('handles zero amount transactions', () => {
      const cashflows: CashFlow[] = [
        { date: '2024-01-01', amount: 1000 },
        { date: '2024-06-01', amount: 0 },
        { date: '2024-12-31', amount: -1100 },
      ];
      
      const result = calculateXIRR(cashflows);
      
      expect(result.xirr).not.toBeNull();
      expect(result.totalInvested).toBe(1000);
    });
  });

  describe('Edge Cases - Convergence', () => {
    it('handles flat cashflows (minimal change)', () => {
      // Small profit over long period - tests convergence
      const cashflows: CashFlow[] = [
        { date: '2024-01-01', amount: 1000000 },
        { date: '2024-12-31', amount: -1000001 },
      ];
      
      const result = calculateXIRR(cashflows);
      
      expect(result.xirr).not.toBeNull();
      expect(result.error).toBeUndefined();
    });

    it('handles oscillating cashflows', () => {
      // Series of investments and redemptions
      const cashflows: CashFlow[] = [
        { date: '2024-01-01', amount: 1000 },
        { date: '2024-03-01', amount: -500 },
        { date: '2024-06-01', amount: 1000 },
        { date: '2024-09-01', amount: -500 },
        { date: '2024-12-31', amount: -1200 },
      ];
      
      const result = calculateXIRR(cashflows);
      
      expect(result.error).toBeUndefined();
    });

    it('handles negative XIRR (investment loss)', () => {
      const cashflows: CashFlow[] = [
        { date: '2024-01-01', amount: 1000 },
        { date: '2024-12-31', amount: -900 },
      ];
      
      const result = calculateXIRR(cashflows);
      
      expect(result.xirr).not.toBeNull();
      expect(result.error).toBeUndefined();
      expect(result.profit).toBe(-100);
    });
  });

  describe('Date Handling', () => {
    it('correctly calculates days between dates', () => {
      const cashflows: CashFlow[] = [
        { date: '2024-01-01', amount: 1000 },
        { date: '2024-12-31', amount: -1100 },
      ];
      
      const result = calculateXIRR(cashflows);
      
      // 2024 is a leap year, but day calculation should be consistent
      expect(result.days).toBe(365);
    });

    it('handles leap year correctly', () => {
      const cashflows: CashFlow[] = [
        { date: '2024-02-28', amount: 1000 },
        { date: '2024-03-01', amount: -1001 }, // 2 days later in leap year
      ];
      
      const result = calculateXIRR(cashflows);
      
      expect(result.days).toBe(2);
    });

    it('sorts cashflows by date', () => {
      // Cashflows in reverse chronological order
      const cashflows: CashFlow[] = [
        { date: '2024-12-31', amount: -1100 },
        { date: '2024-06-01', amount: 500 },
        { date: '2024-01-01', amount: 1000 },
      ];
      
      const result = calculateXIRR(cashflows);
      
      expect(result.xirr).not.toBeNull();
      expect(result.days).toBe(365);
    });
  });

  describe('Return Values', () => {
    it('returns XIRR as percentage', () => {
      const cashflows: CashFlow[] = [
        { date: '2024-01-01', amount: -1000 },
        { date: '2024-12-31', amount: 1100 },
      ];
      
      const result = calculateXIRR(cashflows);
      
      expect(result.xirr).not.toBeNull();
      // XIRR should be positive for profitable scenario
      // Note: Implementation may have edge cases with certain cashflow patterns
      // that cause Newton-Raphson to diverge. This test documents expected
      // behavior even if current implementation has limitations.
      if (result.xirr !== null) {
        expect(result.xirr).toBeGreaterThan(0);
      }
    });

    it('returns IRR (daily rate) and XIRR (annualized)', () => {
      const cashflows: CashFlow[] = [
        { date: '2024-01-01', amount: 1000 },
        { date: '2024-12-31', amount: -1100 },
      ];
      
      const result = calculateXIRR(cashflows);
      
      expect(result.irr).not.toBeNull();
      expect(result.xirr).not.toBeNull();
      // XIRR should be higher than IRR (annualized vs daily)
      if (result.irr !== null && result.xirr !== null) {
        expect(result.xirr).toBeGreaterThan(result.irr);
      }
    });

    it('formats XIRR to 4 decimal places', () => {
      const cashflows: CashFlow[] = [
        { date: '2024-01-01', amount: 1000 },
        { date: '2024-06-01', amount: -1050 },
      ];
      
      const result = calculateXIRR(cashflows);
      
      if (result.xirr !== null) {
        const decimalPlaces = result.xirr.toString().split('.')[1]?.length || 0;
        expect(decimalPlaces).toBeLessThanOrEqual(4);
      }
    });
  });

  describe('Complex Scenarios', () => {
    it('calculates XIRR for dollar-cost averaging', () => {
      // Monthly investments of 1000
      const cashflows: CashFlow[] = [
        { date: '2024-01-01', amount: 1000 },
        { date: '2024-02-01', amount: 1000 },
        { date: '2024-03-01', amount: 1000 },
        { date: '2024-04-01', amount: 1000 },
        { date: '2024-05-01', amount: 1000 },
        { date: '2024-06-01', amount: 1000 },
        { date: '2024-12-31', amount: -6500 }, // Total value at year end
      ];
      
      const result = calculateXIRR(cashflows);
      
      expect(result.xirr).not.toBeNull();
      expect(result.error).toBeUndefined();
      expect(result.totalInvested).toBe(6000);
      expect(result.totalRedeemed).toBe(6500);
      expect(result.profit).toBe(500);
    });

    it('handles multiple redemptions', () => {
      const cashflows: CashFlow[] = [
        { date: '2024-01-01', amount: 10000 },
        { date: '2024-04-01', amount: -3000 },
        { date: '2024-08-01', amount: -3000 },
        { date: '2024-12-31', amount: -4500 },
      ];
      
      const result = calculateXIRR(cashflows);
      
      expect(result.xirr).not.toBeNull();
      expect(result.error).toBeUndefined();
      expect(result.totalInvested).toBe(10000);
      expect(result.totalRedeemed).toBe(10500);
      expect(result.profit).toBe(500);
    });
  });
});
