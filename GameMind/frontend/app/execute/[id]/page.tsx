'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Bot, Loader2, CheckCircle2, XCircle, RefreshCw, PlayCircle, Clock, Activity } from 'lucide-react'
import Header from '@/components/Header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const STEP_ORDER = ['plan', 'search', 'analyze', 'verify', 'report']
const STEP_LABELS: Record<string, string> = {
  plan: '规划',
  search: '搜索',
  analyze: '分析',
  verify: '验证',
  report: '报告',
}

interface ExecutionRecord {
  id: number
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed'
  current_step: string | null
  progress: number
  trigger_type: string
  started_at: string
  completed_at: string | null
  report_id: number | null
  error_message: string | null
}

interface LogEntry {
  id: string
  type: string
  content: string
  timestamp: Date
}

interface StreamEvent {
  type: string
  stage?: string
  step?: string
  message?: string
  content?: string
  report_id?: string
}

export default function ExecutionDetailPage() {
  const params = useParams()
  const executionId = params?.id as string

  const [execution, setExecution] = useState<ExecutionRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [streamingContent, setStreamingContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingLabel, setStreamingLabel] = useState('')
  const logsEndRef = useRef<HTMLDivElement>(null)
  const executionRef = useRef<ExecutionRecord | null>(null)
  const logIdCounterRef = useRef(0)

  function nextLogId() {
    return `log-${++logIdCounterRef.current}-${Date.now()}`
  }

  function formatStreamingContent(raw: string): string {
    if (!raw) return ''
    // Token events contain plain text, just display it
    // Try to parse as JSON only if it starts with { or [
    const trimmed = raw.trim()
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (parsed.summary) {
          return parsed.summary
        }
        return JSON.stringify(parsed, null, 2)
      } catch {
        return trimmed
      }
    }
    return trimmed
  }

  // Fetch execution data
  useEffect(() => {
    if (!executionId) {
      setError('无效的执行ID')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    const url = `${API_URL}/api/v1/executions/${executionId}`
    console.debug('[ExecuteDetail] Fetching:', url, 'executionId=', executionId)

    const timeout = setTimeout(() => {
      setError('请求超时，请检查网络或刷新重试')
      setLoading(false)
    }, 15000)

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        console.debug('[ExecuteDetail] Loaded execution:', data.id, data.status)
        setExecution(data)
        executionRef.current = data
        setLogs([{
          id: nextLogId(),
          type: 'step_log',
          content: `已加载执行记录，状态: ${data.status}`,
          timestamp: new Date(),
        }])
      })
      .catch(e => {
        console.error('[ExecuteDetail] Fetch failed:', e.message)
        setError(e.message || '加载失败')
      })
      .finally(() => {
        clearTimeout(timeout)
        setLoading(false)
      })
  }, [executionId])

  // Start SSE stream when execution data is loaded
  useEffect(() => {
    if (!execution || loading) return
    if (!executionRef.current?.id) return

    const abortController = new AbortController()
    const execId = executionRef.current.id

    async function startStream() {
      setIsStreaming(true)
      const streamUrl = `${API_URL}/api/v1/executions/${execId}/stream`
      console.debug('[ExecuteDetail] Starting SSE stream:', streamUrl)

      try {
        const response = await fetch(streamUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortController.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        if (!response.body) {
          throw new Error('No response body')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done || abortController.signal.aborted) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmedLine = line.trim()
            if (trimmedLine.startsWith('data:')) {
              try {
                const eventData = trimmedLine.slice(5).trim()
                if (eventData) {
                  const event: StreamEvent = JSON.parse(eventData)
                  handleStreamEvent(event)
                }
              } catch (err) {
                console.debug('[ExecuteDetail] Failed to parse event:', trimmedLine)
              }
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('[ExecuteDetail] Stream error:', err)
          setLogs(prev => [...prev, {
            id: nextLogId(),
            type: 'error',
            content: `流式连接失败: ${err.message}`,
            timestamp: new Date(),
          }])
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsStreaming(false)
        }
      }
    }

    startStream()

    return () => {
      abortController.abort()
    }
  }, [execution?.id, execution?.status])

  function handleStreamEvent(event: StreamEvent) {
    switch (event.type) {
      case 'stage':
        setLogs(prev => [...prev, {
          id: nextLogId(),
          type: 'stage',
          content: `🟢 进入阶段: ${STEP_LABELS[event.stage || ''] || event.message || ''}`,
          timestamp: new Date(),
        }])
        if (event.stage === 'analyze') {
          setStreamingLabel('正在分析...')
          setStreamingContent('')
        }
        break

      case 'step_log':
        setLogs(prev => [...prev, {
          id: nextLogId(),
          type: 'step_log',
          content: `📋 ${event.message || ''}`,
          timestamp: new Date(),
        }])
        break

      case 'token':
        if (event.content) {
          setStreamingContent(prev => prev + event.content)
        }
        break

      case 'done':
        setStreamingLabel('')
        setExecution(prev => prev ? { ...prev, status: 'completed', report_id: event.report_id ? Number(event.report_id) : prev.report_id } : null)
        setLogs(prev => [...prev, {
          id: nextLogId(),
          type: 'done',
          content: `✅ 报告生成完成！ID: ${event.report_id}`,
          timestamp: new Date(),
        }])
        break

      case 'error':
        setExecution(prev => prev ? { ...prev, status: 'failed' } : null)
        setLogs(prev => [...prev, {
          id: nextLogId(),
          type: 'error',
          content: `❌ 错误: ${event.message}`,
          timestamp: new Date(),
        }])
        break
    }
  }

  // Auto scroll
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  function refreshExecution() {
    if (!executionId) return
    setLoading(true)
    setLogs([])
    setStreamingContent('')
    setStreamingLabel('')
    setExecution(null)

    fetch(`${API_URL}/api/v1/executions/${executionId}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        setExecution(data)
        executionRef.current = data
        setLogs([{
          id: nextLogId(),
          type: 'step_log',
          content: `已刷新执行记录，状态: ${data.status}`,
          timestamp: new Date(),
        }])
      })
      .catch(e => {
        setError(e.message || '刷新失败')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  function formatDuration(startedAt: string, completedAt: string | null) {
    const start = new Date(startedAt).getTime()
    const end = completedAt ? new Date(completedAt).getTime() : Date.now()
    const diff = Math.floor((end - start) / 1000)
    if (diff < 60) return `${diff}秒`
    return `${Math.floor(diff / 60)}分 ${diff % 60}秒`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="ml-3 text-muted">加载执行记录...</span>
          </div>
        </main>
      </div>
    )
  }

  if (error || !execution) {
    return (
      <div className="min-h-screen bg-bg">
        <Header />
        <main className="max-w-4xl mx-auto px-6 py-8">
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="py-12">
              <div className="text-center">
                <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-text mb-2">{error || '执行记录不存在'}</h2>
                <Link href="/execute" className="text-primary hover:underline">
                  返回执行记录
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const currentStepIndex = execution.current_step ? STEP_ORDER.indexOf(execution.current_step) : -1

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/execute"
              className="flex items-center gap-2 text-muted hover:text-text transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              返回
            </Link>
            <div>
              <h1 className="text-xl font-bold text-text">执行详情 #{execution.id}</h1>
              <p className="text-sm text-muted">
                {execution.trigger_type === 'manual' ? '手动触发' : execution.trigger_type === 'scheduled' ? '定时任务' : '迭代'}
                {' · '}
                {execution.started_at ? new Date(execution.started_at).toLocaleString('zh-CN') : ''}
                {execution.completed_at ? ` · 耗时: ${formatDuration(execution.started_at, execution.completed_at)}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant={
                execution.status === 'completed' ? 'success' :
                execution.status === 'failed' ? 'destructive' :
                execution.status === 'running' ? 'default' : 'secondary'
              }
            >
              {execution.status === 'running' && <Loader2 className="w-3 h-3 animate-spin mr-1" />}
              {execution.status === 'completed' ? '已完成' :
               execution.status === 'failed' ? '失败' :
               execution.status === 'running' ? '进行中' : '空闲'}
            </Badge>
            <Button onClick={refreshExecution} variant="outline" size="sm" className="gap-1">
              <RefreshCw className="w-3 h-3" />
              刷新
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        {execution.status === 'running' && execution.current_step && (
          <Card className="mb-6 bg-card border-border">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-text flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary animate-pulse" />
                  当前阶段: {STEP_LABELS[execution.current_step] || execution.current_step}
                </span>
                <span className="text-sm text-primary">{Math.round((execution.progress || 0) * 100)}%</span>
              </div>
              <Progress value={(execution.progress || 0) * 100} className="mb-3" />
              <div className="flex justify-between">
                {STEP_ORDER.map((step, i) => {
                  const isDone = i < currentStepIndex
                  const isCurrent = i === currentStepIndex
                  return (
                    <div
                      key={step}
                      className={`flex flex-col items-center gap-1 ${
                        isDone ? 'text-green-400' : isCurrent ? 'text-primary' : 'text-muted'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${
                        isDone ? 'bg-green-400' : isCurrent ? 'bg-primary animate-pulse' : 'bg-border'
                      }`} />
                      <span className="text-xs">{STEP_LABELS[step]}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Streaming Content Display */}
        {streamingContent && (
          <Card className="mb-6 bg-card border-border">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-3">
                {isStreaming && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                <h3 className="text-sm font-medium text-text">{streamingLabel || '分析内容'}</h3>
                {isStreaming && <span className="text-xs text-muted animate-pulse">实时生成中...</span>}
              </div>
              <pre className="text-sm text-text whitespace-pre-wrap break-words font-sans max-h-64 overflow-y-auto bg-bg rounded-lg p-3 border border-border">
                {formatStreamingContent(streamingContent)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {execution.error_message && (
          <Card className="mb-6 bg-red-500/5 border-red-500/20">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-400 mb-1">执行失败</h3>
                  <p className="text-sm text-muted">{execution.error_message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Execution Summary Card */}
        {execution.status === 'completed' && (
          <Card className="mb-6 bg-card border-border">
            <CardContent className="pt-4">
              <h3 className="text-sm font-medium text-text mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                执行完成
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted">触发方式</span>
                  <p className="text-text font-medium">
                    {execution.trigger_type === 'manual' ? '手动触发' : execution.trigger_type === 'scheduled' ? '定时任务' : '迭代'}
                  </p>
                </div>
                <div>
                  <span className="text-muted">开始时间</span>
                  <p className="text-text font-medium">
                    {execution.started_at ? new Date(execution.started_at).toLocaleString('zh-CN') : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-muted">执行耗时</span>
                  <p className="text-text font-medium">
                    {execution.started_at ? formatDuration(execution.started_at, execution.completed_at) : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-muted">报告</span>
                  <p className="text-text font-medium">
                    {execution.report_id ? `ID: ${execution.report_id}` : '无'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Log Container */}
        <Card className="bg-card border-border h-[calc(100vh-400px)] flex flex-col">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-medium text-text">执行日志</h2>
            <div className="flex items-center gap-2 text-xs text-muted">
              {isStreaming ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  实时连接中
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3" />
                  {execution.status === 'completed' ? '已完成' : '已断开'}
                </>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`p-3 rounded-lg ${
                  log.type === 'stage' ? 'bg-blue-500/10 border border-blue-500/20' :
                  log.type === 'step_log' ? 'bg-green-500/10 border border-green-500/20' :
                  log.type === 'done' ? 'bg-green-500/10 border border-green-500/20' :
                  'bg-red-500/10 border border-red-500/20'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-medium ${
                    log.type === 'stage' ? 'text-blue-400' :
                    log.type === 'step_log' ? 'text-green-400' :
                    log.type === 'done' ? 'text-green-400' :
                    log.type === 'error' ? 'text-red-400' :
                    'text-muted'
                  }`}>
                    {log.timestamp.toLocaleTimeString('zh-CN')}
                  </span>
                </div>
                <pre className="text-sm text-text whitespace-pre-wrap break-words font-sans max-h-48 overflow-y-auto">
                  {log.content}
                </pre>
              </div>
            ))}

            {isStreaming && (
              <div className="flex items-center gap-2 text-muted text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                正在处理...
              </div>
            )}

            <div ref={logsEndRef} />
          </div>
        </Card>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {execution.report_id && (
              <Link href={`/reports/${execution.report_id}`}>
                <Button className="gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  查看完整报告
                </Button>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
