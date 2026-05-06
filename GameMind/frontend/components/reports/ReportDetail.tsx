'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, Calendar, Lightbulb, ExternalLink, Download, RefreshCw, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { api } from '@/lib/api'
import type { Report } from '@/lib/api'

interface ReportDetailProps {
  report: Report
}

export default function ReportDetail({ report }: ReportDetailProps) {
  const router = useRouter()
  const [feedback, setFeedback] = useState('')
  const [regenerating, setRegenerating] = useState(false)
  const [regenerateMsg, setRegenerateMsg] = useState('')

  function handleExport() {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${report.id}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleRegenerate() {
    if (!feedback.trim()) return
    setRegenerating(true)
    setRegenerateMsg('')
    try {
      const res = await api.reports.regenerate(String(report.id), {
        feedback: feedback.trim(),
      })
      setRegenerateMsg(`正在重新生成，新执行ID: ${res.execution_id}`)
      setTimeout(() => router.push('/execute'), 2000)
    } catch (err) {
      setRegenerateMsg(`错误: ${err instanceof Error ? err.message : '未知错误'}`)
    } finally {
      setRegenerating(false)
    }
  }

  const date = new Date(report.created_at).toLocaleString('zh-CN')
  const metrics = report.metrics

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted hover:text-text transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        返回列表
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="success">{report.status}</Badge>
            <Badge variant="secondary">v{report.version}</Badge>
            {report.iteration_depth > 0 && (
              <Badge variant="outline">{report.iteration_depth} 次迭代</Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold text-text">{report.title}</h1>
          <div className="flex items-center gap-2 text-subtle text-sm mt-2">
            <Calendar className="w-4 h-4" />
            {date}
          </div>
        </div>
        <Button variant="default" size="sm" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" />
          导出 JSON
        </Button>
      </div>

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">报告内容</TabsTrigger>
          <TabsTrigger value="data">原始数据</TabsTrigger>
          <TabsTrigger value="iterate">迭代优化</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          {/* Summary */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">摘要</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted leading-relaxed">
                {typeof report.summary === 'string' && report.summary.startsWith('{')
                  ? '（报告数据格式异常，请查看原始数据）'
                  : report.summary}
              </p>
            </CardContent>
          </Card>

          {/* Full content */}
          {report.full_content && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">完整报告</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({children}) => <h1 className="text-2xl font-bold text-text mb-4 mt-6">{children}</h1>,
                      h2: ({children}) => <h2 className="text-xl font-semibold text-text mb-3 mt-5">{children}</h2>,
                      h3: ({children}) => <h3 className="text-lg font-medium text-text mb-2 mt-4">{children}</h3>,
                      p: ({children}) => <p className="text-muted leading-relaxed mb-4">{children}</p>,
                      ul: ({children}) => <ul className="list-disc list-inside text-muted mb-4 space-y-1">{children}</ul>,
                      ol: ({children}) => <ol className="list-decimal list-inside text-muted mb-4 space-y-1">{children}</ol>,
                      li: ({children}) => <li className="text-muted">{children}</li>,
                      strong: ({children}) => <strong className="font-semibold text-text">{children}</strong>,
                      em: ({children}) => <em className="italic">{children}</em>,
                      blockquote: ({children}) => <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted my-4">{children}</blockquote>,
                      code: ({children, className}) => {
                        const isInline = !className
                        return isInline
                          ? <code className="bg-bg px-1.5 py-0.5 rounded text-sm text-accent font-mono">{children}</code>
                          : <code className={className}>{children}</code>
                      },
                      pre: ({children}) => <pre className="bg-bg p-4 rounded-lg overflow-x-auto mb-4">{children}</pre>,
                      table: ({children}) => <table className="w-full border-collapse mb-4">{children}</table>,
                      th: ({children}) => <th className="border border-border px-4 py-2 text-left text-text">{children}</th>,
                      td: ({children}) => <td className="border border-border px-4 py-2 text-muted">{children}</td>,
                      hr: () => <hr className="border-border my-6" />,
                      a: ({href, children}) => (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-accent underline">
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {report.full_content}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Insights */}
          {report.insights && report.insights.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  关键洞察
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {report.insights.map((insight, i) => (
                  <div key={i} className="bg-bg rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 text-sm font-medium mt-0.5">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-text text-sm">{insight.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {Math.round((insight.confidence || 0) * 100)}% 置信度
                          </Badge>
                        </div>
                        {insight.evidence && insight.evidence.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {insight.evidence.map((e, j) => (
                              <li key={j} className="text-xs text-muted flex items-start gap-1.5">
                                <span className="text-primary mt-1">•</span>
                                {e}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Sources */}
          {report.sources && report.sources.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-accent" />
                  数据来源
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.sources.map((source, i) => (
                    <li key={i}>
                      <a
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-accent text-sm flex items-center gap-1 transition-colors"
                      >
                        {source}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Metrics */}
          {metrics && metrics.category_rankings && metrics.category_rankings.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">品类指标</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {metrics.category_rankings.map((r, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5">
                      <span className="text-sm text-text">{r.slug || 'unknown'}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted">热指数: {r.heat_index}</span>
                        <span className={`text-xs font-medium ${r.trend?.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                          {r.trend || 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="data">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">原始数据</CardTitle>
            </CardHeader>
            <CardContent>
              <details className="group">
                <summary className="cursor-pointer text-muted hover:text-text text-sm transition-colors mb-2">
                  展开原始搜索结果 (JSON)
                </summary>
                <pre className="text-xs text-subtle overflow-x-auto max-h-96 p-3 bg-bg rounded-lg">
                  {JSON.stringify(report, null, 2)}
                </pre>
              </details>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="iterate" className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-accent" />
                迭代优化
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted">
                输入你对当前报告的反馈，Agent 将根据反馈重新分析并生成改进版报告。
                {report.iteration_depth >= 3 && (
                  <span className="block text-yellow-400 mt-1">
                    警告: 已达最大迭代次数 (3 次)，此报告已无法进一步迭代。
                  </span>
                )}
              </p>
              <Textarea
                placeholder="例如：第二部分的趋势分析不够深入，请补充更多 App Store 数据..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[120px]"
                disabled={report.iteration_depth >= 3}
              />
              {regenerateMsg && (
                <p className={`text-sm ${regenerateMsg.startsWith('错误') ? 'text-red-400' : 'text-green-400'}`}>
                  {regenerateMsg}
                </p>
              )}
              <Button
                onClick={handleRegenerate}
                disabled={!feedback.trim() || regenerating || report.iteration_depth >= 3}
                className="gap-2"
              >
                {regenerating && <Loader2 className="w-4 h-4 animate-spin" />}
                <RefreshCw className="w-4 h-4" />
                {regenerating ? '重新生成中...' : '重新生成报告'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
