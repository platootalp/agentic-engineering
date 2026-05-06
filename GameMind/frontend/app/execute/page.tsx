'use client'
import { useState, useEffect, useCallback } from 'react'
import { Activity, CheckCircle2, XCircle, Clock, PlayCircle, Loader2, AlertCircle, Eye } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { api } from '@/lib/api'
import type { Execution } from '@/lib/api'

const STEP_ORDER = ['plan', 'search', 'analyze', 'verify', 'report'] as const
const STEP_LABELS: Record<string, string> = {
  plan: '规划',
  search: '搜索',
  analyze: '分析',
  verify: '验证',
  report: '报告',
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  idle: <Clock className="w-4 h-4 text-muted" />,
  running: <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />,
  paused: <Activity className="w-4 h-4 text-yellow-400" />,
  completed: <CheckCircle2 className="w-4 h-4 text-green-400" />,
  failed: <XCircle className="w-4 h-4 text-red-400" />,
}

const STATUS_COLORS: Record<string, string> = {
  idle: 'text-muted',
  running: 'text-blue-400',
  paused: 'text-yellow-400',
  completed: 'text-green-400',
  failed: 'text-red-400',
}

interface ExecutionRecord extends Execution {
  expanded?: boolean
}

function formatDuration(startedAt: string, completedAt: string | null): string {
  const start = new Date(startedAt).getTime()
  const end = completedAt ? new Date(completedAt).getTime() : Date.now()
  const diff = Math.floor((end - start) / 1000)
  if (diff < 60) return `${diff}s`
  return `${Math.floor(diff / 60)}m ${diff % 60}s`
}

function ExecutionCard({ execution, onViewDetail }: { execution: ExecutionRecord; onViewDetail: (id: number) => void }) {
  const [expanded, setExpanded] = useState(false)
  const currentStepIndex = execution.current_step ? STEP_ORDER.indexOf(execution.current_step) : -1

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {STATUS_ICONS[execution.status]}
            <div>
              <CardTitle className="text-sm font-medium text-text">
                执行 #{execution.id}
              </CardTitle>
              <p className="text-xs text-muted mt-0.5">
                {execution.trigger_type === 'manual' ? '手动触发' : execution.trigger_type === 'scheduled' ? '定时任务' : '迭代'}
                {' · '}
                {execution.started_at ? new Date(execution.started_at).toLocaleString('zh-CN') : ''}
                {execution.completed_at ? ` · ${formatDuration(execution.started_at, execution.completed_at)}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewDetail(execution.id)}
              className="p-2 rounded-md text-muted hover:text-primary hover:bg-primary/10 transition-colors"
              title="查看详情"
            >
              <Eye className="w-4 h-4" />
            </button>
            <Badge
              variant={execution.status === 'completed' ? 'success' : execution.status === 'failed' ? 'destructive' : execution.status === 'running' ? 'default' : 'secondary'}
            >
              {execution.status === 'running' ? '进行中' : execution.status === 'completed' ? '已完成' : execution.status === 'failed' ? '失败' : execution.status === 'paused' ? '已暂停' : '空闲'}
            </Badge>
          </div>
        </div>

        {execution.status === 'running' && execution.current_step && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted">当前步骤: {STEP_LABELS[execution.current_step]}</span>
              <span className="text-xs text-primary">{Math.round((execution.progress || 0) * 100)}%</span>
            </div>
            <Progress value={(execution.progress || 0) * 100} />
            {/* Step dots */}
            <div className="flex justify-between mt-2">
              {STEP_ORDER.map((step, i) => {
                const isDone = i < currentStepIndex
                const isCurrent = i === currentStepIndex
                return (
                  <div
                    key={step}
                    className={`flex flex-col items-center gap-0.5 ${
                      isDone ? 'text-green-400' : isCurrent ? 'text-primary' : 'text-border'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${isDone ? 'bg-green-400' : isCurrent ? 'bg-primary' : 'bg-border'}`} />
                    <span className="text-[10px]">{STEP_LABELS[step]}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {execution.error_message && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-md mb-3">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-400">{execution.error_message}</p>
          </div>
        )}

        {execution.report_id && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">报告 ID: {execution.report_id}</span>
            <Link
              href={`/reports/${execution.report_id}`}
              className="text-xs text-primary hover:text-accent transition-colors"
            >
              查看报告 →
            </Link>
          </div>
        )}

        {execution.step_results && Object.keys(execution.step_results).length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-muted hover:text-text transition-colors mt-1"
          >
            {expanded ? '收起详情' : '展开详情'}
          </button>
        )}

        {expanded && execution.step_results && (
          <pre className="mt-2 p-2 bg-bg rounded text-xs text-subtle overflow-x-auto max-h-48">
            {JSON.stringify(execution.step_results, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  )
}

export default function ExecutePage() {
  const router = useRouter()
  const [executions, setExecutions] = useState<ExecutionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [currentExecution, setCurrentExecution] = useState<ExecutionRecord | null>(null)
  const [polling, setPolling] = useState(false)

  const fetchExecutions = useCallback(async () => {
    try {
      const data = await api.executions.list({ limit: 20 })
      setExecutions(data.items as ExecutionRecord[])
      // Set running execution as currentExecution if any
      const running = data.items.find((e: Execution) => e.status === 'running')
      setCurrentExecution(running as ExecutionRecord || null)
    } catch {
      // silently ignore
    } finally {
      setLoading(false)
    }
  }, [])

  // Poll for running execution status
  useEffect(() => {
    fetchExecutions()
  }, [fetchExecutions])

  useEffect(() => {
    const running = executions.find((e) => e.status === 'running')
    if (!running) return

    setPolling(true)
    const interval = setInterval(async () => {
      try {
        const updated = await api.executions.get(String(running.id))
        setExecutions((prev) => prev.map((e) => (e.id === running.id ? updated : e)))
        if (updated.status !== 'running') {
          clearInterval(interval)
          setPolling(false)
        }
      } catch {
        clearInterval(interval)
        setPolling(false)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [executions])

  function handleViewDetail(id: number) {
    router.push(`/execute/${id}`)
  }

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text">执行记录</h1>
            <p className="text-muted text-sm mt-1">
              {polling ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  实时监控中
                </span>
              ) : (
                '当前执行状态与历史日志'
              )}
            </p>
          </div>
          {executions.find((e) => e.status === 'running') && (
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 transition-opacity"
            >
              <PlayCircle className="w-4 h-4" />
              前往首页查看
            </Link>
          )}
        </div>

        {/* Running Execution */}
        {currentExecution && currentExecution.status === 'running' && (
          <div>
            <h2 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              当前执行
            </h2>
            <ExecutionCard execution={currentExecution} onViewDetail={handleViewDetail} />
          </div>
        )}

        {/* History */}
        <div>
          <h2 className="text-sm font-semibold text-text mb-3">执行历史</h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-5 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-border rounded" />
                    <div className="flex-1">
                      <div className="h-4 bg-border rounded w-48 mb-1" />
                      <div className="h-3 bg-border rounded w-32" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : executions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-card border border-border rounded-lg">
              <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center mb-3">
                <Activity className="w-6 h-6 text-muted" />
              </div>
              <p className="text-muted text-sm">暂无执行记录</p>
              <p className="text-subtle text-xs mt-1">生成第一份报告开始分析</p>
            </div>
          ) : (
            <div className="space-y-3">
              {executions.map((exec) => (
                <ExecutionCard key={exec.id} execution={exec} onViewDetail={handleViewDetail} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
