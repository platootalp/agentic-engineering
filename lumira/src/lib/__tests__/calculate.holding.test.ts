/**
 * @fileoverview Holding Profit and SIP Calculation Tests
 * 
 * Tests for:
 * - calculateHoldingProfit()
 * - calculateRegularInvestReturn()
 * 
 * Coverage target: 95%+
 */

import {
  calculateHoldingProfit,
  calculateRegularInvestReturn
} from '@/lib/calculate';

describe('calculateHoldingProfit', () => {
  describe('Basic Calculations', () => {
    it('should calculate profit correctly for profitable holding', () => {
      const result = calculateHoldingProfit(1000, 1.5, 2.0);
      
      expect(result.cost).toBe(1500); // 1000 * 1.5
      expect(result.marketValue).toBe(2000); // 1000 * 2.0
      expect(result.profit).toBe(500); // 2000 - 1500
      expect(result.profitRate).toBeCloseTo(33.3333, 4); // (500 / 1500) * 100
    });

    it('should calculate loss correctly for losing holding', () => {
      const result = calculateHoldingProfit(1000, 2.0, 1.5);
      
      expect(result.cost).toBe(2000);
      expect(result.marketValue).toBe(1500);
      expect(result.profit).toBe(-500);
      expect(result.profitRate).toBeCloseTo(-25.0, 4);
    });

    it('should return zero profit when NAV equals cost', () => {
      const result = calculateHoldingProfit(1000, 1.5, 1.5);
      
      expect(result.cost).toBe(1500);
      expect(result.marketValue).toBe(1500);
      expect(result.profit).toBe(0);
      expect(result.profitRate).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero shares', () => {
      const result = calculateHoldingProfit(0, 1.5, 2.0);
      
      expect(result.cost).toBe(0);
      expect(result.marketValue).toBe(0);
      expect(result.profit).toBe(0);
      expect(result.profitRate).toBe(0);
    });

    it('should handle zero average cost (profit rate should be 0)', () => {
      const result = calculateHoldingProfit(1000, 0, 2.0);
      
      expect(result.cost).toBe(0);
      expect(result.marketValue).toBe(2000);
      expect(result.profit).toBe(2000);
      // When cost is zero, profit rate should be 0 to avoid division by zero
      expect(result.profitRate).toBe(0);
    });

    it('should handle very small shares', () => {
      const result = calculateHoldingProfit(0.001, 1.5, 2.0);
      
      expect(result.cost).toBeCloseTo(0.0015, 6);
      expect(result.marketValue).toBeCloseTo(0.002, 6);
      expect(result.profit).toBeCloseTo(0.0005, 6);
    });

    it('should handle very large shares', () => {
      const result = calculateHoldingProfit(100000000, 1.5, 2.0);
      
      expect(result.cost).toBe(150000000);
      expect(result.marketValue).toBe(200000000);
      expect(result.profit).toBe(50000000);
      expect(result.profitRate).toBeCloseTo(33.3333, 4);
    });

    it('should handle fractional NAV values', () => {
      const result = calculateHoldingProfit(1000, 1.2345, 1.5678);
      
      expect(result.cost).toBeCloseTo(1234.5, 4);
      expect(result.marketValue).toBeCloseTo(1567.8, 4);
      expect(result.profit).toBeCloseTo(333.3, 4);
    });

    it('should handle negative profit (loss) with large magnitude', () => {
      const result = calculateHoldingProfit(10000, 10, 1);
      
      expect(result.cost).toBe(100000);
      expect(result.marketValue).toBe(10000);
      expect(result.profit).toBe(-90000);
      expect(result.profitRate).toBe(-90);
    });
  });

  describe('Precision Tests', () => {
    it('should maintain precision with decimal shares', () => {
      const result = calculateHoldingProfit(1234.5678, 2.3456, 3.4567);
      
      // Cost: 1234.5678 * 2.3456 = 2895.796...
      expect(result.cost).toBeCloseTo(2895.8022, 2);
      // Market Value: 1234.5678 * 3.4567 = 4267.520...
      expect(result.marketValue).toBeCloseTo(4267.5305, 2);
    });

    it('should handle very precise NAV differences', () => {
      const result = calculateHoldingProfit(1000, 1.0001, 1.0002);
      
      expect(result.profit).toBeCloseTo(0.1, 4);
      expect(result.profitRate).toBeCloseTo(0.01, 4);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should calculate correctly for typical fund holding', () => {
      // 持有 5000 份，成本 1.2，当前净值 1.45
      const result = calculateHoldingProfit(5000, 1.2, 1.45);
      
      expect(result.cost).toBe(6000);
      expect(result.marketValue).toBe(7250);
      expect(result.profit).toBe(1250);
      expect(result.profitRate).toBeCloseTo(20.8333, 4);
    });

    it('should calculate correctly for ETF holding', () => {
      // ETF 通常有更高价格精度
      const result = calculateHoldingProfit(100, 3.456, 3.789);
      
      expect(result.cost).toBeCloseTo(345.6, 4);
      expect(result.marketValue).toBeCloseTo(378.9, 4);
      expect(result.profit).toBeCloseTo(33.3, 4);
    });

    it('should handle money market fund (stable NAV)', () => {
      // 货币基金净值通常保持在 1
      const result = calculateHoldingProfit(10000, 1, 1);
      
      expect(result.cost).toBe(10000);
      expect(result.marketValue).toBe(10000);
      expect(result.profit).toBe(0);
      expect(result.profitRate).toBe(0);
    });
  });
});

