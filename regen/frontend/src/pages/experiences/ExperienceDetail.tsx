import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Briefcase,
  GraduationCap,
  Folder,
  ArrowLeft,
  Edit,
  Trash2,
  Star,
  Loader2,
  AlertCircle,
  MapPin,
  Calendar,
  Sparkles,
  Building2,
  Tag,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { GlassCard } from '@/components/ui/glass-card'
import { GradientButton } from '@/components/ui/gradient-button'
import { FadeIn } from '@/components/ui/fade-in'
import { ExperienceForm } from '@/components/experiences/ExperienceForm'
import { experienceService } from '@/services/experience.service'
import type {
  Experience,
  ExperienceType,
  UpdateExperienceRequest,
} from '@/types/experience'
import type { ExperienceFormData } from '@/lib/validations/experience'

const typeConfig: Record<
  ExperienceType,
  { label: string; icon: React.ReactNode; color: string; gradient: string }
> = {
  work: {
    label: '工作经历',
    icon: <Briefcase className="h-5 w-5" />,
    color: 'bg-blue-500',
    gradient: 'from-blue-500 to-cyan-500',
  },
  education: {
    label: '教育经历',
    icon: <GraduationCap className="h-5 w-5" />,
    color: 'bg-green-500',
    gradient: 'from-emerald-500 to-teal-500',
  },
  project: {
    label: '项目经历',
    icon: <Folder className="h-5 w-5" />,
    color: 'bg-purple-500',
    gradient: 'from-purple-500 to-pink-500',
  },
}

export function ExperienceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [experience, setExperience] = useState<Experience | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizeResult, setOptimizeResult] = useState<{
    description: string
    skills: string[]
    achievements: string[]
  } | null>(null)

  useEffect(() => {
    if (id) {
      fetchExperience()
    }
  }, [id])

  const fetchExperience = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await experienceService.getExperienceById(id!)
      setExperience(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取经历详情失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (data: ExperienceFormData) => {
    if (!experience) return

    try {
      setIsSubmitting(true)
      setError(null)

      const skills = data.skills
        ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : []
      const achievements = data.achievements
        ? data.achievements.split('\n').map((s) => s.trim()).filter(Boolean)
        : []

      const updateData: UpdateExperienceRequest = {
        title: data.title,
        organization: data.organization,
        location: data.location || undefined,
        start_date: data.start_date,
        end_date: data.is_current ? undefined : data.end_date || undefined,
        is_current: data.is_current,
        description: data.description || undefined,
        skills,
        achievements,
        is_highlighted: data.is_highlighted,
      }

      await experienceService.updateExperience(experience.id, updateData)
      setIsEditOpen(false)
      fetchExperience()
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新经历失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!experience) return

    try {
      setIsDeleting(true)
      await experienceService.deleteExperience(experience.id)
      navigate('/experiences')
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除经历失败')
      setIsDeleteOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleOptimize = async () => {
    if (!experience) return

    try {
      setIsOptimizing(true)
      setError(null)
      const result = await experienceService.optimizeDescription(experience.id)
      setOptimizeResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI优化失败')
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleToggleHighlight = async () => {
    if (!experience) return

    try {
      await experienceService.toggleHighlight(experience.id, !experience.is_highlighted)
      fetchExperience()
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
    })
  }

  const formatDateRange = (exp: Experience) => {
    const start = formatDate(exp.start_date)
    const end = exp.is_current ? '至今' : exp.end_date ? formatDate(exp.end_date) : ''
    return `${start} - ${end}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="container py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    )
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="container py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>错误</AlertTitle>
            <AlertDescription>经历不存在或已被删除</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const config = typeConfig[experience.type]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container py-8">
        <div className="space-y-8">
          {error && (
            <FadeIn>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>错误</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </FadeIn>
          )}

          <FadeIn>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigate('/experiences')} className="bg-white/70 backdrop-blur-sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className={`rounded-full p-3 bg-gradient-to-br ${config.gradient} shadow-lg`}>
                  <div className="text-white">{config.icon}</div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    {experience.title}
                  </h1>
                  <p className="text-muted-foreground">{config.label}</p>
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="flex flex-wrap items-center gap-3">
              <GradientButton variant="outline" onClick={() => setIsEditOpen(true)}>
                <Edit className="mr-2 h-4 w-4" />
                编辑
              </GradientButton>
              <Button
                variant="outline"
                onClick={handleToggleHighlight}
                className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200"
              >
                <Star
                  className={`mr-2 h-4 w-4 ${
                    experience.is_highlighted ? 'fill-amber-500 text-amber-500' : 'text-slate-400'
                  }`}
                />
                {experience.is_highlighted ? '取消高亮' : '高亮显示'}
              </Button>
              <Button
                variant="outline"
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
              >
                {isOptimizing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                AI优化
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDeleteOpen(true)}
                className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                删除
              </Button>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <GlassCard
              hover
              glow={experience.is_highlighted ? 'primary' : 'none'}
              className={experience.is_highlighted ? 'ring-2 ring-indigo-500/20' : ''}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl bg-gradient-to-b ${config.gradient}`} />
              <div className="p-6 pl-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-slate-500" />
                      {experience.organization}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {formatDateRange(experience)}
                      </span>
                      {experience.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {experience.location}
                        </span>
                      )}
                    </div>
                  </div>
                  {experience.is_highlighted && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      精选
                    </Badge>
                  )}
                </div>

                {experience.description && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <span className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
                      描述
                    </h3>
                    <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{experience.description}</p>
                  </div>
                )}

                {experience.skills.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <span className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
                      技能
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {experience.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-1">
                          <Tag className="h-3 w-3 mr-1.5" />
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {experience.achievements.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <span className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
                      成就
                    </h3>
                    <ul className="space-y-3">
                      {experience.achievements.map((achievement, index) => (
                        <li key={index} className="text-slate-600 flex items-start gap-3">
                          <span className="text-indigo-500 mt-1">•</span>
                          <span className="leading-relaxed">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </GlassCard>
          </FadeIn>

          {optimizeResult && (
            <FadeIn delay={0.3}>
              <GlassCard glow="accent" className="border-emerald-500/30">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">AI优化建议</h3>
                      <p className="text-sm text-slate-500">基于您的经历，AI生成的优化版本</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">优化描述</h4>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg">
                        {optimizeResult.description}
                      </p>
                    </div>

                    {optimizeResult.skills.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">推荐技能</h4>
                        <div className="flex flex-wrap gap-2">
                          {optimizeResult.skills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="border-emerald-200 text-emerald-700">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {optimizeResult.achievements.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-slate-700 mb-2">推荐成就描述</h4>
                        <ul className="space-y-1">
                          {optimizeResult.achievements.map((achievement, index) => (
                            <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                              <span className="text-emerald-500 mt-1">•</span>
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => setOptimizeResult(null)}
                        variant="outline"
                        className="bg-white/70 backdrop-blur-sm"
                      >
                        关闭
                      </Button>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </FadeIn>
          )}

          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>编辑经历</DialogTitle>
                <DialogDescription>修改您的经历信息</DialogDescription>
              </DialogHeader>
              <ExperienceForm
                experience={experience}
                onSubmit={handleUpdate}
                onCancel={() => setIsEditOpen(false)}
                isLoading={isSubmitting}
              />
            </DialogContent>
          </Dialog>

          <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认删除</AlertDialogTitle>
                <AlertDialogDescription>
                  此操作不可撤销，确定要删除这条经历吗？
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  删除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}

export default ExperienceDetailPage
