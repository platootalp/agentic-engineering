'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { 
  Search, 
  ArrowLeft, 
  Archive,
  AlertTriangle,
  RefreshCw,
  XCircle,
  Target,
  ChevronRight,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getArchivedTech, getArchiveReasonText } from '@/data/tech/tech-database'
import type { TechDetail } from '@/data/tech/types'
import { ScoreBadge } from '@/components/tech/ScoreBadge'
import { usePagination } from '@/hooks/use-pagination'
import { PaginationControl } from '@/components/ui/pagination-control'

type ArchiveReason = 'all' | 'low_popularity' | 'deprecated' | 'replaced' | 'niche_use_case'

const archiveReasonIcons: Record<string, React.ReactNode> = {
  low_popularity: <Target className="w-4 h-4" />,
  deprecated: <XCircle className="w-4 h-4" />,
  replaced: <RefreshCw className="w-4 h-4" />,
  niche_use_case: <AlertTriangle className="w-4 h-4" />,
}

const archiveReasonLabels: Record<string, string> = {
  all: '全部原因',
  low_popularity: '流行度较低',
  deprecated: '已停止维护',
  replaced: '被更好的技术替代',
  niche_use_case: '仅适用于特定场景',
}

export default function ArchivedTechPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReason, setSelectedReason] = useState<ArchiveReason>('all')

  const archivedTech = getArchivedTech()

  const filteredTech = useMemo(() => {
    let result = [...archivedTech]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(tech =>
        tech.name.toLowerCase().includes(query) ||
        tech.description.toLowerCase().includes(query) ||
        (tech.archiveNote && tech.archiveNote.toLowerCase().includes(query))
      )
    }

    if (selectedReason !== 'all') {
      result = result.filter(tech => tech.archiveReason === selectedReason)
    }

    return result.sort((a, b) => (b.archivedAt || '').localeCompare(a.archivedAt || ''))
  }, [archivedTech, searchQuery, selectedReason])

  const {
    currentData,
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    pageSizeOptions,
    setPage,
    setPageSize,
  } = usePagination(filteredTech, { initialPageSize: 12 })

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedReason, setPage])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/tech-stack" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            返回技术列表
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 mb-4">
            <Archive className="w-8 h-8 text-gray-600 dark:text-gray-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-gray-600 to-gray-400 bg-clip-text text-transparent">
              归档技术
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            这些技术因各种原因不再在主流列表展示，但历史数据完整保留
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard 
            value={archivedTech.length} 
            label="归档技术总数" 
            color="gray" 
          />
          <StatCard 
            value={archivedTech.filter(t => t.archiveReason === 'low_popularity').length} 
            label="流行度较低" 
            color="blue" 
          />
          <StatCard 
            value={archivedTech.filter(t => t.archiveReason === 'replaced').length} 
            label="被替代" 
            color="orange" 
          />
          <StatCard 
            value={archivedTech.filter(t => t.archiveReason === 'deprecated').length} 
            label="已弃用" 
            color="red" 
          />
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="搜索归档技术..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Select value={selectedReason} onValueChange={(v) => setSelectedReason(v as ArchiveReason)}>
              <SelectTrigger className="w-full md:w-[240px] h-12">
                <Archive className="w-4 h-4 mr-2" />
                <SelectValue placeholder="筛选归档原因" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{archiveReasonLabels.all}</SelectItem>
                <SelectItem value="low_popularity">{archiveReasonLabels.low_popularity}</SelectItem>
                <SelectItem value="deprecated">{archiveReasonLabels.deprecated}</SelectItem>
                <SelectItem value="replaced">{archiveReasonLabels.replaced}</SelectItem>
                <SelectItem value="niche_use_case">{archiveReasonLabels.niche_use_case}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-600 dark:text-gray-400">
          找到 <span className="font-bold text-gray-600">{totalItems}</span> 个归档技术
          {totalPages > 1 && (
            <span className="ml-2">
              (第 {currentPage} / {totalPages} 页)
            </span>
          )}
        </div>

        {/* Archived Tech Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentData.map((tech) => (
            <ArchivedTechCard key={tech.id} tech={tech} />
          ))}
        </div>

        {/* Empty State */}
        {currentData.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              未找到归档技术
            </h3>
            <p className="text-gray-500">
              尝试调整搜索词或筛选条件
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <PaginationControl
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={totalItems}
              pageSizeOptions={pageSizeOptions}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-12 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              关于归档技术
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-600 dark:text-blue-400 space-y-2">
            <p>• 归档技术的所有数据完整保留，仍可查看详情</p>
            <p>• 归档不代表技术不可用，只是不在主流推荐列表</p>
            <p>• 部分归档技术有推荐的替代方案</p>
            <p>• 如有疑问，建议查看具体技术的归档说明</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ value, label, color }: { value: number; label: string; color: 'gray' | 'blue' | 'orange' | 'red' }) {
  const colorClasses = {
    gray: 'text-gray-600 dark:text-gray-400',
    blue: 'text-blue-600 dark:text-blue-400',
    orange: 'text-orange-600 dark:text-orange-400',
    red: 'text-red-600 dark:text-red-400',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-100 dark:border-gray-700">
      <div className={`text-3xl font-bold mb-1 ${colorClasses[color]}`}>{value}</div>
      <div className="text-gray-500 dark:text-gray-400 text-sm">{label}</div>
    </div>
  )
}

function ArchivedTechCard({ tech }: { tech: TechDetail }) {
  const reasonLabel = tech.archiveReason ? getArchiveReasonText(tech.archiveReason) : '已归档'
  const ReasonIcon = tech.archiveReason ? archiveReasonIcons[tech.archiveReason] : <Archive className="w-4 h-4" />

  return (
    <Card className="group bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold text-lg">
              {tech.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{tech.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs text-gray-500">{tech.subcategory}</Badge>
                <span className="text-xs text-gray-400">v{tech.version}</span>
              </div>
            </div>
          </div>
          <ScoreBadge score={tech.scores.total} showStars={false} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Archive Badge */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 flex items-center gap-1">
            {ReasonIcon}
            {reasonLabel}
          </Badge>
          {tech.archivedAt && (
            <span className="text-xs text-gray-400">
              归档于 {new Date(tech.archivedAt).toLocaleDateString('zh-CN')}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
          {tech.tagline}
        </p>

        {/* Archive Note */}
        {tech.archiveNote && (
          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">归档说明：</span>
              {tech.archiveNote}
            </p>
          </div>
        )}

        {/* Replaced By */}
        {tech.replacedBy && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">替代技术：</span>
            <Link 
              href={`/tech-stack/${tech.replacedBy}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              查看推荐替代方案
              <ExternalLink className="w-3 h-3 ml-1" />
            </Link>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/tech-stack/${tech.id}`} className="flex items-center justify-center gap-1">
              查看详情
              <ChevronRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
