'use client'
import { useState, useEffect } from 'react'
import { FileText, AlertCircle } from 'lucide-react'
import Header from '@/components/Header'
import ReportCard from '@/components/reports/ReportCard'
import { api } from '@/lib/api'
import type { ReportListItem } from '@/lib/api'

export default function ReportsPage() {
  const [data, setData] = useState<{items: ReportListItem[], total: number} | null>(null)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(true)

  const fetchReports = async () => {
    setLoading(true)
    try {
      const responseData = await api.reports.list({ limit: 20 })
      setData(responseData)
      setError('')
    } catch (e) {
      console.error('Reports Page - Error:', e)
      setError(e instanceof Error ? e.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col items-center justify-center py-16 text-center bg-card border border-border rounded-lg">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <h1 className="text-xl font-semibold text-text mb-2">加载失败</h1>
            <p className="text-muted text-sm mb-4">{error}</p>
            <button
              onClick={fetchReports}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              重试
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-text">报告列表</h1>
          <p className="text-muted text-sm mt-1">
            {data ? `共 ${data.total} 条报告` : '加载中...'}
          </p>
        </div>

        {/* Reports Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-5 animate-pulse">
                <div className="h-6 bg-border rounded w-3/4 mb-3" />
                <div className="h-4 bg-border rounded w-full mb-2" />
                <div className="h-4 bg-border rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-card border border-border rounded-lg">
            <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-muted" />
            </div>
            <p className="text-muted text-sm">暂无报告</p>
            <p className="text-subtle text-xs mt-1">生成第一份报告开始分析</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.items.map(item => (
              <ReportCard key={item.id} report={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
