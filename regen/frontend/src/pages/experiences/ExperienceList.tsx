import { useState, useEffect } from 'react'
import {
  Briefcase,
  GraduationCap,
  Folder,
  Plus,
  Edit,
  Trash2,
  Star,
  Loader2,
  AlertCircle,
  MapPin,
  Calendar,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import { ExperienceForm } from '@/components/experiences/ExperienceForm'
import { experienceService } from '@/services/experience.service'
import type {
  Experience,
  ExperienceType,
  CreateExperienceRequest,
  UpdateExperienceRequest,
} from '@/types/experience'
import type { ExperienceFormData } from '@/lib/validations/experience'

const typeConfig: Record<
  ExperienceType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  work: {
    label: '工作经历',
    icon: <Briefcase className="h-4 w-4" />,
    color: 'bg-blue-500',
  },
  education: {
    label: '教育经历',
    icon: <GraduationCap className="h-4 w-4" />,
    color: 'bg-green-500',
  },
  project: {
    label: '项目经历',
    icon: <Folder className="h-4 w-4" />,
    color: 'bg-purple-500',
  },
}

export function ExperienceListPage() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<ExperienceType>('work')

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchExperiences()
  }, [activeTab])

  const fetchExperiences = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await experienceService.getExperiences({ type: activeTab })
      setExperiences(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取经历列表失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingExperience(null)
    setIsFormOpen(true)
  }

  const handleEdit = (experience: Experience) => {
    setEditingExperience(experience)
    setIsFormOpen(true)
  }

  const handleSubmit = async (data: ExperienceFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)

      const skills = data.skills
        ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : []
      const achievements = data.achievements
        ? data.achievements.split('\n').map((s) => s.trim()).filter(Boolean)
        : []

      if (editingExperience) {
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
        await experienceService.updateExperience(editingExperience.id, updateData)
      } else {
        const createData: CreateExperienceRequest = {
          type: data.type,
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
        await experienceService.createExperience(createData)
      }

      setIsFormOpen(false)
      fetchExperiences()
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存经历失败')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      setIsDeleting(true)
      await experienceService.deleteExperience(deleteId)
      setDeleteId(null)
      fetchExperiences()
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除经历失败')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleHighlight = async (experience: Experience) => {
    try {
      await experienceService.toggleHighlight(experience.id, !experience.is_highlighted)
      fetchExperiences()
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
    })
  }

  const formatDateRange = (experience: Experience) => {
    const start = formatDate(experience.start_date)
    const end = experience.is_current ? '至今' : experience.end_date ? formatDate(experience.end_date) : ''
    return `${start} - ${end}`
  }

  return (
    <div className="container py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">经历管理</h1>
            <p className="text-muted-foreground">管理您的工作、教育和项目经历</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            添加经历
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>错误</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ExperienceType)}>
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="work" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">工作经历</span>
            </TabsTrigger>
            <TabsTrigger value="education" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">教育经历</span>
            </TabsTrigger>
            <TabsTrigger value="project" className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              <span className="hidden sm:inline">项目经历</span>
            </TabsTrigger>
          </TabsList>

          {(['work', 'education', 'project'] as ExperienceType[]).map((type) => (
            <TabsContent key={type} value={type} className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : experiences.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className={`rounded-full p-3 ${typeConfig[type].color} bg-opacity-10`}>
                      {typeConfig[type].icon}
                    </div>
                    <p className="mt-4 text-muted-foreground">
                      暂无{typeConfig[type].label}，点击右上角添加
                    </p>
                    <Button className="mt-4" onClick={handleCreate}>
                      <Plus className="mr-2 h-4 w-4" />
                      添加{typeConfig[type].label}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {experiences.map((experience) => (
                    <Card
                      key={experience.id}
                      className={experience.is_highlighted ? 'border-primary' : ''}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg">{experience.title}</CardTitle>
                              {experience.is_highlighted && (
                                <Star className="h-4 w-4 fill-primary text-primary" />
                              )}
                            </div>
                            <CardDescription className="text-base font-medium">
                              {experience.organization}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleHighlight(experience)}
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  experience.is_highlighted
                                    ? 'fill-primary text-primary'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(experience)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(experience.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDateRange(experience)}</span>
                          </div>
                          {experience.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{experience.location}</span>
                            </div>
                          )}
                        </div>

                        {experience.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {experience.description}
                          </p>
                        )}

                        {experience.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {experience.skills.map((skill, index) => (
                              <Badge key={index} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {experience.achievements.length > 0 && (
                          <ul className="space-y-1">
                            {experience.achievements.slice(0, 2).map((achievement, index) => (
                              <li
                                key={index}
                                className="text-sm text-muted-foreground flex items-start gap-2"
                              >
                                <span className="text-primary mt-1">•</span>
                                <span className="line-clamp-1">{achievement}</span>
                              </li>
                            ))}
                            {experience.achievements.length > 2 && (
                              <li className="text-sm text-muted-foreground">
                                还有 {experience.achievements.length - 2} 项成就...
                              </li>
                            )}
                          </ul>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingExperience ? '编辑经历' : '添加经历'}
              </DialogTitle>
              <DialogDescription>
                {editingExperience
                  ? '修改您的经历信息'
                  : '填写以下信息添加新的经历'}
              </DialogDescription>
            </DialogHeader>
            <ExperienceForm
              experience={editingExperience}
              defaultType={activeTab}
              onSubmit={handleSubmit}
              onCancel={() => setIsFormOpen(false)}
              isLoading={isSubmitting}
            />
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
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
  )
}

export default ExperienceListPage
