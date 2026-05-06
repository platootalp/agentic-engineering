'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const SSE_TIMEOUT = 600000 // 10 minutes

interface StreamEvent {
  type: 'stage' | 'step_log' | 'token' | 'done' | 'error' | 'close' | 'init'
  stage?: string
  step?: string
  message?: string
  content?: string
  report_id?: string
}

interface LogEntry {
  timestamp: string
  type: string
  title: string
  content: string
  isToken?: boolean
  collapsed: boolean
}

export default function GeneratePage() {
  const router = useRouter()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [currentStage, setCurrentStage] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [reportId, setReportId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const logContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom when logs change
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  function addLog(type: string, title: string, content: string) {
    setLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString('zh-CN'),
      type,
      title,
      content,
      collapsed: false,
    }])
  }

  function toggleCollapse(index: number) {
    setLogs(prev => prev.map((log, i) =>
      i === index ? { ...log, collapsed: !log.collapsed } : log
    ))
  }

  async function startGeneration() {
    setError(null)
    setLogs([])
    setIsComplete(false)
    setReportId(null)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), SSE_TIMEOUT)

      const response = await fetch(`${API_URL}/api/v1/reports/generate/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: [] }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
        throw new Error(errorData.detail || `HTTP error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      if (!reader) throw new Error('No response body')

      while (true) {
        try {
          const { done, value } = await reader.read()

          if (done) {
            // Check if we received a report_id before connection closed
            if (!reportId && !isComplete && !error) {
              // Connection closed without completion - might be a timeout on server side
              addLog('error', '连接中断', '服务器连接已关闭，请检查报告是否生成成功')
            }
            break
          }

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('event:')) {
              continue
            }
            if (line.startsWith('data:')) {
              const dataStr = line.slice(5).trim()
              if (!dataStr) continue
              try {
                const event: StreamEvent = JSON.parse(dataStr)
                // Skip close events
                if (event.type === 'close') continue
                handleStreamEvent(event)
              } catch (e) {
                console.error('Failed to parse SSE data:', e, 'Raw:', dataStr)
              }
            }
          }
        } catch (readError) {
          if ((readError as Error).name === 'AbortError') {
            setError('请求超时，请稍后重试或检查报告是否生成成功')
            addLog('error', '超时', '请求超时')
          } else {
            throw readError
          }
          break
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        setError('请求超时，请稍后重试或检查报告是否生成成功')
      } else {
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }
  }

  function handleStreamEvent(event: StreamEvent) {
    switch (event.type) {
      case 'init':
        // Initial connection established
        addLog('stage', '初始化', event.message || '正在连接...')
        break
      case 'stage':
        setCurrentStage(event.message || '')
        if (event.stage) {
          addLog('stage', `阶段: ${event.stage}`, event.message || '')
        } else {
          addLog('stage', '阶段', event.message || '')
        }
        break
      case 'step_log':
        const stepName = event.step || '步骤'
        addLog('step_log', stepName, event.message || '')
        break
      case 'token':
        if (event.content) {
          // Append token to the last log entry or create new one
          setLogs(prev => {
            const content = event.content || ''
            if (prev.length > 0 && prev[prev.length - 1].isToken) {
              // Append to last token log
              const lastLog = prev[prev.length - 1]
              return [
                ...prev.slice(0, -1),
                {
                  ...lastLog,
                  content: lastLog.content + content,
                  timestamp: lastLog.timestamp,
                }
              ]
            } else {
              // Create new token log
              return [...prev, {
                timestamp: new Date().toLocaleTimeString('zh-CN'),
                type: 'token',
                title: 'AI 思考中',
                content: content,
                isToken: true,
                collapsed: false,
              }]
            }
          })
        }
        break
      case 'done':
        setIsComplete(true)
        setReportId(event.report_id || null)
        setCurrentStage('完成')
        addLog('done', '完成', `报告已生成: ${event.report_id}`)
        break
      case 'error':
        setError(event.message || 'Unknown error')
        setCurrentStage('出错')
        addLog('error', '错误', event.message || '')
        break
    }
  }

  useEffect(() => {
    startGeneration()
  }, [])

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text mb-2">报告生成过程</h1>
          <p className="text-muted">实时展示 AI 生成报告时的完整思考与分析过程</p>
        </div>

        {/* Current Stage */}
        {currentStage && !isComplete && (
          <div className="mb-6 p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
              <span className="text-text">{currentStage}</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400">错误: {error}</p>
          </div>
        )}

        {/* Log Container */}
        <div ref={logContainerRef} className="space-y-3 max-h-[60vh] overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="bg-card border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCollapse(index)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-border/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted">{log.timestamp}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    log.type === 'stage' ? 'bg-blue-500/20 text-blue-400' :
                    log.type === 'step_log' ? 'bg-green-500/20 text-green-400' :
                    log.type === 'token' ? 'bg-primary/20 text-primary' :
                    log.type === 'done' ? 'bg-green-500/20 text-green-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {log.title}
                  </span>
                </div>
                <span className="text-muted">{log.collapsed ? '▶' : '▼'}</span>
              </button>
              {!log.collapsed && (
                <div className="px-4 py-3 border-t border-border">
                  <pre className="text-sm text-text whitespace-pre-wrap break-words font-mono">
                    {log.content}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Complete State */}
        {isComplete && reportId && (
          <div className="mt-8 p-6 bg-card border border-green-500/30 rounded-lg text-center">
            <div className="text-4xl mb-4">✓</div>
            <h2 className="text-xl font-semibold text-text mb-4">报告生成完成</h2>
            <p className="text-muted mb-6">报告 ID: {reportId}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push(`/reports/${reportId}`)}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
              >
                查看完整报告
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-card border border-border text-text rounded-lg hover:bg-border/30 transition-colors"
              >
                返回首页
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {!isComplete && logs.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mb-4" />
            <p className="text-muted">正在连接...</p>
          </div>
        )}
      </main>
    </div>
  )
}
