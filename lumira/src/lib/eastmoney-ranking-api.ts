/**
 * 天天基金排行榜 API
 *
 * API Base: fundmobapi.eastmoney.com
 * 文档参考: 公开API端点
 */

const RANKING_API_BASE = "https://fundmobapi.eastmoney.com/FundMApi";

export interface RankingItem {
  code: string;
  name: string;
  nav: number;
  change: number;
  changePercent: number;
}

export interface RankingData {
  items: RankingItem[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 获取涨幅榜
 */
export async function getDailyRisingRanking(
  page = 1,
  pageSize = 20
): Promise<RankingData> {
  const url = `${RANKING_API_BASE}/FundRankNew.ashx?page=${page}&pagesize=${pageSize}&sort=RZDF&sorttype=desc`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
      "Referer": "https://fund.eastmoney.com/",
    },
  });

  if (!response.ok) {
    throw new Error(`获取涨幅榜失败: ${response.status}`);
  }

  const text = await response.text();
  const jsonStr = text.replace(/^var\s+\w+=/, "").replace(/;$/, "");
  const data = JSON.parse(jsonStr);

  return {
    items: (data.Datas || []).map((item: any) => ({
      code: item.FCODE,
      name: item.SHORTNAME,
      nav: parseFloat(item.NAV || 0),
      change: parseFloat(item.NAVCHG || 0),
      changePercent: parseFloat(item.RZDF || 0),
    })),
    total: parseInt(data.TotalCount || 0),
    page,
    pageSize,
  };
}

/**
 * 获取跌幅榜
 */
export async function getDailyDeclineRanking(
  page = 1,
  pageSize = 20
): Promise<RankingData> {
  const url = `${RANKING_API_BASE}/FundRankNew.ashx?page=${page}&pagesize=${pageSize}&sort=RZDF&sorttype=asc`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
      "Referer": "https://fund.eastmoney.com/",
    },
  });

  if (!response.ok) {
    throw new Error(`获取跌幅榜失败: ${response.status}`);
  }

  const text = await response.text();
  const jsonStr = text.replace(/^var\s+\w+=/, "").replace(/;$/, "");
  const data = JSON.parse(jsonStr);

  return {
    items: (data.Datas || []).map((item: any) => ({
      code: item.FCODE,
      name: item.SHORTNAME,
      nav: parseFloat(item.NAV || 0),
      change: parseFloat(item.NAVCHG || 0),
      changePercent: parseFloat(item.RZDF || 0),
    })),
    total: parseInt(data.TotalCount || 0),
    page,
    pageSize,
  };
}

/**
 * 获取热门榜（按关注人数）
 */
export async function getHotRanking(
  page = 1,
  pageSize = 20
): Promise<RankingData> {
  // 热门榜使用近1月涨幅作为替代指标
  const url = `${RANKING_API_BASE}/FundRankNew.ashx?page=${page}&pagesize=${pageSize}&sort=SYL_1Y&sorttype=desc`;

  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
      "Referer": "https://fund.eastmoney.com/",
    },
  });

  if (!response.ok) {
    throw new Error(`获取热门榜失败: ${response.status}`);
  }

  const text = await response.text();
  const jsonStr = text.replace(/^var\s+\w+=/, "").replace(/;$/, "");
  const data = JSON.parse(jsonStr);

  return {
    items: (data.Datas || []).map((item: any) => ({
      code: item.FCODE,
      name: item.SHORTNAME,
      nav: parseFloat(item.NAV || 0),
      change: parseFloat(item.NAVCHG || 0),
      changePercent: parseFloat(item.RZDF || 0),
    })),
    total: parseInt(data.TotalCount || 0),
    page,
    pageSize,
  };
}
