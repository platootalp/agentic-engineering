import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, AlertCircle, Pencil, Trash2, Sparkles, Building2, MapPin, Banknote, Calendar, ExternalLink } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { jobService } from '@/services/job.service'
import { JobAnalysisResult } from '@/components/jobs/JobAnalysisResult'
import type { JobWithAnalysis, JobSource, JobStatus, JobAnalysis } from '@/types/job'

const sourceLabels: Record<JobSource, string> = {
  manual: '手动录入',
  linkedin: 'LinkedIn',
  indeed: 'Indeed',
  boss: 'Boss直聘',
  lagou: '拉勾网',
  other: '其他',
}

const statusConfig: Record<JobStatus, { label: string; className: string }> = {
  pending: { label: '待分析', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  analyzing: { label: '分析中', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  analyzed: { label: '已分析', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  error: { label: '分析失败', className: 'bg-red-100 text-red-700 border-red-200' },
}

export function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [job, setJob] = useState<JobWithAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState<'description' | 'analysis'>('description')

  useEffect(() => {
    if (id) {
      fetchJob()
    }
  }, [id])

  const fetchJob = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await jobService.getJob(id!)
      setJob(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!job) return
    setIsAnalyzing(true)
    try {
      const analysis: JobAnalysis = await jobService.analyzeJob(job.id)
      setJob((prev) => (prev ? { ...prev, analysis, status: 'analyzed' } : null))
      setActiveTab('analysis')
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失败')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDelete = async () => {
    if (!job) return
    if (!confirm('确定要删除这个职位吗？此操作不可撤销。')) return

    setIsDeleting(true)
    try {
      await jobService.deleteJob(job.id)
      navigate('/jobs')
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败')
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="container py-8">
        <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error || '职位不存在'}
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => navigate('/jobs')}>
            返回列表
          </Button>
        </div>
      </div>
    )
  }

  const status = statusConfig[job.status]

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <Button
              variant="ghost"
              className="mb-4 -ml-4"
              onClick={() => navigate('/jobs')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回列表
            </Button>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{job.position}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${status.className}`}>
                {status.label}
              </span>
            </div>
            <p className="text-muted-foreground text-lg">{job.companyName}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/jobs/${job.id}/edit`)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              编辑
            </Button>
            <Button
              variant="default"
              onClick={handleAnalyze}
              disabled={isAnalyzing || job.status === 'analyzing'}
            >
              {isAnalyzing || job.status === 'analyzing' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {job.analysis ? '重新分析' : '开始分析'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              删除
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Job Info */}
        <Card>
          <CardHeader>
            <CardTitle>职位信息</CardTitle>
            <CardDescription>基本信息和招聘详情</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">公司名称</p>
                  <p className="font-medium">{job.companyName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">工作地点</p>
                  <p className="font-medium">{job.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Banknote className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">薪资范围</p>
                  <p className="font-medium">{job.salary}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ExternalLink className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">来源渠道</p>
                  <p className="font-medium">{sourceLabels[job.source]}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">创建时间</p>
                  <p className="font-medium">
                    {new Date(job.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card>
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-6 py-4 text-sm font-medium transition-colors relative
                           ${activeTab === 'description'
                             ? 'text-primary'
                             : 'text-muted-foreground hover:text-foreground'
                           }`}
              >
                JD原文
                {activeTab === 'description' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('analysis')}
                className={`px-6 py-4 text-sm font-medium transition-colors relative
                           ${activeTab === 'analysis'
                             ? 'text-primary'
                             : 'text-muted-foreground hover:text-foreground'
                           }`}
              >
                AI分析
                {activeTab === 'analysis' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            </div>
          </div>
          <CardContent className="pt-6">
            {activeTab === 'description' ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">职位描述</h3>
                <div className="bg-muted rounded-lg p-4">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {job.description}
                  </pre>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold mb-4">AI 分析结果</h3>
                <JobAnalysisResult
                  analysis={job.analysis || null}
                  isAnalyzing={isAnalyzing}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default JobDetail
