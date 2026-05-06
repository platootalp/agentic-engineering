/**
 * @fileoverview Risk Metrics Calculation Tests
 * 
 * Tests for:
 * - calculateVolatility()
 * - calculateSharpeRatio()
 * - calculateMaxDrawdown()
 * 
 * Coverage target: 95%+
 */

import {
  calculateVolatility,
  calculateSharpeRatio,
  calculateMaxDrawdown
} from '@/lib/calculate';

describe('calculateVolatility', () => {
  describe('Basic Calculations', () => {
    it('should calculate volatility for positive returns', () => {
      const returns = [1, 2, 3, 4, 5];
      const result = calculateVolatility(returns);
      
      expect(result).toBeGreaterThan(0);
      expect(result).toBeCloseTo(25.0998, 2);
    });

    it('should calculate volatility for negative returns', () => {
      const returns = [-1, -2, -3, -4, -5];
      const result = calculateVolatility(returns);
      
      expect(result).toBeGreaterThan(0);
      expect(result).toBeCloseTo(25.0998, 2);
    });

    it('should calculate volatility for mixed returns', () => {
      const returns = [-2, -1, 0, 1, 2];
      const result = calculateVolatility(returns);
      
      expect(result).toBeGreaterThan(0);
    });

    it('should return zero for constant returns', () => {
      const returns = [5, 5, 5, 5, 5];
      const result = calculateVolatility(returns);
      
      expect(result).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should return zero for empty array', () => {
      const result = calculateVolatility([]);
      expect(result).toBe(0);
    });

    it('should return zero for single return', () => {
      const result = calculateVolatility([5]);
      expect(result).toBe(0);
    });

    it('should handle two returns', () => {
      const returns = [1, 3];
      const result = calculateVolatility(returns);
      
      expect(result).toBeGreaterThan(0);
    });

    it('should handle very small returns', () => {
      const returns = [0.001, 0.002, 0.0015, 0.0025, 0.0018];
      const result = calculateVolatility(returns);
      
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    });

    it('should handle very large returns', () => {
      const returns = [100, 200, 150, 300, 250];
      const result = calculateVolatility(returns);
      
      expect(result).toBeGreaterThan(0);
    });

    it('should handle realistic daily returns', () => {
      const returns = [0.5, -0.3, 1.2, -0.8, 0.4, 0.9, -1.1, 0.2, 0.6, -0.4,
                       0.8, -0.2, 1.0, -0.5, 0.3, 0.7, -0.9, 0.1, 0.5, -0.6];
      const result = calculateVolatility(returns);
      
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(50);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should calculate low volatility (stable fund)', () => {
      const returns = [0.02, 0.03, 0.01, 0.02, 0.03, 0.02, 0.01, 0.02, 0.03, 0.02];
      const result = calculateVolatility(returns);
      
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(5);
    });

    it('should calculate medium volatility (balanced fund)', () => {
      const returns = [1.5, -0.8, 2.1, -1.2, 0.9, 1.8, -0.5, 1.2, -1.0, 0.7];
      const result = calculateVolatility(returns);
      
      expect(result).toBeGreaterThan(5);
      expect(result).toBeLessThan(30);
    });

    it('should calculate high volatility (aggressive equity)', () => {
      const returns = [5.2, -3.8, 4.5, -2.1, 6.8, -4.2, 3.9, -5.1, 7.2, -3.5];
      const result = calculateVolatility(returns);
      
      expect(result).toBeGreaterThan(30);
    });
  });
});

