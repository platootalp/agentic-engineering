import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Loader2, AlertCircle, Briefcase } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { JobCard } from '@/components/jobs/JobCard'
import { GlassCard, GlassContainer } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/fade-in'
import { jobService } from '@/services/job.service'
import type { Job, JobSource, JobStatus, JobListResponse } from '@/types/job'

const sourceOptions: { value: JobSource | ''; label: string }[] = [
  { value: '', label: '全部来源' },
  { value: 'manual', label: '手动录入' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'indeed', label: 'Indeed' },
  { value: 'boss', label: 'Boss直聘' },
  { value: 'lagou', label: '拉勾网' },
  { value: 'other', label: '其他' },
]

const statusOptions: { value: JobStatus | ''; label: string }[] = [
  { value: '', label: '全部状态' },
  { value: 'pending', label: '待分析' },
  { value: 'analyzing', label: '分析中' },
  { value: 'analyzed', label: '已分析' },
  { value: 'error', label: '分析失败' },
]

const PAGE_SIZE = 12

export function JobList() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSource, setSelectedSource] = useState<JobSource | ''>('')
  const [selectedStatus, setSelectedStatus] = useState<JobStatus | ''>('')
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
  })

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response: JobListResponse = await jobService.getJobs({
        page: pagination.page,
        pageSize: PAGE_SIZE,
        search: searchQuery || undefined,
        source: selectedSource || undefined,
        status: selectedStatus || undefined,
      })
      setJobs(response.data)
      setPagination({
        page: response.page,
        total: response.total,
        totalPages: response.totalPages,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, searchQuery, selectedSource, selectedStatus])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchJobs()
  }

  const handleJobClick = (job: Job) => {
    navigate(`/jobs/${job.id}`)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }))
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('确定要删除这个职位吗？')) return

    try {
      await jobService.deleteJob(jobId)
      fetchJobs()
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除职位失败')
    }
  }

  const handleAnalyzeJob = async (jobId: string) => {
    try {
      await jobService.analyzeJob(jobId)
      fetchJobs()
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析职位失败')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      <div className="container py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <FadeIn direction="down">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 bg-clip-text text-transparent">
                  职位管理
                </h1>
                <p className="text-slate-500 mt-2 text-lg">
                  管理和分析您的所有职位描述
                </p>
              </div>
              <GradientButton onClick={() => navigate('/jobs/create')} size="lg">
                <Plus className="mr-2 h-5 w-5" />
                添加职位
              </GradientButton>
            </div>
          </FadeIn>

          {/* Search and Filter */}
          <FadeIn delay={0.1}>
            <GlassContainer className="p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="搜索公司或职位..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-12 h-12 bg-white/50 border-white/60 focus:bg-white/80 transition-all text-base"
                  />
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap gap-2">
                  {sourceOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSelectedSource(opt.value as JobSource | '')
                        setPagination((prev) => ({ ...prev, page: 1 }))
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedSource === opt.value
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                          : 'bg-white/60 text-slate-600 hover:bg-white/80 border border-white/60'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Status Filter */}
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSelectedStatus(opt.value as JobStatus | '')
                        setPagination((prev) => ({ ...prev, page: 1 }))
                      }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedStatus === opt.value
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                          : 'bg-white/60 text-slate-600 hover:bg-white/80 border border-white/60'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </GlassContainer>
          </FadeIn>

          {/* Error Alert */}
          {error && (
            <FadeIn>
              <GlassCard className="p-4 border-red-200/50 bg-red-50/80">
                <div className="flex items-center gap-3 text-red-700">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1">{error}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchJobs}
                    className="text-red-700 hover:text-red-800 hover:bg-red-100"
                  >
                    重试
                  </Button>
                </div>
              </GlassCard>
            </FadeIn>
          )}

          {/* Job Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
                  <Loader2 className="h-12 w-12 animate-spin text-indigo-600 relative" />
                </div>
                <p className="text-slate-500 font-medium">加载中...</p>
              </div>
            </div>
          ) : jobs.length === 0 ? (
            <FadeIn>
              <GlassContainer className="py-20">
                <div className="flex flex-col items-center justify-center text-center px-4">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-2xl rounded-full" />
                    <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                      <Briefcase className="h-12 w-12 text-indigo-600" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">
                    暂无职位
                  </h3>
                  <p className="text-slate-500 mb-8 max-w-md text-lg">
                    开始添加您的第一个职位，让AI帮您分析并生成针对性简历
                  </p>
                  <GradientButton onClick={() => navigate('/jobs/create')} size="lg">
                    <Plus className="mr-2 h-5 w-5" />
                    添加职位
                  </GradientButton>
                </div>
              </GlassContainer>
            </FadeIn>
          ) : (
            <>
              <StaggerContainer
                className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                staggerDelay={0.08}
              >
                {jobs.map((job) => (
                  <StaggerItem key={job.id}>
                    <JobCard
                      job={job}
                      onClick={handleJobClick}
                      onDelete={handleDeleteJob}
                      onAnalyze={handleAnalyzeJob}
                    />
                  </StaggerItem>
                ))}
              </StaggerContainer>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <FadeIn delay={0.3}>
                  <div className="flex items-center justify-center gap-3 pt-8">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="bg-white/60 border-white/60 hover:bg-white/80 backdrop-blur-sm"
                    >
                      上一页
                    </Button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          const current = pagination.page
                          return (
                            page === 1 ||
                            page === pagination.totalPages ||
                            Math.abs(page - current) <= 1
                          )
                        })
                        .map((page, index, arr) => (
                          <div key={page} className="flex items-center gap-2">
                            {index > 0 && arr[index - 1] !== page - 1 && (
                              <span className="text-slate-400 px-2">...</span>
                            )}
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`w-10 h-10 rounded-xl font-medium transition-all duration-200 ${
                                pagination.page === page
                                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                  : 'bg-white/60 text-slate-600 hover:bg-white/80 border border-white/60'
                              }`}
                            >
                              {page}
                            </button>
                          </div>
                        ))}
                    </div>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="bg-white/60 border-white/60 hover:bg-white/80 backdrop-blur-sm"
                    >
                      下一页
                    </Button>
                  </div>
                  <p className="text-center text-slate-400 mt-4 text-sm">
                    共 {pagination.total} 条记录
                  </p>
                </FadeIn>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default JobList
