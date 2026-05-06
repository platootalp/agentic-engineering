'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  ChevronRight,
  TrendingUp,
  Code2,
  Server,
  Database,
  Layers,
  Archive
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getActiveTech, getCategories, getSubcategories } from '@/data/tech/tech-database'
import type { TechDetail } from '@/data/tech/types'
import { ScoreBadge } from '@/components/tech/ScoreBadge'
import { usePagination } from '@/hooks/use-pagination'
import { PaginationControl } from '@/components/ui/pagination-control'

type SortOption = 'score' | 'name' | 'popularity' | 'maintenance' | 'ecosystem'
type ViewMode = 'grid' | 'list'

const categoryLabels: Record<string, string> = {
  frontend: '前端',
  backend: '后端',
  ai: 'AI',
  infrastructure: '基础设施',
  storage: '存储',
  'llm-algorithm': 'LLM算法',
  'llm-application': 'LLM应用',
}

export default function TechStackPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('score')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const allTech = getActiveTech()
  const categories = ['all', ...getCategories()]
  const subcategories = useMemo(() => {
    const subs = selectedCategory === 'all' 
      ? getSubcategories()
      : Array.from(new Set(allTech.filter(t => t.category === selectedCategory).map(t => t.subcategory)))
    return ['all', ...subs]
  }, [selectedCategory, allTech])

  const filteredTech = useMemo(() => {
    let result = [...allTech]
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(tech =>
        tech.name.toLowerCase().includes(query) ||
        tech.description.toLowerCase().includes(query) ||
        tech.subcategory.toLowerCase().includes(query)
      )
    }
    if (selectedCategory !== 'all') {
      result = result.filter(tech => tech.category === selectedCategory)
    }
    if (selectedSubcategory !== 'all') {
      result = result.filter(tech => tech.subcategory === selectedSubcategory)
    }
    result.sort((a, b) => {
      switch (sortBy) {
        case 'score': return b.scores.total - a.scores.total
        case 'name': return a.name.localeCompare(b.name)
        case 'popularity': return b.scores.popularity - a.scores.popularity
        case 'maintenance': return b.scores.maintenance - a.scores.maintenance
        case 'ecosystem': return b.scores.ecosystem - a.scores.ecosystem
        default: return 0
      }
    })
    return result
  }, [allTech, searchQuery, selectedCategory, selectedSubcategory, sortBy])

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
  }, [searchQuery, selectedCategory, selectedSubcategory, sortBy, setPage])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              技术栈全景图
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            探索主流技术栈，多维度评分助你做出明智选择
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard value={allTech.filter(t => t.category === 'frontend').length} label="前端技术" color="blue" />
          <StatCard value={allTech.filter(t => t.category === 'backend').length} label="后端技术" color="purple" />
          <StatCard value={Math.round(allTech.reduce((acc, t) => acc + t.scores.total, 0) / allTech.length)} label="平均评分" color="pink" />
          <StatCard value={allTech.length} label="技术总数" color="green" />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="搜索技术名称、描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <div className="flex gap-2">
              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')}>
                <LayoutGrid className="w-5 h-5" />
              </Button>
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}>
                <List className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-4">
            <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
              {categories.map((cat) => (
                <TabsTrigger key={cat} value={cat} className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-4 py-2 rounded-full border">
                  {cat === 'all' ? '全部' : categoryLabels[cat] || cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex flex-col md:flex-row gap-4">
            <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="选择子分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部子分类</SelectItem>
                {subcategories.filter(s => s !== 'all').map((sub) => (
                  <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">综合评分</SelectItem>
                <SelectItem value="name">名称</SelectItem>
                <SelectItem value="popularity">流行度</SelectItem>
                <SelectItem value="maintenance">维护活跃度</SelectItem>
                <SelectItem value="ecosystem">生态系统</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-gray-600 dark:text-gray-400">
            找到 <span className="font-bold text-blue-600">{totalItems}</span> 个技术
          </div>
          <Link 
            href="/tech-stack/archived" 
            className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Archive className="w-4 h-4 mr-1" />
            查看归档技术
          </Link>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentData.map((tech) => <TechCard key={tech.id} tech={tech} />)}
          </div>
        ) : (
          <div className="space-y-4">
            {currentData.map((tech) => <TechListItem key={tech.id} tech={tech} />)}
          </div>
        )}

        {currentData.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">未找到相关技术</h3>
            <p className="text-gray-500">尝试调整搜索词或筛选条件</p>
          </div>
        )}

        <PaginationControl
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          pageSizeOptions={pageSizeOptions}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          className="mt-8"
        />

        <div className="text-center mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm">💡 评分基于多维度数据，仅供参考</p>
        </div>
      </div>
    </div>
  )
}

function StatCard({ value, label, color }: { value: number; label: string; color: 'blue' | 'purple' | 'pink' | 'green' }) {
  const colorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    purple: 'text-purple-600 dark:text-purple-400',
    pink: 'text-pink-600 dark:text-pink-400',
    green: 'text-green-600 dark:text-green-400',
  }
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg border border-gray-100 dark:border-gray-700">
      <div className={`text-3xl font-bold mb-1 ${colorClasses[color]}`}>{value}</div>
      <div className="text-gray-500 dark:text-gray-400 text-sm">{label}</div>
    </div>
  )
}

function TechCard({ tech }: { tech: TechDetail }) {
  return (
    <Link href={`/tech-stack/${tech.id}`}>
      <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 cursor-pointer h-full flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              {tech.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tech.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">{tech.subcategory}</Badge>
                <span className="text-xs text-gray-400">v{tech.version}</span>
              </div>
            </div>
          </div>
          <ScoreBadge score={tech.scores.total} showStars={false} />
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 flex-grow">
          {tech.tagline}
        </p>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <ScoreItem label="流行度" value={tech.scores.popularity} color="blue" />
          <ScoreItem label="维护" value={tech.scores.maintenance} color="green" />
          <ScoreItem label="生态" value={tech.scores.ecosystem} color="purple" />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <TrendingUp className="w-4 h-4" />
            <span>{tech.popularity.githubStars >= 1000 ? `${(tech.popularity.githubStars / 1000).toFixed(1)}k` : tech.popularity.githubStars} stars</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-blue-600 group-hover:translate-x-1 transition-transform">
            查看详情 <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  )
}

function ScoreItem({ label, value, color }: { label: string; value: number; color: 'blue' | 'green' | 'purple' }) {
  const colorClasses = { blue: 'text-blue-600', green: 'text-green-600', purple: 'text-purple-600' }
  return (
    <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`text-sm font-semibold ${colorClasses[color]}`}>{value}</div>
    </div>
  )
}

function TechListItem({ tech }: { tech: TechDetail }) {
  return (
    <Link href={`/tech-stack/${tech.id}`}>
      <div className="group bg-white dark:bg-gray-800 rounded-xl p-5 shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            {tech.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {tech.name}
              </h3>
              <Badge variant="secondary" className="text-xs">{tech.subcategory}</Badge>
              <span className="text-xs text-gray-400">v{tech.version}</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-1">{tech.tagline}</p>
          </div>
          <div className="flex items-center gap-6 flex-shrink-0">
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">综合评分</div>
              <ScoreBadge score={tech.scores.total} showStars={false} />
            </div>
            <div className="text-center hidden sm:block">
              <div className="text-xs text-gray-400 mb-1">流行度</div>
              <div className="text-sm font-semibold text-blue-600">{tech.scores.popularity}</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    </Link>
  )
}
