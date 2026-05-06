'use client'
import Link from 'next/link'
import { ArrowRight, Calendar, FileText, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ReportListItem } from '@/lib/api'

interface ReportCardProps {
  report: ReportListItem
}

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'secondary' | 'success' | 'warning' }> = {
  published: { label: '已发布', variant: 'success' },
  draft: { label: '草稿', variant: 'warning' },
  archived: { label: '已归档', variant: 'secondary' },
}

export default function ReportCard({ report }: ReportCardProps) {
  const date = new Date(report.created_at).toLocaleString('zh-CN')
  const truncatedSummary = report.summary?.slice(0, 160) + (report.summary?.length > 160 ? '...' : '')
  const statusCfg = STATUS_CONFIG[report.status] || STATUS_CONFIG.draft

  return (
    <Link href={`/reports/${report.id}`} className="group block">
      <Card className="bg-card border-border transition-all duration-200 hover:border-primary/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.08)]">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={statusCfg.variant} className="text-xs">{statusCfg.label}</Badge>
                {report.version > 1 && (
                  <Badge variant="secondary" className="text-xs flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" />
                    v{report.version}
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-text group-hover:text-primary transition-colors mb-2 truncate">
                {report.title}
              </h3>
              <p className="text-muted text-sm leading-relaxed line-clamp-2">
                {truncatedSummary || '暂无摘要'}
              </p>
              <div className="flex items-center gap-4 text-subtle text-xs mt-3">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {date}
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  v{report.version}
                </span>
              </div>
            </div>
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-bg flex items-center justify-center text-muted group-hover:text-primary group-hover:bg-primary/10 transition-colors">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
