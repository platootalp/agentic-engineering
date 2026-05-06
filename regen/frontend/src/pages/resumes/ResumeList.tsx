import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  Loader2,
  AlertCircle,
  Eye,
  Pencil,
  Trash2,
  Download,
  Star,
  FileText,
  Copy,
  Sparkles,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/fade-in'
import { resumeService } from '@/services/resume.service'
import type {
  Resume,
  ResumeStatus,
  ResumeTemplate,
  ResumeListResponse,
} from '@/types/resume'
import {
  resumeStatusConfig,
  resumeTemplateLabels,
} from '@/types/resume'


const statusOptions: { value: ResumeStatus | ''; label: string }[] = [
  { value: '', label: '全部状态' },
  { value: 'draft', label: '草稿' },
  { value: 'published', label: '已发布' },
  { value: 'archived', label: '已归档' },
]

const templateOptions: { value: ResumeTemplate | ''; label: string }[] = [
  { value: '', label: '全部模板' },
  { value: 'modern', label: '现代风格' },
  { value: 'classic', label: '经典风格' },
  { value: 'minimal', label: '极简风格' },
  { value: 'professional', label: '专业风格' },
  { value: 'creative', label: '创意风格' },
]

const PAGE_SIZE = 12

export function ResumeList() {
  const navigate = useNavigate()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<ResumeStatus | ''>('')
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | ''>('')
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
  })

  const fetchResumes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response: ResumeListResponse = await resumeService.getResumes({
        page: pagination.page,
        page_size: PAGE_SIZE,
        search: searchQuery || undefined,
        status: selectedStatus || undefined,
        template: selectedTemplate || undefined,
      })
      setResumes(response.data)
      setPagination({
        page: response.page,
        total: response.total,
        totalPages: response.total_pages,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, searchQuery, selectedStatus, selectedTemplate])

  useEffect(() => {
    fetchResumes()
  }, [fetchResumes])

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchResumes()
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }))
    }
  }

  const handleDeleteResume = async (resumeId: string) => {
    if (!confirm('确定要删除这份简历吗？此操作不可撤销。')) return

    try {
      await resumeService.deleteResume(resumeId)
      fetchResumes()
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除简历失败')
    }
  }

  const handleDuplicateResume = async (resumeId: string) => {
    try {
      await resumeService.duplicate(resumeId)
      fetchResumes()
    } catch (err) {
      setError(err instanceof Error ? err.message : '复制简历失败')
    }
  }

  const handleDownloadPDF = async (resumeId: string) => {
    try {
      const result = await resumeService.exportToPDF(resumeId)
      window.open(result.download_url, '_blank')
    } catch (err) {
      setError(err instanceof Error ? err.message : '导出PDF失败')
    }
  }

  const handleSetDefault = async (resumeId: string) => {
    try {
      await resumeService.setAsDefault(resumeId)
      fetchResumes()
    } catch (err) {
      setError(err instanceof Error ? err.message : '设置默认简历失败')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      <div className="container py-8">
        <div className="space-y-8">
          {/* Header */}
          <FadeIn>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                  我的简历
                </h1>
                <p className="text-muted-foreground mt-2 text-lg">
                  创建、管理和导出您的专业简历
                </p>
              </div>
              <GradientButton
                onClick={() => navigate('/resumes/builder')}
                size="lg"
                className="shadow-lg shadow-indigo-500/25"
              >
                <Plus className="mr-2 h-5 w-5" />
                创建简历
              </GradientButton>
            </div>
          </FadeIn>

          {/* Search and Filter */}
          <FadeIn delay={0.1}>
            <GlassCard className="p-6" glow="primary">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="搜索简历标题..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-11 h-11 bg-white/50 border-white/60 focus:bg-white/80 transition-colors"
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value as ResumeStatus | '')
                      setPagination((prev) => ({ ...prev, page: 1 }))
                    }}
                    className="h-11 rounded-xl border border-white/60 bg-white/50 px-4 py-2 text-sm backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 transition-all"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => {
                      setSelectedTemplate(e.target.value as ResumeTemplate | '')
                      setPagination((prev) => ({ ...prev, page: 1 }))
                    }}
                    className="h-11 rounded-xl border border-white/60 bg-white/50 px-4 py-2 text-sm backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 transition-all"
                  >
                    {templateOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="secondary"
                    onClick={handleSearch}
                    className="h-11 px-6 bg-white/70 hover:bg-white/90 backdrop-blur-sm"
                  >
                    搜索
                  </Button>
                </div>
              </div>
            </GlassCard>
          </FadeIn>

          {/* Error Alert */}
          {error && (
            <FadeIn>
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-600 flex items-center gap-3 backdrop-blur-sm">
                <AlertCircle className="h-5 w-5" />
                {error}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto hover:bg-red-500/10"
                  onClick={fetchResumes}
                >
                  重试
                </Button>
              </div>
            </FadeIn>
          )}

          {/* Resume Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
            </div>
          ) : resumes.length === 0 ? (
            <FadeIn>
              <GlassCard className="p-12 text-center" glow="primary">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                    <FileText className="h-12 w-12 text-indigo-500" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 text-slate-800">
                    还没有简历
                  </h3>
                  <p className="text-muted-foreground mb-8 text-lg">
                    创建您的第一份专业简历，让AI帮您优化求职竞争力
                  </p>
                  <GradientButton
                    onClick={() => navigate('/resumes/builder')}
                    size="lg"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    开始创建简历
                  </GradientButton>
                </div>
              </GlassCard>
            </FadeIn>
          ) : (
            <>
              <StaggerContainer
                className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                staggerDelay={0.08}
              >
                {resumes.map((resume) => {
                  const status = resumeStatusConfig[resume.status]
                  return (
                    <StaggerItem key={resume.id}>
                      <GlassCard
                        className="group h-full flex flex-col"
                        glow="primary"
                        hover
                      >
                        {/* Thumbnail Placeholder */}
                        <div className="relative h-40 bg-gradient-to-br from-slate-100 to-slate-200 rounded-t-2xl overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <FileText className="h-16 w-16 text-slate-300" />
                          </div>
                          {resume.is_default && (
                            <div className="absolute top-3 right-3">
                              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-400/90 text-white text-xs font-medium backdrop-blur-sm">
                                <Star className="h-3 w-3 fill-current" />
                                默认
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <div className="p-5 flex-1 flex flex-col">
                          {/* Header */}
                          <div className="mb-3">
                            <h3 className="font-semibold text-lg text-slate-800 truncate pr-2 group-hover:text-indigo-600 transition-colors">
                              {resume.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {resumeTemplateLabels[resume.template_id]}
                            </p>
                          </div>

                          {/* Status Badge */}
                          <div className="mb-4">
                            <Badge
                              variant="outline"
                              className={`${status.className} backdrop-blur-sm`}
                            >
                              {status.label}
                            </Badge>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/resumes/${resume.id}`)}
                              className="bg-white/50 hover:bg-white/80 border-white/60"
                            >
                              <Eye className="mr-1 h-3.5 w-3.5" />
                              查看
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/resumes/builder?id=${resume.id}`)}
                              className="bg-white/50 hover:bg-white/80 border-white/60"
                            >
                              <Pencil className="mr-1 h-3.5 w-3.5" />
                              编辑
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDuplicateResume(resume.id)}
                              className="bg-white/50 hover:bg-white/80 border-white/60"
                            >
                              <Copy className="mr-1 h-3.5 w-3.5" />
                              复制
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadPDF(resume.id)}
                              className="bg-white/50 hover:bg-white/80 border-white/60"
                            >
                              <Download className="mr-1 h-3.5 w-3.5" />
                              PDF
                            </Button>
                            {!resume.is_default && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetDefault(resume.id)}
                                className="bg-white/50 hover:bg-white/80 border-white/60"
                              >
                                <Star className="mr-1 h-3.5 w-3.5" />
                                默认
                              </Button>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="mt-auto pt-4 border-t border-slate-200/50 flex items-center justify-between text-sm text-muted-foreground">
                            <span>更新于 {formatDate(resume.updated_at)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:bg-destructive/10 h-8 px-2"
                              onClick={() => handleDeleteResume(resume.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </GlassCard>
                    </StaggerItem>
                  )
                })}
              </StaggerContainer>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <FadeIn delay={0.3}>
                  <div className="flex items-center justify-center gap-3 pt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="bg-white/50 hover:bg-white/80 border-white/60"
                    >
                      上一页
                    </Button>
                    <span className="text-sm text-muted-foreground px-4 py-2 bg-white/50 rounded-lg backdrop-blur-sm">
                      第 {pagination.page} 页，共 {pagination.totalPages} 页
                      （共 {pagination.total} 条记录）
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="bg-white/50 hover:bg-white/80 border-white/60"
                    >
                      下一页
                    </Button>
                  </div>
                </FadeIn>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResumeList
