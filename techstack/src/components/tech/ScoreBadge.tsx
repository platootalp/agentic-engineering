'use client'

import { getStarRating, getScoreLevel } from '@/lib/scoring/calculator'

interface ScoreBadgeProps {
  score: number
  showStars?: boolean
}

export function ScoreBadge({ score, showStars = true }: ScoreBadgeProps) {
  const stars = getStarRating(score)
  const level = getScoreLevel(score)

  return (
    <div className={`score-badge score-${level}`}>
      {showStars && (
        <span className="stars">
          {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
        </span>
      )}
      <span className="score-value">{score}分</span>
    </div>
  )
}
