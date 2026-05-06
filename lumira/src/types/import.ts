/**
 * 数据导入相关类型定义
 */

import type { FundType } from "./index";

/** 导入预览项 */
export interface ImportPreviewItem {
  id: string;
  fundId: string;
  fundName: string;
  fundType?: FundType;
  totalShares: number;
  avgCost: number;
  totalCost: number;
  channel?: string;
  group?: string;
  valid: boolean;
  errors: string[];
  rawData?: Record<string, unknown>;
}

/** Excel导入行 */
export interface ExcelRow {
  fundName: string;
  fundCode: string;
  shares: number;
  avgCost: number;
  nav?: number;
  valid: boolean;
  errors: string[];
  source?: "alipay" | "wechat" | "ant" | "unknown";
}

/** OCR识别结果 */
export interface OcrResult {
  fundName: string;
  fundCode: string;
  shares: number;
  avgCost: number;
  confidence: number;
  rawText: string;
  valid: boolean;
  errors: string[];
}

/** 导入来源类型 */
export type ImportSource = "search" | "manual" | "excel" | "ocr";

/** 导入结果统计 */
export interface ImportStats {
  total: number;
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}

/** 基金类型选项 */
export const FUND_TYPE_OPTIONS: { value: FundType; label: string }[] = [
  { value: "STOCK", label: "股票型" },
  { value: "BOND", label: "债券型" },
  { value: "MIX", label: "混合型" },
  { value: "INDEX", label: "指数型" },
  { value: "QDII", label: "QDII" },
  { value: "FOF", label: "FOF" },
  { value: "MONEY", label: "货币型" },
];

/** 购买渠道选项 */
export const CHANNEL_OPTIONS = [
  { value: "", label: "请选择" },
  { value: "蚂蚁财富", label: "蚂蚁财富" },
  { value: "天天基金", label: "天天基金" },
  { value: "且慢", label: "且慢" },
  { value: "招商银行", label: "招商银行" },
  { value: "其他", label: "其他" },
];

/** OCR模式 */
export type OcrMode = "client" | "cloud";

/** 百度OCR配置 */
export interface BaiduOcrConfig {
  apiKey: string;
  secretKey: string;
  accessToken?: string;
  expiresAt?: number;
}

/** Excel列映射配置 */
export interface ExcelColumnMapping {
  fundName: string[];
  fundCode: string[];
  shares: string[];
  avgCost: string[];
  nav: string[];
}

/** 平台特定的列名映射 */
export const PLATFORM_MAPPINGS: Record<string, ExcelColumnMapping> = {
  alipay: {
    fundName: ["基金名称", "产品名称", "名称"],
    fundCode: ["基金代码", "产品代码", "代码"],
    shares: ["持有份额", "份额", "持有数量"],
    avgCost: ["持仓成本价", "成本单价", "成本价", "买入均价"],
    nav: ["当前净值", "最新净值", "净值"],
  },
  wechat: {
    fundName: ["产品名称", "基金名称", "名称"],
    fundCode: ["产品代码", "基金代码", "代码"],
    shares: ["持有数量", "持有份额", "份额"],
    avgCost: ["成本单价", "持仓成本价", "成本价"],
    nav: ["当前净值", "最新净值", "净值"],
  },
  ant: {
    fundName: ["基金名称", "产品名称", "名称"],
    fundCode: ["基金代码", "产品代码", "代码"],
    shares: ["持有份额", "份额", "持有数量"],
    avgCost: ["成本单价", "持仓成本价", "成本价"],
    nav: ["当前净值", "最新净值", "净值"],
  },
};
