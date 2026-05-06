/**
 * TechStack Panorama - 评分配置
 * 
 * 评分系统的权重和阈值配置
 */

import type { ScoreWeights, ScoreThresholds } from '@/data/tech/score-types'

/**
 * 默认权重配置
 * 总和应为 1.0
 */
export const DEFAULT_WEIGHTS: ScoreWeights = {
  popularity: 0.30,        // 流行度 30%
  maintenance: 0.25,       // 维护活跃度 25%
  ecosystem: 0.20,         // 社区生态 20%
  learningCurve: 0.15,     // 学习曲线 15%
  enterpriseAdoption: 0.10 // 企业采用 10%
}

/**
 * 默认阈值配置
 */
export const DEFAULT_THRESHOLDS: ScoreThresholds = {
  visible: 70,   // 可见性阈值：总分 >= 70 默认展示
  emerging: 60   // 新兴技术阈值：维护活跃度 >= 60
}

/**
 * 评分维度详细信息（用于UI展示）
 */
export const SCORE_DIMENSIONS_INFO = {
  popularity: {
    name: '流行度',
    description: '基于GitHub Stars和npm下载量',
    weight: '30%',
    icon: 'trending-up'
  },
  maintenance: {
    name: '维护活跃度',
    description: '最近提交频率和Issue响应速度',
    weight: '25%',
    icon: 'activity'
  },
  ecosystem: {
    name: '社区生态',
    description: '周边工具数量和文档质量',
    weight: '20%',
    icon: 'package'
  },
  learningCurve: {
    name: '学习曲线',
    description: '入门难度（越高越简单）',
    weight: '15%',
    icon: 'graduation-cap'
  },
  enterpriseAdoption: {
    name: '企业采用',
    description: '知名企业使用数量',
    weight: '10%',
    icon: 'building-2'
  }
} as const

/**
 * 评分等级配置
 */
export const SCORE_LEVELS = {
  excellent: {
    min: 80,
    label: '优秀',
    color: '#22c55e',
    bgColor: 'bg-green-500',
    textColor: 'text-green-500'
  },
  good: {
    min: 60,
    label: '良好',
    color: '#3b82f6',
    bgColor: 'bg-blue-500',
    textColor: 'text-blue-500'
  },
  average: {
    min: 40,
    label: '一般',
    color: '#f59e0b',
    bgColor: 'bg-amber-500',
    textColor: 'text-amber-500'
  },
  poor: {
    min: 0,
    label: '较差',
    color: '#ef4444',
    bgColor: 'bg-red-500',
    textColor: 'text-red-500'
  }
} as const
