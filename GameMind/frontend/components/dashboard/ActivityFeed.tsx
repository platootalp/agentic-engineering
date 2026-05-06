'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, FileText, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { DashboardSummary } from '@/lib/api'

interface ActivityFeedProps {
  activities?: DashboardSummary['recent_activities'] | null
  loading?: boolean
}

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  report_generated: <FileText className="w-4 h-4 text-primary" />,
  report_regenerated: <RefreshCw className="w-4 h-4 text-accent" />,
  execution_started: <Activity className="w-4 h-4 text-blue-400" />,
  execution_completed: <CheckCircle2 className="w-4 h-4 text-green-400" />,
  execution_failed: <AlertCircle className="w-4 h-4 text-red-400" />,
}

const ACTIVITY_COLORS: Record<string, string> = {
  report_generated: 'bg-primary/10',
  report_regenerated: 'bg-accent/10',
  execution_started: 'bg-blue-500/10',
  execution_completed: 'bg-green-500/10',
  execution_failed: 'bg-red-500/10',
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins} 分钟前`
  if (diffHours < 24) return `${diffHours} 小时前`
  if (diffDays < 7) return `${diffDays} 天前`
  return date.toLocaleDateString('zh-CN')
}

export default function ActivityFeed({ activities, loading }: ActivityFeedProps) {
  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-text">最近动态</CardTitle>
        </CardHeader>
        <CardContent>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 py-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-border flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-border rounded w-3/4 mb-1" />
                <div className="h-3 bg-border rounded w-1/4" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-text">最近动态</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted text-sm py-8 text-center">暂无动态</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-text">最近动态</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {activities.map((activity, i) => {
            const icon = ACTIVITY_ICONS[activity.type]
            const bgColor = ACTIVITY_COLORS[activity.type] || 'bg-border'

            return (
              <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-border/30 transition-colors">
                <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  {icon || <Activity className="w-4 h-4 text-muted" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text leading-snug">{activity.message}</p>
                  <p className="text-xs text-subtle mt-0.5">{formatTime(activity.timestamp)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
