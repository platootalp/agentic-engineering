/**
 * JD提取器类型定义
 * 定义了职位数据、提取结果、适配器接口等核心类型
 */

/** 职位数据 */
export interface JobData {
  /** 职位名称 */
  jobName: string;
  /** 公司名称 */
  company: string;
  /** 薪资范围 */
  salary: string;
  /** 工作地点 */
  location: string;
  /** 经验要求 */
  experience: string;
  /** 学历要求 */
  education: string;
  /** 技能标签 */
  skillTags: string[];
  /** 职位描述 */
  jobDescription?: string;
  /** 招聘官姓名 */
  bossName?: string;
  /** 招聘官职位 */
  bossTitle?: string;
  /** 招聘官活跃度 */
  bossActive?: string;
  /** 公司标签（融资阶段、规模等） */
  companyTags?: string[];
  /** 是否为代招职位 */
  isAgency?: boolean;
  /** 职位链接 */
  url: string;
  /** 来源网站 */
  source: string;
  /** 提取时间 */
  extractedAt: string;
}

/** 提取结果 */
export interface ExtractionResult {
  /** 是否成功 */
  success: boolean;
  /** 页面类型 */
  pageType: 'detail' | 'list' | 'unknown';
  /** 提取的数据 */
  data: JobData | JobListData;
  /** 错误信息 */
  error?: string;
  /** 生成的Markdown */
  markdown?: string;
}

/** 职位列表数据 */
export interface JobListData {
  /** 来源页面URL */
  url: string;
  /** 提取时间 */
  extractedAt: string;
  /** 职位数量 */
  jobCount: number;
  /** 职位列表 */
  jobs: JobData[];
}

/** 批量提取结果 */
export interface BatchExtractionResult {
  /** 是否成功 */
  success: boolean;
  /** 提取的职位列表 */
  results: JobData[];
  /** 成功数量 */
  count: number;
  /** 生成的Markdown */
  markdown: string;
  /** 错误列表 */
  errors: Array<{ job: JobData; error: string }>;
  /** 错误信息 */
  error?: string;
}

/** 提取进度 */
export interface ExtractionProgress {
  /** 状态 */
  status: 'started' | 'progress' | 'waiting' | 'completed' | 'cancelled' | 'error';
  /** 当前进度 */
  current?: number;
  /** 总数 */
  total?: number;
  /** 消息 */
  message: string;
  /** 职位名称 */
  jobName?: string;
  /** 成功数量 */
  success?: number;
  /** 失败数量 */
  errors?: number;
  /** 耗时（秒） */
  duration?: number;
}

/** 网站类型 */
export type SiteType = 'zhipin' | 'lagou' | 'boss' | 'unknown';

/** 页面类型 */
export type PageType = 'detail' | 'list' | 'unknown';

/** 适配器接口 */
export interface IJobAdapter {
  /** 适配器名称 */
  readonly name: string;
  /** 支持的域名 */
  readonly hostPatterns: string[];
  /** 检测当前页面类型 */
  detectPageType(): PageType;
  /** 提取职位数据 */
  extract(): ExtractionResult;
  /** 检查是否支持当前页面 */
  isSupported(): boolean;
}

/** 提取器配置 */
export interface ExtractorConfig {
  /** 后端API地址 */
  apiBaseUrl: string;
  /** 用户Token */
  userToken?: string;
  /** 自动同步 */
  autoSync: boolean;
  /** 显示浮动按钮 */
  showFloatingButton: boolean;
}

/** API响应 */
export interface ApiResponse<T = unknown> {
  /** 是否成功 */
  success: boolean;
  /** 数据 */
  data?: T;
  /** 错误信息 */
  error?: string;
  /** 消息 */
  message?: string;
}

/** 同步到后端的职位数据 */
export interface SyncJobPayload {
  /** 职位数据 */
  job: JobData;
  /** 用户Token */
  token: string;
}

/** 存储的数据结构 */
export interface StorageData {
  /** 上次提取结果 */
  lastExtraction?: {
    type: 'detail' | 'list';
    data: JobData | JobData[];
    markdown: string;
    timestamp: string;
    count?: number;
  };
  /** 提取状态 */
  extractionStatus?: 'idle' | 'extracting' | 'completed' | 'error';
  /** 用户配置 */
  config?: ExtractorConfig;
}

/** 消息类型 */
export type MessageAction =
  | 'extract'
  | 'batchExtract'
  | 'cancelExtraction'
  | 'getStatus'
  | 'extractionProgress'
  | 'syncToApi'
  | 'getConfig'
  | 'setConfig'
  | 'extractionComplete';

/** 消息请求 */
export interface MessageRequest {
  /** 操作类型 */
  action: MessageAction;
  /** 职位列表（批量提取时使用） */
  jobs?: JobData[];
  /** 页面URL */
  pageUrl?: string;
  /** 配置 */
  config?: Partial<ExtractorConfig>;
}

/** 消息响应 */
export interface MessageResponse {
  /** 是否成功 */
  success: boolean;
  /** 数据 */
  data?: unknown;
  /** 错误信息 */
  error?: string;
}
