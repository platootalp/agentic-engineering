/**
 * 基金数据服务
 * 
 * Skills: fund-data-fetch
 * Agent: backend-engineer
 */

import type { Fund, FundEstimate, FundNavHistory } from "@/types";
import { fundDb } from "@/lib/db";
import {
  searchFundsFromEastMoney,
  getFundEstimateFromEastMoney,
  batchGetEstimates,
  getFundNavHistory
} from "@/lib/eastmoney-api";

// 缓存时间配置 (毫秒)
const CACHE_DURATION = {
  SEARCH: 5 * 60 * 1000,      // 搜索结果5分钟
  ESTIMATE: 30 * 1000,        // 估值30秒
  NAV_HISTORY: 60 * 60 * 1000 // 净值历史1小时
};

// ==================== 搜索 ====================

/**
 * 搜索基金
 */
export async function searchFunds(query: string): Promise<Fund[]> {
  if (!query || query.length < 2) {
    return [];
  }
  
  try {
    return await searchFundsFromEastMoney(query);
  } catch (error) {
    console.error("搜索失败:", error);
    throw error;
  }
}

// ==================== 估值 ====================

/**
 * 获取基金实时估值（带缓存）
 */
export async function getFundEstimate(fundCode: string): Promise<FundEstimate> {
  // 检查本地缓存
  const cached = await fundDb.get(fundCode);
  const now = Date.now();
  
  if (cached?.estimateNav && cached?.updatedAt) {
    const cacheAge = now - cached.updatedAt.getTime();
    if (cacheAge < CACHE_DURATION.ESTIMATE) {
      return {
        fundId: cached.id,
        fundName: cached.name,
        estimateNav: cached.estimateNav,
        estimateTime: cached.estimateTime || "",
        estimateChange: cached.estimateChange || 0,
        estimateChangePercent: cached.estimateChangePercent || 0,
        lastNav: cached.nav,
        lastNavDate: cached.navDate,
        source: "cache",
        cached: true
      };
    }
  }
  
  // 获取实时数据
  try {
    const estimate = await getFundEstimateFromEastMoney(fundCode);
    
    // 更新缓存
    if (cached) {
      await fundDb.put({
        ...cached,
        estimateNav: estimate.estimateNav,
        estimateTime: estimate.estimateTime,
        estimateChange: estimate.estimateChange,
        estimateChangePercent: estimate.estimateChangePercent,
        nav: estimate.lastNav,
        navDate: estimate.lastNavDate,
        updatedAt: new Date()
      });
    }
    
    return estimate;
  } catch (error) {
    // 如果有缓存，即使过期也返回
    if (cached?.estimateNav) {
      return {
        fundId: cached.id,
        fundName: cached.name,
        estimateNav: cached.estimateNav,
        estimateTime: cached.estimateTime || "",
        estimateChange: cached.estimateChange || 0,
        estimateChangePercent: cached.estimateChangePercent || 0,
        lastNav: cached.nav,
        lastNavDate: cached.navDate,
        source: "cache",
        cached: true
      };
    }
    throw error;
  }
}

/**
 * 批量获取基金估值
 */
export async function getBatchEstimates(fundCodes: string[]): Promise<Map<string, FundEstimate>> {
  return batchGetEstimates(fundCodes);
}

// ==================== 净值历史 ====================

/**
 * 获取基金净值历史
 */
export async function fetchNavHistory(
  fundCode: string,
  days = 365
): Promise<FundNavHistory> {
  try {
    const history = await getFundNavHistory(fundCode, days);
    return {
      fundId: fundCode,
      history: history.map(h => ({
        date: h.date,
        nav: h.nav,
        accumNav: h.accumNav,
        changePercent: h.change
      }))
    };
  } catch (error) {
    console.error("获取净值历史失败:", error);
    return { fundId: fundCode, history: [] };
  }
}

/**
 * 获取基金昨日净值
 */
export async function getFundYesterdayNav(fundCode: string): Promise<number | null> {
  try {
    const history = await fetchNavHistory(fundCode, 2);
    if (history.history.length >= 2) {
      return history.history[history.history.length - 2].nav;
    }
    return null;
  } catch (error) {
    console.error("获取昨日净值失败:", error);
    return null;
  }
}

// ==================== 工具函数 ====================

/**
 * 计算预估收益
 */
export function calculateEstimateProfit(
  shares: number,
  avgCost: number,
  estimateNav: number,
  yesterdayNav?: number | null
): {
  marketValue: number;
  profit: number;
  profitRate: number;
  todayProfit: number;
} {
  const marketValue = shares * estimateNav;
  const cost = shares * avgCost;
  const profit = marketValue - cost;
  const profitRate = cost > 0 ? (profit / cost) * 100 : 0;

  let todayProfit = 0;
  if (yesterdayNav && yesterdayNav > 0) {
    todayProfit = shares * (estimateNav - yesterdayNav);
  }

  return {
    marketValue: Math.round(marketValue * 100) / 100,
    profit: Math.round(profit * 100) / 100,
    profitRate: Math.round(profitRate * 100) / 100,
    todayProfit: Math.round(todayProfit * 100) / 100,
  };
}
