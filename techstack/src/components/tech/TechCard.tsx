'use client'

import { ScoreBadge } from './ScoreBadge'
import type { TechDetail } from '@/data/tech/types'

interface TechCardProps {
  tech: TechDetail
}

export function TechCard({ tech }: TechCardProps) {
  return (
    <div className="tech-card">
      <div className="tech-card-header">
        <h3 className="tech-name">{tech.name}</h3>
        <ScoreBadge score={tech.scores.total} />
      </div>
      
      <p className="tech-tagline">{tech.tagline}</p>
      
      <div className="tech-meta">
        <span className="tech-category">{tech.subcategory}</span>
        <span className={`tech-status-badge tech-status-${tech.status}`}>
          {tech.status === 'active' ? '活跃' : '归档'}
        </span>
      </div>
    </div>
  )
}
