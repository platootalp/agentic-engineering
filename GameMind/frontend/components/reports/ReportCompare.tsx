'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Report } from '@/lib/api'

interface ReportCompareProps {
  reports: Report[]
}

function getMetricDiff(a: number, b: number): { value: string; positive: boolean } {
  const diff = a - b
  const abs = Math.abs(diff)
  return {
    value: diff > 0 ? `+${abs}` : `-${abs}`,
    positive: diff >= 0,
  }
}

export default function ReportCompare({ reports }: ReportCompareProps) {
  if (reports.length < 2) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">报告对比</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted text-sm py-4 text-center">请选择至少两个报告进行对比</p>
        </CardContent>
      </Card>
    )
  }

  const [older, newer] = reports

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">报告对比</CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary">v{older.version}</Badge>
            <span className="text-muted text-xs">→</span>
            <Badge variant="default">v{newer.version}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Heat index comparison */}
        {older.metrics?.category_rankings && newer.metrics?.category_rankings && (
          <div>
            <p className="text-xs text-muted mb-2 font-medium">品类热指数变化</p>
            <div className="space-y-2">
              {newer.metrics.category_rankings.map((newerRank) => {
                const olderRank = older.metrics!.category_rankings.find((r) => r.slug === newerRank.slug)
                if (!olderRank) return null
                const diff = getMetricDiff(newerRank.heat_index, olderRank.heat_index)
                return (
                  <div key={newerRank.slug} className="flex items-center justify-between text-sm">
                    <span className="text-text">{newerRank.slug}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-muted text-xs">{olderRank.heat_index}</span>
                      <span className="text-muted text-xs">→</span>
                      <span className="text-text text-xs">{newerRank.heat_index}</span>
                      <span className={`text-xs font-medium ${diff.positive ? 'text-green-400' : 'text-red-400'}`}>
                        {diff.value}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Insight count */}
        <div>
          <p className="text-xs text-muted mb-2 font-medium">洞察数量</p>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-text">{older.insights?.length ?? 0} → {newer.insights?.length ?? 0}</span>
            {newer.insights && older.insights && (
              <span className={`text-xs ${newer.insights.length >= older.insights.length ? 'text-green-400' : 'text-red-400'}`}>
                {newer.insights.length - older.insights.length >= 0 ? '+' : ''}
                {newer.insights.length - older.insights.length}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
