'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { CategoryRanking } from '@/lib/api'

interface CategoryRankingProps {
  rankings?: CategoryRanking[] | null
  loading?: boolean
}

// Slug → display name map
const CATEGORY_NAMES: Record<string, string> = {
  casual_puzzle: '休闲解谜',
  hypercasual: '超休闲游戏',
  puzzle_quiz: '益智问答',
  running_obstacle: '跑酷闯关',
  music_rhythm: '音乐节奏',
  simulation: '模拟经营',
  strategy: '策略塔防',
}

function getTrendIcon(trend: string) {
  const num = parseFloat(trend.replace(/[^0-9.-]/g, ''))
  if (isNaN(num) || num === 0) return Minus
  return num > 0 ? TrendingUp : TrendingDown
}

function getTrendColor(trend: string) {
  const num = parseFloat(trend.replace(/[^0-9.-]/g, ''))
  if (isNaN(num) || num === 0) return 'text-muted'
  return num > 0 ? 'text-green-400' : 'text-red-400'
}

export default function CategoryRankingList({ rankings, loading }: CategoryRankingProps) {
  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-text">品类热度排名</CardTitle>
        </CardHeader>
        <CardContent>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-5 h-4 bg-border rounded" />
                <div className="w-24 h-4 bg-border rounded" />
              </div>
              <div className="w-12 h-4 bg-border rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!rankings || rankings.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-text">品类热度排名</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted text-sm py-8 text-center">暂无排名数据</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-text">品类热度排名</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {rankings.map((item, index) => {
            const TrendIcon = getTrendIcon(item.trend)
            const trendColor = getTrendColor(item.trend)
            const name = item.name || CATEGORY_NAMES[item.slug] || item.slug

            return (
              <div key={item.slug} className="flex items-center justify-between px-5 py-3 hover:bg-border/30 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-text">{name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted">{item.heat_index}</span>
                  <span className={`flex items-center gap-0.5 text-xs font-medium ${trendColor}`}>
                    <TrendIcon className="w-3.5 h-3.5" />
                    {item.trend}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
