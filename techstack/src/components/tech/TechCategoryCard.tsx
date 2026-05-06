'use client'

import { memo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { TechCategory } from '@/data/tech/types'

interface TechCategoryCardProps {
  category: TechCategory
}

export const TechCategoryCard = memo(function TechCategoryCard({
  category,
}: TechCategoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getPopularityColor = (popularity: string) => {
    switch (popularity) {
      case 'high':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100'
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
      case 'rising':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
    }
  }

  const getPopularityLabel = (popularity: string) => {
    switch (popularity) {
      case 'high': return '高流行度'
      case 'medium': return '中等流行度'
      case 'rising': return '上升趋势'
      default: return popularity
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4 mb-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
          style={{ backgroundColor: category.color }}
        >
          {category.icon}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold">{category.name}</h3>
          <p className="text-muted-foreground text-sm mt-1">{category.problem}</p>
        </div>
      </div>

      <p className="text-foreground mb-4">{category.description}</p>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm text-muted-foreground">主流技术栈</h4>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            {isExpanded ? (
              <>收起 <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>展开 <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        </div>

        <div className={`space-y-2 ${isExpanded ? '' : 'max-h-32 overflow-hidden'}`}>
          {category.mainstream.map((tech) => (
            <div
              key={tech.name}
              className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
            >
              <span className={`px-2 py-1 rounded text-xs font-medium shrink-0 ${getPopularityColor(tech.popularity)}`}>
                {getPopularityLabel(tech.popularity)}
              </span>
              <div>
                <span className="font-medium">{tech.name}</span>
                <p className="text-sm text-muted-foreground mt-1">{tech.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

TechCategoryCard.displayName = 'TechCategoryCard'
