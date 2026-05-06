import { redis, CACHE_TTL } from '../../config/redis';
import { logger } from '../../utils/logger';

export interface FundSearchResult {
  code: string;
  name: string;
  type: string;
}

export interface FundEstimate {
  fundId: string;
  fundName: string;
  estimateNav: number;
  estimateTime: string;
  estimateChange: number;
  estimateChangePercent: number;
  lastNav: number;
  lastNavDate: string;
}

export interface FundDetail {
  code: string;
  name: string;
  type: string;
  riskLevel: string;
  company: string;
  managerName?: string | undefined;
  nav: number;
  accumNav: number;
  navDate: string;
  feeRateBuy: number;
  feeRateSell: number;
  feeRateMgmt: number;
  feeRateCustody?: number | undefined;
  scale?: number | undefined;
  establishDate?: string | undefined;
}

let fundListCache: FundSearchResult[] | null = null;
let fundListCacheTime = 0;
const FUND_LIST_CACHE_TTL = 24 * 60 * 60 * 1000;

export class EastmoneyService {
  async searchFunds(query: string, limit: number = 10): Promise<FundSearchResult[]> {
    const cacheKey = `fund:search:${query}:${limit}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const fundList = await this.getFundList();
      const lowerQuery = query.toLowerCase();
      const results = fundList
        .filter(fund => 
          fund.code.toLowerCase().includes(lowerQuery) ||
          fund.name.toLowerCase().includes(lowerQuery)
        )
        .slice(0, limit);

      await redis.setex(cacheKey, CACHE_TTL.FUND_SEARCH, JSON.stringify(results));
      return results;
    } catch (error) {
      logger.error('Error searching funds from Eastmoney:', error);
      throw new Error('Failed to search funds');
    }
  }

  private async getFundList(): Promise<FundSearchResult[]> {
    if (fundListCache && Date.now() - fundListCacheTime < FUND_LIST_CACHE_TTL) {
      return fundListCache;
    }

    const redisCached = await redis.get('fund:list:all');
    if (redisCached) {
      const parsed = JSON.parse(redisCached) as FundSearchResult[];
      fundListCache = parsed;
      fundListCacheTime = Date.now();
      return parsed;
    }

    try {
      const response = await fetch(
        'http://fund.eastmoney.com/js/fundcode_search.js',
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://fund.eastmoney.com/',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Eastmoney API error: ${response.status}`);
      }

      const text = await response.text();
      const match = text.match(/var\s+\w+\s*=\s*(\[\[.*?\]\]);/s);
      if (!match) {
        throw new Error('Failed to parse fund list');
      }

      const fundArray = JSON.parse(match[1]) as Array<[string, string, string, string, string]>;
      const funds: FundSearchResult[] = fundArray.map(item => ({
        code: item[0],
        name: item[1],
        type: item[3] || 'UNKNOWN',
      }));

      fundListCache = funds;
      fundListCacheTime = Date.now();
      await redis.setex('fund:list:all', 24 * 60 * 60, JSON.stringify(funds));
      return funds;
    } catch (error) {
      logger.error('Error fetching fund list:', error);
      throw new Error('Failed to fetch fund list');
    }
  }

  async getFundEstimate(fundId: string): Promise<FundEstimate | null> {
    const cacheKey = `fund:estimate:${fundId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const response = await fetch(
        `https://fundgz.1234567.com.cn/js/${fundId}.js?rt=${Date.now()}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://fund.eastmoney.com/',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Eastmoney API error: ${response.status}`);
      }

      const text = await response.text();
      const match = text.match(/jsonpgz\((.+?)\);?$/);
      if (!match) {
        return null;
      }

      const data = JSON.parse(match[1]) as {
        fundcode: string;
        name: string;
        gsz: string;
        gztime: string;
        gszzl: string;
        dwjz: string;
        jzrq: string;
      };

      const estimate: FundEstimate = {
        fundId: data.fundcode,
        fundName: data.name,
        estimateNav: parseFloat(data.gsz),
        estimateTime: data.gztime,
        estimateChange: parseFloat(data.gszzl) / 100,
        estimateChangePercent: parseFloat(data.gszzl),
        lastNav: parseFloat(data.dwjz),
        lastNavDate: data.jzrq,
      };

      await redis.setex(cacheKey, CACHE_TTL.FUND_ESTIMATE, JSON.stringify(estimate));
      return estimate;
    } catch (error) {
      logger.error(`Error getting fund estimate for ${fundId}:`, error);
      return null;
    }
  }

  async getFundDetail(fundId: string): Promise<FundDetail | null> {
    const cacheKey = `fund:detail:${fundId}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const response = await fetch(
        `https://fundmobapi.eastmoney.com/FundMNewApi/FundMNDetailInformation?FCODE=${fundId}&deviceid=Wap&plat=Wap&product=EFund&version=2.0.0&_=${Date.now()}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
            'Referer': 'https://mpservice.com/',
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Eastmoney API error: ${response.status}`);
      }

      const data = await response.json() as {
        Datas?: {
          FCODE: string;
          SHORTNAME: string;
          FTYPE?: string;
          RLEVEL_SZ?: string;
          JJGS?: string;
          JJJL?: string;
          ENDNAV?: string;
          ESTABDATE?: string;
          MGREXP?: string;
          TRUSTEXP?: string;
        }
      };

      if (!data.Datas) {
        return null;
      }

      const d = data.Datas;
      const estimate = await this.getFundEstimate(fundId);

      const detail: FundDetail = {
        code: fundId,
        name: d.SHORTNAME,
        type: d.FTYPE || '混合型',
        riskLevel: this.mapRiskLevel(d.RLEVEL_SZ),
        company: d.JJGS || '',
        managerName: d.JJJL,
        nav: estimate?.lastNav || 0,
        accumNav: estimate?.lastNav || 0,
        navDate: estimate?.lastNavDate || '',
        feeRateBuy: 0.015,
        feeRateSell: 0.005,
        feeRateMgmt: parseFloat(d.MGREXP?.replace('%', '') || '1.5') / 100,
        feeRateCustody: parseFloat(d.TRUSTEXP?.replace('%', '') || '0.25') / 100,
        scale: d.ENDNAV ? parseFloat(d.ENDNAV) : undefined,
        establishDate: d.ESTABDATE,
      };

      await redis.setex(cacheKey, CACHE_TTL.FUND_DETAIL, JSON.stringify(detail));
      return detail;
    } catch (error) {
      logger.error(`Error getting fund detail for ${fundId}:`, error);
      return null;
    }
  }

  async getFundNavHistory(
    fundId: string, 
    timeRange: string
  ): Promise<Array<{ date: string; nav: number; accumNav: number }>> {
    const cacheKey = `fund:history:${fundId}:${timeRange}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '1m':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case '3m':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case '6m':
          startDate.setMonth(startDate.getMonth() - 6);
          break;
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        case 'ytd':
          startDate.setMonth(0);
          startDate.setDate(1);
          break;
        case 'all':
        default:
          startDate.setFullYear(startDate.getFullYear() - 10);
      }

      const sdate = startDate.toISOString().split('T')[0];
      const edate = endDate.toISOString().split('T')[0];

      const response = await fetch(
        `https://fundf10.eastmoney.com/F10DataApi.aspx?type=lsjz&code=${fundId}&page=1&per=1000&sdate=${sdate}&edate=${edate}`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://fund.eastmoney.com/',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Eastmoney API error: ${response.status}`);
      }

      const text = await response.text();
      
      // Extract content from the JavaScript response (not valid JSON)
      const contentMatch = text.match(/content:"(.+?)",records:/s);
      if (!contentMatch) {
        return [];
      }
      
      // The content is HTML-escaped, need to unescape it
      const htmlContent = contentMatch[1]
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t');

      if (!htmlContent) {
        return [];
      }

      const history: Array<{ date: string; nav: number; accumNav: number }> = [];
      
      // Parse HTML table content
      const rowMatches = htmlContent.match(/<tr[^>]*>(.+?)<\/tr>/gs);
      if (rowMatches) {
        for (const row of rowMatches) {
          // Skip header row
          if (row.includes('<th')) continue;
          
          const cellMatches = row.match(/<td[^>]*>(.*?)<\/td>/gs);
          if (cellMatches && cellMatches.length >= 3) {
            // Extract text content from cells (remove HTML tags)
            const cells = cellMatches.map(cell => 
              cell.replace(/<[^>]+>/g, '').trim()
            );
            
            const date = cells[0];
            const nav = parseFloat(cells[1]) || 0;
            const accumNav = parseFloat(cells[2]) || 0;
            
            if (date && date.includes('-')) {
              history.push({ date, nav, accumNav });
            }
          }
        }
      }

      await redis.setex(cacheKey, CACHE_TTL.FUND_HISTORY, JSON.stringify(history));
      return history;
    } catch (error) {
      logger.error(`Error getting fund history for ${fundId}:`, error);
      return [];
    }
  }

  private mapRiskLevel(level?: string): string {
    const levelMap: Record<string, string> = {
      '1': 'LOW',
      '2': 'LOW_MEDIUM',
      '3': 'MEDIUM',
      '4': 'MEDIUM_HIGH',
      '5': 'HIGH',
    };
    return levelMap[level || ''] || 'MEDIUM';
  }
}

export const eastmoneyService = new EastmoneyService();
