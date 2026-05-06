'use client'

import { TechCard } from './TechCard'
import type { TechDetail } from '@/data/tech/types'

interface TechGridProps {
  technologies: TechDetail[]
  showArchived?: boolean
}

export function TechGrid({ technologies, showArchived = false }: TechGridProps) {
  const visibleTechs = technologies.filter(tech => 
    tech.status === 'active' || showArchived
  )
  
  return (
    <div className="tech-grid">
      {visibleTechs.map(tech => (
        <TechCard key={tech.id} tech={tech} />
      ))}
    </div>
  )
}
