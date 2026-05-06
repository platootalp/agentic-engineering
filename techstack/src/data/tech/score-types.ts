/**
 * TechStack Panorama - 技术评分类型定义
 * 
 * 多维度评分系统，用于量化评估技术栈的综合实力
 */

/**
 * 技术评分维度（0-100分制）
 */
export interface TechScores {
  /** 流行度：GitHub Stars、npm下载量等（权重30%） */
  popularity: number
  
  /** 维护活跃度：提交频率、Issue响应速度等（权重25%） */
  maintenance: number
  
  /** 社区生态：周边工具、插件数量、文档质量（权重20%） */
  ecosystem: number
  
  /** 学习曲线：入门难度，越高越简单（权重15%） */
  learningCurve: number
  
  /** 企业采用：知名企业使用数量（权重10%） */
  enterpriseAdoption: number
  
  /** 加权总分（自动计算） */
  total: number
  
  /** 上次计算日期（ISO 8601格式） */
  lastCalculated: string
}

/**
 * 评分权重配置
 */
export interface ScoreWeights {
  popularity: number
  maintenance: number
  ecosystem: number
  learningCurve: number
  enterpriseAdoption: number
}

/**
 * 默认权重配置
 */
export const DEFAULT_WEIGHTS: ScoreWeights = {
  popularity: 0.30,
  maintenance: 0.25,
  ecosystem: 0.20,
  learningCurve: 0.15,
  enterpriseAdoption: 0.10
}

/**
 * 评分阈值配置
 */
export interface ScoreThresholds {
  /** 可见性阈值：总分 >= 此值时默认展示 */
  visible: number
  
  /** 新兴技术阈值：维护活跃度 >= 此值且总分 < visible 时标记为新兴 */
  emerging: number
}

/**
 * 默认阈值配置
 */
export const DEFAULT_THRESHOLDS: ScoreThresholds = {
  visible: 70,
  emerging: 60
}

/**
 * 评分元数据（原始数据来源）
 */
export interface ScoreMetadata {
  /** GitHub Stars 数量 */
  githubStars: number
  
  /** npm 周下载量（前端/Node.js技术） */
  npmDownloads?: number
  
  /** 最近提交日期 */
  lastCommitDate: string
  
  /** 开放 Issue 数量 */
  openIssues: number
  
  /** 已关闭 Issue 数量 */
  closedIssues: number
}

/**
 * 评分维度说明（用于UI展示）
 */
export const SCORE_DIMENSIONS = {
  popularity: {
    name: '流行度',
    description: '基于GitHub Stars和npm下载量',
    weight: '30%'
  },
  maintenance: {
    name: '维护活跃度',
    description: '最近提交频率和Issue响应速度',
    weight: '25%'
  },
  ecosystem: {
    name: '社区生态',
    description: '周边工具数量和文档质量',
    weight: '20%'
  },
  learningCurve: {
    name: '学习曲线',
    description: '入门难度（越高越简单）',
    weight: '15%'
  },
  enterpriseAdoption: {
    name: '企业采用',
    description: '知名企业使用数量',
    weight: '10%'
  }
} as const

/**
 * 评分等级
 */
export type ScoreLevel = 'excellent' | 'good' | 'average' | 'poor'

/**
 * 获取评分等级
 */
export function getScoreLevel(score: number): ScoreLevel {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'average'
  return 'poor'
}

/**
 * 获取星级评分（1-5星）
 */
export function getStarRating(score: number): number {
  return Math.max(1, Math.min(5, Math.round(score / 20)))
}
