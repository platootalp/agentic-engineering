/**
 * TechStack Panorama - 技术评分计算器
 * 
 * 提供评分计算、可见性判断、等级评定等功能
 */

import type { TechScores, ScoreWeights, ScoreThresholds } from '@/data/tech/score-types'
import { DEFAULT_WEIGHTS, DEFAULT_THRESHOLDS } from './config'

/**
 * 计算技术综合评分
 * @param scores 各维度评分（不含total）
 * @param weights 权重配置（默认使用DEFAULT_WEIGHTS）
 * @returns 加权总分（0-100，四舍五入到整数）
 */
export function calculateTotalScore(
  scores: Omit<TechScores, 'total' | 'lastCalculated'>,
  weights: ScoreWeights = DEFAULT_WEIGHTS
): number {
  const total =
    scores.popularity * weights.popularity +
    scores.maintenance * weights.maintenance +
    scores.ecosystem * weights.ecosystem +
    scores.learningCurve * weights.learningCurve +
    scores.enterpriseAdoption * weights.enterpriseAdoption

  return Math.round(total)
}

/**
 * 判断技术是否可见（默认展示在首页）
 * @param score 总分
 * @param threshold 可见性阈值（默认70）
 */
export function isVisible(score: number, threshold: number = DEFAULT_THRESHOLDS.visible): boolean {
  return score >= threshold
}

/**
 * 判断是否为新兴技术
 * 条件：总分 < visible阈值 但 维护活跃度 >= emerging阈值
 * @param totalScore 总分
 * @param maintenanceScore 维护活跃度评分
 * @param thresholds 阈值配置
 */
export function isEmerging(
  totalScore: number,
  maintenanceScore: number,
  thresholds: ScoreThresholds = DEFAULT_THRESHOLDS
): boolean {
  return totalScore < thresholds.visible && maintenanceScore >= thresholds.emerging
}

/**
 * 完整评分计算（包含可见性判断）
 * @param rawScores 原始评分数据
 * @param weights 权重配置
 * @param thresholds 阈值配置
 */
export function calculateTechScores(
  rawScores: Omit<TechScores, 'total' | 'lastCalculated'>,
  weights?: ScoreWeights,
  thresholds?: ScoreThresholds
): Pick<TechScores, 'total'> & { isVisible: boolean; isEmerging: boolean } {
  const total = calculateTotalScore(rawScores, weights)

  return {
    total,
    isVisible: isVisible(total, thresholds?.visible),
    isEmerging: isEmerging(total, rawScores.maintenance, thresholds)
  }
}

/**
 * 获取评分等级（用于UI展示）
 * @param score 总分
 */
export function getScoreLevel(score: number): 'excellent' | 'good' | 'average' | 'poor' {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'average'
  return 'poor'
}

/**
 * 获取星级评分（1-5星）
 * @param score 总分
 */
export function getStarRating(score: number): number {
  return Math.max(1, Math.min(5, Math.round(score / 20)))
}

/**
 * 获取评分颜色（用于UI展示）
 * @param score 总分
 */
export function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e' // green-500
  if (score >= 60) return '#3b82f6' // blue-500
  if (score >= 40) return '#f59e0b' // amber-500
  return '#ef4444' // red-500
}

/**
 * 格式化评分显示
 * @param score 总分
 */
export function formatScore(score: number): string {
  return `${score}分`
}

/**
 * 生成星级字符串（用于文本展示）
 * @param score 总分
 */
export function generateStarString(score: number): string {
  const stars = getStarRating(score)
  return '★'.repeat(stars) + '☆'.repeat(5 - stars)
}
