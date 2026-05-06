import { describe, it, expect } from 'vitest'
import {
  calculateTotalScore,
  isVisible,
  isEmerging,
  getScoreLevel,
  getStarRating,
  getScoreColor,
  formatScore,
  generateStarString,
} from './calculator'
import type { TechScores } from '@/data/tech/score-types'

describe('calculateTotalScore', () => {
  it('calculates weighted total correctly', () => {
    const scores: Omit<TechScores, 'total' | 'lastCalculated'> = {
      popularity: 80,
      maintenance: 90,
      ecosystem: 85,
      learningCurve: 70,
      enterpriseAdoption: 75,
    }

    const result = calculateTotalScore(scores)
    expect(result).toBe(82)
  })

  it('handles perfect scores', () => {
    const scores: Omit<TechScores, 'total' | 'lastCalculated'> = {
      popularity: 100,
      maintenance: 100,
      ecosystem: 100,
      learningCurve: 100,
      enterpriseAdoption: 100,
    }

    expect(calculateTotalScore(scores)).toBe(100)
  })

  it('handles zero scores', () => {
    const scores: Omit<TechScores, 'total' | 'lastCalculated'> = {
      popularity: 0,
      maintenance: 0,
      ecosystem: 0,
      learningCurve: 0,
      enterpriseAdoption: 0,
    }

    expect(calculateTotalScore(scores)).toBe(0)
  })
})

describe('isVisible', () => {
  it('returns true for scores above threshold', () => {
    expect(isVisible(75, 70)).toBe(true)
    expect(isVisible(70, 70)).toBe(true)
  })

  it('returns false for scores below threshold', () => {
    expect(isVisible(69, 70)).toBe(false)
    expect(isVisible(50, 70)).toBe(false)
  })
})

describe('isEmerging', () => {
  it('returns true for low total but high maintenance', () => {
    expect(isEmerging(60, 85, { visible: 70, emerging: 80 })).toBe(true)
  })

  it('returns false for high total score', () => {
    expect(isEmerging(75, 85, { visible: 70, emerging: 80 })).toBe(false)
  })

  it('returns false for low maintenance score', () => {
    expect(isEmerging(60, 70, { visible: 70, emerging: 80 })).toBe(false)
  })
})

describe('getScoreLevel', () => {
  it('returns excellent for scores >= 80', () => {
    expect(getScoreLevel(95)).toBe('excellent')
    expect(getScoreLevel(80)).toBe('excellent')
  })

  it('returns good for scores 60-79', () => {
    expect(getScoreLevel(75)).toBe('good')
    expect(getScoreLevel(60)).toBe('good')
  })

  it('returns average for scores 40-59', () => {
    expect(getScoreLevel(50)).toBe('average')
    expect(getScoreLevel(40)).toBe('average')
  })

  it('returns poor for scores < 40', () => {
    expect(getScoreLevel(35)).toBe('poor')
    expect(getScoreLevel(0)).toBe('poor')
  })
})

describe('getStarRating', () => {
  it('returns 5 stars for score 100', () => {
    expect(getStarRating(100)).toBe(5)
  })

  it('returns 4 stars for score 80', () => {
    expect(getStarRating(80)).toBe(4)
  })

  it('returns 3 stars for score 60', () => {
    expect(getStarRating(60)).toBe(3)
  })

  it('returns 1 star for score 0', () => {
    expect(getStarRating(0)).toBe(1)
  })
})

describe('getScoreColor', () => {
  it('returns green for scores >= 80', () => {
    expect(getScoreColor(85)).toBe('#22c55e')
  })

  it('returns blue for scores 60-79', () => {
    expect(getScoreColor(70)).toBe('#3b82f6')
  })

  it('returns amber for scores 40-59', () => {
    expect(getScoreColor(50)).toBe('#f59e0b')
  })

  it('returns red for scores < 40', () => {
    expect(getScoreColor(30)).toBe('#ef4444')
  })
})

describe('formatScore', () => {
  it('formats score with Chinese suffix', () => {
    expect(formatScore(85)).toBe('85分')
    expect(formatScore(0)).toBe('0分')
  })
})

describe('generateStarString', () => {
  it('generates correct star strings', () => {
    expect(generateStarString(100)).toBe('★★★★★')
    expect(generateStarString(80)).toBe('★★★★☆')
    expect(generateStarString(60)).toBe('★★★☆☆')
    expect(generateStarString(40)).toBe('★★☆☆☆')
    expect(generateStarString(20)).toBe('★☆☆☆☆')
  })
})
