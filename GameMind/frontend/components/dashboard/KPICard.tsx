'use client'
import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  trend?: string
  className?: string
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

export default function KPICard({ title, value, subtitle, icon: Icon, trend, className }: KPICardProps) {
  const TrendIcon = trend ? getTrendIcon(trend) : null
  const trendColor = trend ? getTrendColor(trend) : ''

  return (
    <Card className={cn('bg-card border-border hover:border-primary/30 transition-colors', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">{title}</p>
            <p className="text-2xl font-bold text-text">{value}</p>
            {subtitle && <p className="text-xs text-subtle mt-1">{subtitle}</p>}
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
        {trend && TrendIcon && (
          <div className={cn('flex items-center gap-1 mt-3 text-xs font-medium', trendColor)}>
            <TrendIcon className="w-3.5 h-3.5" />
            <span>{trend}</span>
            <span className="text-muted">vs 上期</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
