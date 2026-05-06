/**
 * 基金计算工具
 * 
 * Skills: calculate-xirr
 * 基于 Newton-Raphson 方法实现 XIRR 计算
 */

import Decimal from 'decimal.js';
import type { CashFlow, XIRRResult } from '@/types';

// ============================================
// XIRR 计算
// ============================================

/**
 * 计算 XIRR (扩展内部收益率)
 * 
 * @param cashflows - 现金流记录
 * @param guess - 初始猜测值 (默认 0.1)
 * @returns XIRR 计算结果
 * 
 * 公式: Σ(CF_i / (1 + r)^((d_i - d_0) / 365)) = 0
 */
export function calculateXIRR(
  cashflows: CashFlow[],
  guess = 0.1
): XIRRResult {
  // 验证输入
  if (cashflows.length < 2) {
    return {
      xirr: null,
      irr: null,
      days: 0,
      totalInvested: 0,
      totalRedeemed: 0,
      profit: 0,
      error: '至少需要2笔现金流记录'
    };
  }

  // 按日期排序
  const sortedFlows = [...cashflows].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const startDate = new Date(sortedFlows[0].date);
  const endDate = new Date(sortedFlows[sortedFlows.length - 1].date);
  const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  // 计算总投入和赎回
  const totalInvested = sortedFlows
    .filter(f => f.amount > 0)
    .reduce((sum, f) => sum + f.amount, 0);
  
  const totalRedeemed = sortedFlows
    .filter(f => f.amount < 0)
    .reduce((sum, f) => sum + Math.abs(f.amount), 0);

  const profit = totalRedeemed - totalInvested;

  try {
    // Newton-Raphson 迭代
    const maxIterations = 100;
    const epsilon = 1e-7;
    let rate = guess;

    for (let i = 0; i < maxIterations; i++) {
      const npv = calculateNPV(sortedFlows, rate, startDate);
      const derivative = calculateNPVDerivative(sortedFlows, rate, startDate);

      if (Math.abs(npv) < epsilon) {
        const annualizedRate = (Math.pow(1 + rate, 365) - 1);
        return {
          xirr: parseFloat((annualizedRate * 100).toFixed(4)),
          irr: parseFloat((rate * 100).toFixed(4)),
          days,
          totalInvested,
          totalRedeemed,
          profit
        };
      }

      if (Math.abs(derivative) < epsilon) {
        break;
      }

      const newRate = rate - npv / derivative;
      if (Math.abs(newRate - rate) < epsilon) {
        const annualizedRate = (Math.pow(1 + newRate, 365) - 1);
        return {
          xirr: parseFloat((annualizedRate * 100).toFixed(4)),
          irr: parseFloat((newRate * 100).toFixed(4)),
          days,
          totalInvested,
          totalRedeemed,
          profit
        };
      }
      rate = newRate;
    }

    // 迭代未收敛
    return {
      xirr: null,
      irr: null,
      days,
      totalInvested,
      totalRedeemed,
      profit,
      error: 'XIRR 计算未收敛，请检查现金流数据'
    };
  } catch (error) {
    return {
      xirr: null,
      irr: null,
      days,
      totalInvested,
      totalRedeemed,
      profit,
      error: `计算错误: ${(error as Error).message}`
    };
  }
}

/**
 * 计算 NPV
 */
