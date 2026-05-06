'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { AlertCircle, Loader2 } from 'lucide-react'
import Header from '@/components/Header'
import ReportDetail from '@/components/reports/ReportDetail'
import { api } from '@/lib/api'
import type { Report } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'

export default function ReportDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    async function fetchReport() {
      setLoading(true)
      setError('')
      try {
        const data = await api.reports.get(id)
        setReport(data)
      } catch (e) {
        console.error('[Client] Error fetching report:', e)
        setError(e instanceof Error ? e.message : '加载失败')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [id])

  if (error) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="max-w-6xl mx-auto px-6 py-8">
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <h1 className="text-xl font-semibold text-text mb-2">加载失败</h1>
                <p className="text-muted text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-muted text-sm">加载报告中...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="max-w-6xl mx-auto px-6 py-8">
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-12 h-12 text-muted mb-4" />
                <h1 className="text-xl font-semibold text-text mb-2">报告不存在</h1>
                <p className="text-muted text-sm">找不到 ID 为 {id} 的报告</p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <ReportDetail report={report} />
      </main>
    </div>
  )
}
