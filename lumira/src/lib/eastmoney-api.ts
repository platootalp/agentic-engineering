/**
 * 天天基金API封装
 * 
 * API Base: fundmobapi.eastmoney.com
 * 文档参考: 公开API端点
 */

import type { Fund, FundEstimate } from "@/types";

const API_BASE = "https://fundmobapi.eastmoney.com/FundMApi";
const FUND_GZ_BASE = "https://fundgz.1234567.com.cn/js";

/**
 * 搜索基金
 * 
 * API: /FundSearch.ashx?key={keyword}
 */
export async function searchFundsFromEastMoney(keyword: string): Promise<Fund[]> {
  const url = `${API_BASE}/FundSearch.ashx?key=${encodeURIComponent(keyword)}`;
  
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
      "Referer": "https://fund.eastmoney.com/"
    }
  });
  
  if (!response.ok) {
    throw new Error(`搜索失败: ${response.status}`);
  }
  
  const text = await response.text();
  
  // 返回格式: var ret={...}
  const jsonStr = text.replace(/^var\s+\w+=/, "").replace(/;$/, "");
  const data = JSON.parse(jsonStr);
  
  if (!data.Datas) {
    return [];
  }
  
  return data.Datas.map((item: any) => ({
    id: item.CODE,
    name: item.NAME,
    type: mapFundType(item.FTYPE),
    riskLevel: "MEDIUM", // 默认中等风险
    company: item.JJGS,
    managerId: item.JLID,
    managerName: item.JLNAME,
    nav: parseFloat(item.NAV || 0),
    accumNav: parseFloat(item.ACCNAV || 0),
    navDate: item.NAVDATE || "",
    feeRate: {
      buy: parseFloat(item.RGFEE || 0) / 100,
      sell: parseFloat(item.SHFEE || 0) / 100,
      management: parseFloat(item.GLFEE || 0) / 100,
      custody: parseFloat(item.TGFEE || 0) / 100
    },
    scale: parseFloat(item.SCALE || 0),
    establishDate: item.CLRQ,
    createdAt: new Date(),
    updatedAt: new Date()
  }));
}

/**
 * 获取基金实时估值
 * 
 * API: fundgz.1234567.com.cn/js/{code}.js
 * 返回格式: jsonpgz({...})
 */
export async function getFundEstimateFromEastMoney(fundCode: string): Promise<FundEstimate> {
  // 添加时间戳防止缓存
  const timestamp = Date.now();
  const url = `${FUND_GZ_BASE}/${fundCode}.js?_=${timestamp}`;
  
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Referer": "https://fund.eastmoney.com/"
    }
  });
  
  if (!response.ok) {
    throw new Error(`获取估值失败: ${response.status}`);
  }
  
  const text = await response.text();
  
  // 解析 jsonpgz(...) 格式
  const match = text.match(/jsonpgz\((.+?)\);?$/);
  if (!match) {
    throw new Error("无法解析估值数据");
  }
  
  const data = JSON.parse(match[1]);
  
  return {
    fundId: data.fundcode,
    fundName: data.name,
    estimateNav: parseFloat(data.gsz),
    estimateTime: data.gztime,
    estimateChange: parseFloat(data.gszzl) / 100,
    estimateChangePercent: parseFloat(data.gszzl),
    lastNav: parseFloat(data.dwjz),
    lastNavDate: data.jzrq,
    source: "eastmoney",
    cached: false
  };
}

/**
 * 批量获取基金估值
 */
export async function batchGetEstimates(fundCodes: string[]): Promise<Map<string, FundEstimate>> {
  const estimates = new Map<string, FundEstimate>();
  
  // 串行请求避免被封
  for (const code of fundCodes) {
    try {
      const estimate = await getFundEstimateFromEastMoney(code);
      estimates.set(code, estimate);
      // 延迟100ms
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.warn(`获取 ${code} 估值失败:`, error);
    }
  }
  
  return estimates;
}

/**
 * 获取基金净值历史
 * 
 * API: /FundNetDiagram.ashx?FCODE={code}&ND={days}
 */
export async function getFundNavHistory(fundCode: string, days = 365): Promise<any[]> {
  const url = `${API_BASE}/FundNetDiagram.ashx?FCODE=${fundCode}&ND=${days}`;
  
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Referer": "https://fund.eastmoney.com/"
    }
  });
  
  if (!response.ok) {
    return [];
  }
  
  const text = await response.text();
  const jsonStr = text.replace(/^var\s+\w+=/, "").replace(/;$/, "");
  const data = JSON.parse(jsonStr);
  
  return (data.Datas || []).map((item: any) => ({
    date: item.FSRQ,
    nav: parseFloat(item.NAV || 0),
    accumNav: parseFloat(item.ACCNAV || 0),
    change: parseFloat(item.NAVCHGRT || 0)
  })).reverse();
}

/**
 * 基金类型映射
 */
function mapFundType(type: string): string {
  const typeMap: Record<string, string> = {
    "股票型": "STOCK",
    "债券型": "BOND",
    "混合型": "MIX",
    "指数型": "INDEX",
    "QDII": "QDII",
    "FOF": "FOF",
    "货币型": "MONEY"
  };
  return typeMap[type] || "MIX";
}
