'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Layers, Clock, Zap, Plus } from 'lucide-react'
import Header from '@/components/Header'
import KPICard from '@/components/dashboard/KPICard'
import TrendChart from '@/components/dashboard/TrendChart'
import CategoryRankingList from '@/components/dashboard/CategoryRanking'
import ActivityFeed from '@/components/dashboard/ActivityFeed'
import ReportCard from '@/components/reports/ReportCard'
import { api, clearApiCache } from '@/lib/api'
import type { DashboardSummary, TrendsData, ReportListItem } from '@/lib/api'

export default function DashboardPage() {
  const router = useRouter()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [trends, setTrends] = useState<TrendsData | null>(null)
  const [recentReports, setRecentReports] = useState<ReportListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [genMsg, setGenMsg] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const [summaryData, trendsData, reportsData] = await Promise.all([
        api.dashboard.summary(),
        api.dashboard.trends({ period: '3m' }),
        api.reports.list({ limit: 3 }),
      ])
      setSummary(summaryData)
      setTrends(trendsData)
      setRecentReports(reportsData.items || [])
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleGenerate() {
    setGenerating(true)
    setGenMsg('')
    try {
      const res = await api.reports.generate({})
      if (res.execution_id) {
        setGenMsg(`报告生成已启动，执行ID: ${res.execution_id}`)
        clearApiCache()
        setTimeout(() => router.push('/execute'), 1500)
      }
    } catch (err) {
      setGenMsg(`错误: ${err instanceof Error ? err.message : '未知错误'}`)
      setGenerating(false)
    }
  }

  function formatTimeAgo(dateStr: string | null): string {
    if (!dateStr) return '暂无'
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffHours < 1) return '刚刚'
    if (diffHours < 24) return `${diffHours} 小时前`
    if (diffDays < 7) return `${diffDays} 天前`
    return date.toLocaleDateString('zh-CN')
  }

  function handlePeriodChange(period: string) {
    api.dashboard.trends({ period }).then(setTrends).catch(console.error)
  }

  const kpis = summary?.kpis

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text">仪表盘</h1>
            <p className="text-muted text-sm mt-1">游戏市场分析 Agent v2</p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            {generating ? '启动中...' : '生成报告'}
          </button>
        </div>

        {genMsg && (
          <div className={`p-3 rounded-lg text-sm ${genMsg.startsWith('错误') ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
            {genMsg}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="报告总数"
            value={loading ? '—' : String(kpis?.total_reports ?? 0)}
            icon={FileText}
            className="col-span-1"
          />
          <KPICard
            title="品类数量"
            value={loading ? '—' : String(kpis?.categories_tracked ?? 0)}
            icon={Layers}
            className="col-span-1"
          />
          <KPICard
            title="最新报告"
            value={loading ? '—' : formatTimeAgo(kpis?.latest_report_date ?? null)}
            icon={Clock}
            className="col-span-1"
          />
          <KPICard
            title="平均耗时"
            value={loading ? '—' : `${kpis?.avg_generation_time_seconds ?? 0}s`}
            icon={Zap}
            className="col-span-1"
          />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <CategoryRankingList
              rankings={summary?.category_rankings}
              loading={loading}
            />
          </div>
          <div className="lg:col-span-3">
            <TrendChart
              data={trends}
              loading={loading}
              onPeriodChange={handlePeriodChange}
            />
          </div>
        </div>

        {/* Recent Reports */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text">最新报告</h2>
            <button
              onClick={() => router.push('/reports')}
              className="text-xs text-primary hover:text-accent transition-colors"
            >
              查看全部 →
            </button>
          </div>
          {loading ? (
            <div className="grid md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-5 animate-pulse">
                  <div className="h-4 bg-border rounded w-3/4 mb-2" />
                  <div className="h-3 bg-border rounded w-full mb-1" />
                  <div className="h-3 bg-border rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : recentReports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-card border border-border rounded-lg">
              <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center mb-3">
                <FileText className="w-6 h-6 text-muted" />
              </div>
              <p className="text-muted text-sm">还没有报告</p>
              <p className="text-subtle text-xs mt-1">点击上方「生成报告」开始分析</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {recentReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="grid lg:grid-cols-2 gap-4">
          <ActivityFeed activities={summary?.recent_activities} loading={loading} />
        </div>
      </main>
    </div>
  )
}