describe('calculateSharpeRatio', () => {
  describe('Basic Calculations', () => {
    it('should calculate positive Sharpe ratio', () => {
      const returns = [0.5, 0.4, 0.6, 0.5, 0.4, 0.5, 0.6, 0.5, 0.4, 0.5];
      const result = calculateSharpeRatio(returns, 3);
      
      expect(result).toBeGreaterThan(0);
    });

    it('should calculate negative Sharpe ratio', () => {
      const returns = [-0.5, -0.4, -0.6, -0.5, -0.4];
      const result = calculateSharpeRatio(returns, 3);
      
      expect(result).toBeLessThan(0);
    });

    it('should use default risk-free rate of 3%', () => {
      const returns = [0.5, 0.4, 0.6, 0.5, 0.4];
      const resultWithDefault = calculateSharpeRatio(returns);
      const resultWithExplicit = calculateSharpeRatio(returns, 3);
      
      expect(resultWithDefault).toBe(resultWithExplicit);
    });

    it('should return zero with zero volatility', () => {
      const returns = [3, 3, 3, 3, 3];
      const result = calculateSharpeRatio(returns, 3);
      
      expect(result).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should return zero for empty array', () => {
      const result = calculateSharpeRatio([]);
      expect(result).toBe(0);
    });

    it('should return zero for single return', () => {
      const result = calculateSharpeRatio([5]);
      expect(result).toBe(0);
    });

    it('should handle zero risk-free rate', () => {
      const returns = [1, 2, 3, 4, 5];
      const result = calculateSharpeRatio(returns, 0);
      
      expect(result).toBeGreaterThan(0);
    });

    it('should handle very high risk-free rate', () => {
      const returns = [1, 2, 3, 4, 5];
      const result = calculateSharpeRatio(returns, 10);
      
      // Average return is 3% daily, annualized is 756%, so Sharpe is positive
      expect(result).toBeGreaterThan(0);
    });

    it('should handle negative risk-free rate', () => {
      const returns = [0, 0.5, 1, 0.5, 0];
      const result = calculateSharpeRatio(returns, -1);
      
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should calculate excellent Sharpe ratio (>2)', () => {
      const returns = [1.2, 0.8, 1.0, 1.1, 0.9, 1.0, 1.2, 0.8, 1.1, 0.9];
      const result = calculateSharpeRatio(returns, 3);
      
      expect(result).toBeGreaterThan(2);
    });

    it('should calculate good Sharpe ratio (>1)', () => {
      const returns = [0.8, -0.3, 1.2, -0.5, 0.9, 0.4, -0.2, 1.0, -0.4, 0.7];
      const result = calculateSharpeRatio(returns, 3);
      
      // With actual volatility, this gives ~8.5 which is excellent
      expect(result).toBeGreaterThan(1);
    });

    it('should calculate poor Sharpe ratio (<0.5)', () => {
      const returns = [0.1, -0.8, 0.3, -0.5, 0.2, -0.4, 0.1, -0.6, 0.2, -0.3];
      const result = calculateSharpeRatio(returns, 3);
      
      expect(result).toBeLessThan(0.5);
    });

    it('should handle bear market scenario', () => {
      const returns = [-2.5, -1.8, -3.2, -0.9, -2.1, -1.5, -2.8, -0.7, -1.9, -2.3];
      const result = calculateSharpeRatio(returns, 3);
      
      expect(result).toBeLessThan(-2);
    });
  });
});

describe('calculateMaxDrawdown', () => {
  describe('Basic Calculations', () => {
    it('should calculate max drawdown correctly', () => {
      const values = [100, 110, 105, 120, 115, 100, 95, 105, 110];
      const result = calculateMaxDrawdown(values);
      
      expect(result).toBeGreaterThan(0);
      expect(result).toBeCloseTo(20.8333, 2);
    });

    it('should return zero for always increasing values', () => {
      const values = [100, 105, 110, 115, 120, 125];
      const result = calculateMaxDrawdown(values);
      
      expect(result).toBe(0);
    });

    it('should calculate max drawdown for decreasing values', () => {
      const values = [100, 95, 90, 85, 80, 75];
      const result = calculateMaxDrawdown(values);
      
      expect(result).toBe(25);
    });

    it('should find deepest drawdown from initial peak', () => {
      const values = [100, 90, 95, 80, 85, 70, 75];
      // Drawdown from initial peak: 100->70 = 30%
      const result = calculateMaxDrawdown(values);
      
      expect(result).toBe(30);
    });
  });

  describe('Edge Cases', () => {
    it('should return zero for empty array', () => {
      const result = calculateMaxDrawdown([]);
      expect(result).toBe(0);
    });

    it('should return zero for single value', () => {
      const result = calculateMaxDrawdown([100]);
      expect(result).toBe(0);
    });

    it('should handle two values with drawdown', () => {
      const values = [100, 80];
      const result = calculateMaxDrawdown(values);
      
      expect(result).toBe(20);
    });

    it('should handle two values without drawdown', () => {
      const values = [100, 120];
      const result = calculateMaxDrawdown(values);
      
      expect(result).toBe(0);
    });

    it('should handle recovery to new high', () => {
      const values = [100, 80, 90, 100, 110];
      const result = calculateMaxDrawdown(values);
      
      expect(result).toBe(20);
    });

    it('should handle multiple peaks', () => {
      const values = [100, 110, 100, 120, 105, 115, 100];
      const result = calculateMaxDrawdown(values);
      
      expect(result).toBeCloseTo(16.6667, 2);
    });

    it('should handle near-total loss', () => {
      const values = [100, 50, 25, 10, 5, 1];
      const result = calculateMaxDrawdown(values);
      
      expect(result).toBe(99);
    });

    it('should handle total loss', () => {
      const values = [100, 50, 0];
      const result = calculateMaxDrawdown(values);
      
      expect(result).toBe(100);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should calculate typical equity drawdown', () => {
      const values = [100, 105, 103, 108, 102, 98, 95, 92, 94, 96, 98, 100];
      const result = calculateMaxDrawdown(values);
      
      expect(result).toBeGreaterThan(10);
      expect(result).toBeLessThan(20);
    });

    it('should calculate flash crash scenario', () => {
      const values = [100, 101, 102, 60, 65, 70, 75, 80];
      const result = calculateMaxDrawdown(values);
      
      expect(result).toBeCloseTo(41.1765, 2);
    });

    it('should handle V-shaped recovery', () => {
      const values = [100, 95, 85, 75, 70, 75, 85, 95, 100, 105];
      const result = calculateMaxDrawdown(values);
      
      expect(result).toBe(30);
    });

    it('should handle W-shaped recovery', () => {
      const values = [100, 85, 90, 80, 95, 85, 100, 105];
      const result = calculateMaxDrawdown(values);
      
      expect(result).toBe(20);
    });
  });
});
