import type { TechScores } from './score-types'

/**
 * 技术状态
 */
export type TechStatus = 'active' | 'archived'

/**
 * 技术归档原因
 */
export type ArchiveReason = 
  | 'low_popularity'      // 流行度过低
  | 'deprecated'          // 已弃用/停止维护
  | 'replaced'            // 被更好的技术替代
  | 'niche_use_case'      // 仅适用于特定场景

/**
 * 特性详情
 */
export interface FeatureDetail {
  title: string
  description: string
  codeExample?: string
}

/**
 * 学习资源
 */
export interface LearningResource {
  type: 'official' | 'tutorial' | 'video' | 'book' | 'community'
  title: string
  url: string
  description?: string
}

/**
 * 最佳实践
 */
export interface BestPractice {
  category: string
  items: string[]
}

/**
 * 竞品对比项
 */
export interface ComparisonItem {
  techId: string
  techName: string
  strengths: string[]
  weaknesses: string[]
  whenToChoose: string
}

/**
 * 适用场景
 */
export interface UseCase {
  scenario: string
  description: string
  recommended: boolean
}

/**
 * 深度内容
 */
export interface TechDeepDive {
  /** 核心特性详解 */
  features: FeatureDetail[]
  
  /** 学习资源 */
  resources: LearningResource[]
  
  /** 最佳实践 */
  bestPractices: BestPractice[]
  
  /** 竞品对比 */
  comparisons: ComparisonItem[]
  
  /** 适用场景 */
  useCases: UseCase[]
  
  /** 版本发布历史要点 */
  releaseHighlights?: string[]
  
  /** 常见问题 FAQ */
  faq?: Array<{
    question: string
    answer: string
  }>
}

export interface TechDetail {
  id: string
  name: string
  category: 'frontend' | 'backend' | 'ai' | 'infrastructure' | 'llm-algorithm' | 'llm-application' | 'storage'
  subcategory: string
  description: string
  tagline: string
  version: string
  pros: string[]
  cons: string[]
  bestFor: string[]
  notFor: string[]
  learningCurve: 'beginner' | 'intermediate' | 'advanced'
  ecosystemScore: number
  popularity: {
    githubStars: number
    npmDownloads?: number
  }
  companyUsers: string[]
  createdYear: number
  maintainedBy: string
  officialUrl: string
  githubUrl: string
  documentationUrl: string
  alternatives: string[]
  
  // ===== 评分相关字段 =====
  /** 多维度评分数据 */
  scores: TechScores
  
  // ===== 归档相关字段 =====
  /** 技术状态：active 或 archived */
  status: TechStatus
  
  /** 归档原因（仅当 status === 'archived' 时有效） */
  archiveReason?: ArchiveReason
  
  /** 归档说明（可选） */
  archiveNote?: string
  
  /** 归档日期（ISO 8601格式） */
  archivedAt?: string
  
  /** 被替代的技术ID（当 archiveReason === 'replaced' 时） */
  replacedBy?: string
  
  // ===== 深度内容 =====
  /** 详细内容（用于详情页） */
  deepDive: TechDeepDive
}

export interface TechCollection {
  [key: string]: TechDetail
}

/**
 * 技术项 - 单个技术方案
 */
export interface TechItem {
  name: string
  description: string
  popularity: 'high' | 'medium' | 'rising'
}

/**
 * 技术类别 - 包含多个技术项的类别
 */
export interface TechCategory {
  id: string
  name: string
  icon: string
  color: string
  problem: string
  description: string
  mainstream: TechItem[]
}
