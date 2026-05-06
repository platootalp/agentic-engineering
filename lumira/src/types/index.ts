// ============================================
// 基金投资助手 - 核心类型定义
// 基于 PRD 数据模型设计
// ============================================

// ----------------------------------------
// 枚举类型（使用 Union Type）
// ----------------------------------------

/** 基金类型 */
export type FundType = 
  | 'STOCK'      // 股票型
  | 'BOND'       // 债券型
  | 'MIX'        // 混合型
  | 'INDEX'      // 指数型
  | 'QDII'       // QDII
  | 'FOF'        // FOF
  | 'MONEY';     // 货币型

/** 风险等级 */
export type RiskLevel =
  | 'LOW'          // 低风险
  | 'LOW_MEDIUM'   // 中低风险
  | 'MEDIUM'       // 中等风险
  | 'MEDIUM_HIGH'  // 中高风险
  | 'HIGH';        // 高风险

/** 交易类型 */
export type TransactionType = 'BUY' | 'SELL' | 'DIVIDEND';

/** 时间范围 */
export type TimeRange = '1m' | '3m' | '6m' | '1y' | 'ytd' | 'all';

// ----------------------------------------
// 基金相关类型
// ----------------------------------------

/** 基金基础信息 */
export interface Fund {
  id: string;                    // 基金代码 (6位)
  name: string;                  // 基金名称
  type: FundType;                // 基金类型
  riskLevel: RiskLevel;          // 风险等级
  company: string;               // 基金公司
  managerId: string;             // 基金经理ID
  managerName?: string;          // 基金经理姓名
  nav: number;                   // 最新单位净值
  accumNav: number;              // 累计净值
  navDate: string;               // 净值日期 (YYYY-MM-DD)
  estimateNav?: number;          // 估算净值（实时）
  estimateTime?: string;         // 估算时间
  estimateChange?: number;       // 估算涨跌额
  estimateChangePercent?: number;// 估算涨跌幅(%)
  feeRate: {
    buy: number;                 // 申购费率
    sell: number;                // 赎回费率
    management: number;          // 管理费率
    custody?: number;            // 托管费率
  };
  scale?: number;                // 基金规模(亿元)
  establishDate?: string;        // 成立日期
  createdAt: Date;
  updatedAt: Date;
}

/** 基金净值历史 */
export interface FundNavHistory {
  fundId: string;
  history: Array<{
    date: string;                // 日期
    nav: number;                 // 单位净值
    accumNav: number;            // 累计净值
    change?: number;             // 日涨跌额
    changePercent?: number;      // 日涨跌幅
  }>;
}

/** 基金实时估值 */
export interface FundEstimate {
  fundId: string;
  fundName: string;
  estimateNav: number;
  estimateTime: string;
  estimateChange: number;
  estimateChangePercent: number;
  lastNav: number;
  lastNavDate: string;
  source: string;
  cached: boolean;
}

// ----------------------------------------
// 持仓相关类型
// ----------------------------------------

/** 持仓记录 */
export interface Holding {
  id: string;                    // 唯一ID
  fundId: string;                // 基金代码
  fundName: string;              // 基金名称
  fundType?: FundType;           // 基金类型
  totalShares: number;           // 总份额
  avgCost: number;               // 平均成本价
  totalCost: number;             // 总成本
  channel?: string;              // 购买渠道
  group?: string;                // 分组
  tags?: string[];               // 标签
  createdAt: Date;
  updatedAt: Date;
  version: number;               // 数据版本
}

/** 扩展持仓（含实时数据） */
export interface HoldingWithEstimate extends Holding {
  estimateNav?: number | undefined;          // 实时估值
  estimateTime?: string | undefined;         // 估值时间
  marketValue: number;           // 市值
  profit: number;                // 盈亏金额
  profitRate: number;            // 盈亏率(%)
  todayProfit: number;           // 今日预估盈亏
}

// ----------------------------------------
// 交易记录类型
// ----------------------------------------

/** 交易记录 */
export interface Transaction {
  id: string;
  holdingId: string;
  fundId: string;
  fundName?: string;
  type: TransactionType;
  date: string;                  // 交易日期 (YYYY-MM-DD)
  shares: number;                // 份额
  price: number;                 // 单价
  amount: number;                // 总金额
  fee: number;                   // 手续费
  notes?: string;
  createdAt: Date;
}