describe('calculateRegularInvestReturn', () => {
  describe('Basic Calculations', () => {
    it('should calculate SIP return correctly for profit scenario', () => {
      // 每月定投 1000，12个月，最终价值 13000
      const result = calculateRegularInvestReturn(1000, 12, 13000);
      
      expect(result.totalInvested).toBe(12000);
      expect(result.totalReturn).toBe(1000);
      expect(result.returnRate).toBeCloseTo(8.3333, 4);
    });

    it('should calculate SIP return correctly for loss scenario', () => {
      // 每月定投 1000，12个月，最终价值 11000
      const result = calculateRegularInvestReturn(1000, 12, 11000);
      
      expect(result.totalInvested).toBe(12000);
      expect(result.totalReturn).toBe(-1000);
      expect(result.returnRate).toBeCloseTo(-8.3333, 4);
    });

    it('should return zero when final value equals total invested', () => {
      const result = calculateRegularInvestReturn(1000, 12, 12000);
      
      expect(result.totalInvested).toBe(12000);
      expect(result.totalReturn).toBe(0);
      expect(result.returnRate).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero monthly amount', () => {
      const result = calculateRegularInvestReturn(0, 12, 0);
      
      expect(result.totalInvested).toBe(0);
      expect(result.totalReturn).toBe(0);
      // When total invested is 0, return rate should be 0 (avoid NaN)
      expect(result.returnRate).toBeNaN(); // 0/0 = NaN
    });

    it('should handle zero months', () => {
      const result = calculateRegularInvestReturn(1000, 0, 0);
      
      expect(result.totalInvested).toBe(0);
      expect(result.totalReturn).toBe(0);
      expect(result.returnRate).toBeNaN();
    });

    it('should handle one month SIP', () => {
      const result = calculateRegularInvestReturn(1000, 1, 1100);
      
      expect(result.totalInvested).toBe(1000);
      expect(result.totalReturn).toBe(100);
      expect(result.returnRate).toBe(10);
    });

    it('should handle very long investment period', () => {
      const result = calculateRegularInvestReturn(1000, 240, 500000); // 20 years
      
      expect(result.totalInvested).toBe(240000);
      expect(result.totalReturn).toBe(260000);
      expect(result.returnRate).toBeCloseTo(108.3333, 4);
    });

    it('should handle large monthly amount', () => {
      const result = calculateRegularInvestReturn(50000, 12, 650000);
      
      expect(result.totalInvested).toBe(600000);
      expect(result.totalReturn).toBe(50000);
      expect(result.returnRate).toBeCloseTo(8.3333, 4);
    });

    it('should handle total loss (final value is 0)', () => {
      const result = calculateRegularInvestReturn(1000, 12, 0);
      
      expect(result.totalInvested).toBe(12000);
      expect(result.totalReturn).toBe(-12000);
      expect(result.returnRate).toBe(-100);
    });
  });

  describe('Precision Tests', () => {
    it('should handle fractional monthly amounts', () => {
      const result = calculateRegularInvestReturn(1234.56, 12, 16000);
      
      expect(result.totalInvested).toBeCloseTo(14814.72, 2);
      expect(result.totalReturn).toBeCloseTo(1185.28, 2);
    });

    it('should handle fractional final values', () => {
      const result = calculateRegularInvestReturn(1000, 12, 13567.89);
      
      expect(result.totalInvested).toBe(12000);
      expect(result.totalReturn).toBeCloseTo(1567.89, 2);
      expect(result.returnRate).toBeCloseTo(13.0658, 3);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should calculate typical monthly SIP', () => {
      // 每月定投 2000，3年(36个月)，最终价值 85000
      const result = calculateRegularInvestReturn(2000, 36, 85000);
      
      expect(result.totalInvested).toBe(72000);
      expect(result.totalReturn).toBe(13000);
      expect(result.returnRate).toBeCloseTo(18.0556, 4);
    });

    it('should calculate weekly SIP', () => {
      // 每周定投 500，1年(52周)，最终价值 29000
      const result = calculateRegularInvestReturn(500, 52, 29000);
      
      expect(result.totalInvested).toBe(26000);
      expect(result.totalReturn).toBe(3000);
      expect(result.returnRate).toBeCloseTo(11.5385, 4);
    });

    it('should calculate quarterly SIP', () => {
      // 每季度定投 10000，5年(20个季度)，最终价值 280000
      const result = calculateRegularInvestReturn(10000, 20, 280000);
      
      expect(result.totalInvested).toBe(200000);
      expect(result.totalReturn).toBe(80000);
      expect(result.returnRate).toBe(40);
    });

    it('should handle bear market scenario', () => {
      // 熊市定投，定投一年反而亏损
      const result = calculateRegularInvestReturn(3000, 12, 32000);
      
      expect(result.totalInvested).toBe(36000);
      expect(result.totalReturn).toBe(-4000);
      expect(result.returnRate).toBeCloseTo(-11.1111, 4);
    });

    it('should handle bull market scenario', () => {
      // 牛市定投，收益可观
      const result = calculateRegularInvestReturn(5000, 24, 180000);
      
      expect(result.totalInvested).toBe(120000);
      expect(result.totalReturn).toBe(60000);
      expect(result.returnRate).toBe(50);
    });
  });

  describe('Negative Tests', () => {
    it('should handle negative monthly amount (invalid input)', () => {
      const result = calculateRegularInvestReturn(-1000, 12, 10000);
      
      expect(result.totalInvested).toBe(-12000);
      expect(result.totalReturn).toBe(22000);
      // This is mathematically correct but business-logically invalid
    });

    it('should handle negative months (invalid input)', () => {
      const result = calculateRegularInvestReturn(1000, -12, 10000);
      
      expect(result.totalInvested).toBe(-12000);
      expect(result.totalReturn).toBe(22000);
    });

    it('should handle negative final value (impossible scenario)', () => {
      const result = calculateRegularInvestReturn(1000, 12, -1000);
      
      expect(result.totalInvested).toBe(12000);
      expect(result.totalReturn).toBe(-13000);
      expect(result.returnRate).toBeCloseTo(-108.3333, 4);
    });
  });
});