function calculateNPV(
  cashflows: CashFlow[],
  rate: number,
  startDate: Date
): number {
  return cashflows.reduce((sum, flow) => {
    const days = Math.floor(
      (new Date(flow.date).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const years = days / 365;
    return sum + flow.amount / Math.pow(1 + rate, years);
  }, 0);
}

/**
 * 计算 NPV 导数
 */
function calculateNPVDerivative(
  cashflows: CashFlow[],
  rate: number,
  startDate: Date
): number {
  return cashflows.reduce((sum, flow) => {
    const days = Math.floor(
      (new Date(flow.date).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const years = days / 365;
    return sum - (years * flow.amount) / Math.pow(1 + rate, years + 1);
  }, 0);
}

// ============================================
// 基金收益计算
// ============================================

/**
 * 计算持仓收益
 * 
 * @param shares - 持有份额
 * @param avgCost - 平均成本
 * @param currentNav - 当前净值
 * @returns 收益计算结果
 */
export function calculateHoldingProfit(
  shares: number,
  avgCost: number,
  currentNav: number
): {
  marketValue: number;
  cost: number;
  profit: number;
  profitRate: number;
} {
  const cost = new Decimal(avgCost).times(shares);
  const marketValue = new Decimal(currentNav).times(shares);
  const profit = marketValue.minus(cost);
  const profitRate = cost.isZero() 
    ? new Decimal(0) 
    : profit.dividedBy(cost).times(100);

  return {
    marketValue: parseFloat(marketValue.toFixed(4)),
    cost: parseFloat(cost.toFixed(4)),
    profit: parseFloat(profit.toFixed(4)),
    profitRate: parseFloat(profitRate.toFixed(4))
  };
}

/**
 * 计算定投收益率
 * 
 * @param monthlyAmount - 每月定投金额
 * @param months - 定投月数
 * @param finalValue - 最终资产价值
 * @returns 收益率
 */
export function calculateRegularInvestReturn(
  monthlyAmount: number,
  months: number,
  finalValue: number
): {
  totalInvested: number;
  totalReturn: number;
  returnRate: number;
} {
  const totalInvested = monthlyAmount * months;
  const totalReturn = finalValue - totalInvested;
  const returnRate = (totalReturn / totalInvested) * 100;

  return {
    totalInvested,
    totalReturn,
    returnRate: parseFloat(returnRate.toFixed(4))
  };
}

// ============================================
// 风险指标计算
// ============================================

/**
 * 计算波动率 (Volatility)
 * 
 * @param returns - 收益率数组(%)
 * @returns 年化波动率(%)
 */
export function calculateVolatility(returns: number[]): number {
  if (returns.length < 2) return 0;

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
  const stdDev = Math.sqrt(variance);
  
  // 年化波动率 (假设日收益率)
  const annualVol = stdDev * Math.sqrt(252);
  
  return parseFloat(annualVol.toFixed(4));
}

/**
 * 计算夏普比率
 * 
 * @param returns - 收益率数组(%)
 * @param riskFreeRate - 无风险利率(%)，默认 3%
 * @returns 夏普比率
 */
export function calculateSharpeRatio(
  returns: number[],
  riskFreeRate = 3
): number {
  if (returns.length < 2) return 0;

  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const volatility = calculateVolatility(returns);

  if (volatility === 0) return 0;

  const sharpe = (avgReturn * 252 - riskFreeRate) / volatility;
  return parseFloat(sharpe.toFixed(4));
}

/**
 * 计算最大回撤
 * 
 * @param values - 资产价值数组
 * @returns 最大回撤(%)
 */
export function calculateMaxDrawdown(values: number[]): number {
  if (values.length < 2) return 0;

  let maxDrawdown = 0;
  let peak = values[0];

  for (const value of values) {
    if (value > peak) {
      peak = value;
    }
    const drawdown = (peak - value) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return parseFloat((maxDrawdown * 100).toFixed(4));
}

// ============================================
// 格式化工具
// ============================================

/**
 * 格式化金额
 */
export function formatMoney(amount: number): string {
  if (Math.abs(amount) >= 100000000) {
    return `${(amount / 100000000).toFixed(2)}亿`;
  }
  if (Math.abs(amount) >= 10000) {
    return `${(amount / 10000).toFixed(2)}万`;
  }
  return amount.toFixed(2);
}

interface FormattedReturn {
  text: string;
  color: string;
}

/**
 * 格式化收益率
 */
export function formatReturn(rate: number): FormattedReturn {
  const sign = rate >= 0 ? '+' : '';
  const color = rate >= 0 ? 'text-red-500' : 'text-green-500';
  return { text: `${sign}${rate.toFixed(2)}%`, color };
}

/**
 * 格式化日期
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}