/** 交易记录输入 */
export interface TransactionInput {
  fundId: string;
  type: TransactionType;
  date: string;
  shares: number;
  price: number;
  fee?: number;
  notes?: string;
}

// ----------------------------------------
// 投资组合分析类型
// ----------------------------------------

/** 投资组合概览 */
export interface PortfolioSummary {
  totalAssets: number;           // 总资产
  totalCost: number;             // 总成本
  totalProfit: number;           // 总收益
  totalProfitRate: number;       // 总收益率(%)
  todayProfit: number;           // 今日预估收益
  todayProfitRate: number;       // 今日预估收益率
  availableFunds: number;        // 可用资金
  holdingCount: number;          // 持仓数量
}

/** 资产配置 */
export interface AssetAllocation {
  byType: AllocationItem[];      // 按类型
  byRisk: AllocationItem[];      // 按风险
  byChannel: AllocationItem[];   // 按渠道
  byGroup: AllocationItem[];     // 按分组
}

/** 配置项 */
export interface AllocationItem {
  key: string;
  name: string;
  amount: number;
  percentage: number;
  count: number;
}

/** 绩效指标 */
export interface PerformanceMetrics {
  totalReturn: number;           // 累计收益(%)
  annualizedReturn: number;      // 年化收益 XIRR(%)
  volatility: number;            // 波动率(%)
  sharpeRatio: number;           // 夏普比率
  maxDrawdown: number;           // 最大回撤(%)
  winRate: number;               // 胜率(%)
  profitLossRatio: number;       // 盈亏比
}

/** 收益贡献排名 */
export interface TopHolding {
  fundId: string;
  fundName: string;
  profit: number;
  profitRate: number;
  contribution: number;          // 对总收益的贡献比例(%)
  marketValue: number;
  percentage: number;            // 占组合比例(%)
}

/** 投资组合分析结果 */
export interface PortfolioAnalysis {
  summary: PortfolioSummary;
  allocation: AssetAllocation;
  performance: PerformanceMetrics;
  topHoldings: TopHolding[];
  bottomHoldings: TopHolding[];
  date: string;
}

// ----------------------------------------
// 收益计算类型
// ----------------------------------------

/** 现金流记录（用于XIRR） */
export interface CashFlow {
  date: string;                  // ISO日期
  amount: number;                // 正数=投入，负数=收入/赎回
}

/** XIRR计算结果 */
export interface XIRRResult {
  xirr: number | null;           // 年化收益率
  irr: number | null;            // 周期收益率
  days: number;                  // 投资天数
  totalInvested: number;         // 总投入
  totalRedeemed: number;         // 总赎回
  profit: number;                // 总收益
  error?: string;                // 错误信息
}

// ----------------------------------------
// API响应类型
// ----------------------------------------

/** API统一响应 */
export type ApiResponse<T> =
  | { success: true; data: T; meta?: ResponseMeta }
  | { success: false; error: ApiError };

/** 响应元数据 */
export interface ResponseMeta {
  cached: boolean;
  timestamp: string;
  source?: string;
}

/** API错误 */
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

// ----------------------------------------
// UI组件类型
// ----------------------------------------

/** 图表数据 */
export interface ChartData {
  dates: string[];
  values: number[];
  profits?: number[];
  benchmark?: number[];
}

/** 收益日历数据 */
export interface ProfitCalendarData {
  year: number;
  month: number;
  data: Array<{
    date: string;
    profit: number;
    profitRate: number;
  }>;
}

/** 基金对比项 */
export interface FundCompareItem {
  fundId: string;
  fundName: string;
  nav: number;
  return1m: number;
  return3m: number;
  return6m: number;
  return1y: number;
  return3y: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

// ----------------------------------------
// 应用设置类型
// ----------------------------------------

/** 应用设置 */
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultTimeRange: TimeRange;
  refreshInterval: number;       // 刷新间隔(秒)
  showEstimateWarning: boolean;  // 显示估值警告
  hiddenFunds: string[];         // 隐藏的基金
  groups: string[];              // 自定义分组
}

/** 导入/导出数据 */
export interface ExportData {
  version: string;
  exportDate: string;
  holdings: Holding[];
  transactions: Transaction[];
  settings: AppSettings;
}
