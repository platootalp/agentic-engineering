import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft,
  Save,
  Send,
  Loader2,
  AlertCircle,
  User,
  Briefcase,
  GraduationCap,
  Folder,
  Wrench,
  Sparkles,
  Plus,
  Trash2,
  Bot,
  FileText,
  Check,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { TemplateSelector } from '@/components/resumes/TemplateSelector'
import { resumeService } from '@/services/resume.service'
import { jobService } from '@/services/job.service'
import { experienceService } from '@/services/experience.service'
import type {
  Resume,
  ResumeContent,
} from '@/types/resume'
import type { Job } from '@/types/job'
import type { Experience } from '@/types/experience'
import { experienceTypeLabels } from '@/types/experience'
import { cn } from '@/lib/utils'

// Validation Schemas
const personalInfoSchema = z.object({
  full_name: z.string().min(1, '请输入姓名'),
  email: z.string().email('请输入有效的邮箱地址'),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
  website: z.string().optional(),
  summary: z.string().optional(),
})

const resumeExperienceSchema = z.object({
  id: z.string(),
  title: z.string().min(1, '请输入职位'),
  organization: z.string().min(1, '请输入公司/组织'),
  location: z.string().optional(),
  start_date: z.string().min(1, '请选择开始日期'),
  end_date: z.string().optional(),
  is_current: z.boolean(),
  description: z.string().optional(),
  achievements: z.array(z.string()),
})

const resumeEducationSchema = z.object({
  id: z.string(),
  institution: z.string().min(1, '请输入学校/机构'),
  degree: z.string().min(1, '请输入学位'),
  field_of_study: z.string().optional(),
  location: z.string().optional(),
  start_date: z.string().min(1, '请选择开始日期'),
  end_date: z.string().optional(),
  is_current: z.boolean(),
  description: z.string().optional(),
})

const resumeProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1, '请输入项目名称'),
  description: z.string().optional(),
  technologies: z.array(z.string()),
  url: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
})

const resumeSkillSchema = z.object({
  category: z.string().min(1, '请输入技能类别'),
  items: z.array(z.string()),
})

const resumeFormSchema = z.object({
  title: z.string().min(1, '请输入简历标题'),
  template_id: z.enum(['modern', 'classic', 'minimal', 'professional', 'creative']),
  personal_info: personalInfoSchema,
  experiences: z.array(resumeExperienceSchema),
  education: z.array(resumeEducationSchema),
  projects: z.array(resumeProjectSchema),
  skills: z.array(resumeSkillSchema),
  certifications: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
})

type ResumeFormData = z.infer<typeof resumeFormSchema>

interface AIGenerationForm {
  job_description_id: string
  selected_experience_ids: string[]
}

export function ResumeBuilder() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const resumeId = searchParams.get('id')
  const isEditMode = !!resumeId

  // State
  const [activeTab, setActiveTab] = useState('basic')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [mode, setMode] = useState<'form' | 'ai'>('form')

  // Data State
  const [resume, setResume] = useState<Resume | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [aiForm, setAiForm] = useState<AIGenerationForm>({
    job_description_id: '',
    selected_experience_ids: [],
  })

  // Form
  const form = useForm<ResumeFormData>({
    resolver: zodResolver(resumeFormSchema),
    defaultValues: {
      title: '',
      template_id: 'modern',
      personal_info: {
        full_name: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        website: '',
        summary: '',
      },
      experiences: [],
      education: [],
      projects: [],
      skills: [],
      certifications: [],
      languages: [],
    },
  })

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({
    control: form.control,
    name: 'experiences',
  })

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control: form.control,
    name: 'education',
  })

  const {
    fields: projectFields,
    append: appendProject,
    remove: removeProject,
  } = useFieldArray({
    control: form.control,
    name: 'projects',
  })

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({
    control: form.control,
    name: 'skills',
  })

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const [jobsResponse, experiencesResponse] = await Promise.all([
          jobService.getJobs({ page: 1, pageSize: 100 }),
          experienceService.getExperiences({ limit: 100 }),
        ])

        setJobs(jobsResponse.data)
        setExperiences(experiencesResponse.data)

        if (resumeId) {
          const resumeData = await resumeService.getResumeById(resumeId)
          setResume(resumeData)

          form.reset({
            title: resumeData.title,
            template_id: resumeData.template_id,
            personal_info: resumeData.content.personal_info,
            experiences: resumeData.content.experiences || [],
            education: resumeData.content.education || [],
            projects: resumeData.content.projects || [],
            skills: resumeData.content.skills || [],
            certifications: resumeData.content.certifications || [],
            languages: resumeData.content.languages || [],
          })

          if (resumeData.selected_experience_ids) {
            setAiForm((prev) => ({
              ...prev,
              selected_experience_ids: resumeData.selected_experience_ids,
            }))
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载数据失败')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [resumeId, form])

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage, error])

  // Form submission handlers
  const handleSaveDraft = async () => {
    const isValid = await form.trigger()
    if (!isValid) {
      setError('请检查表单中的错误')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const data = form.getValues()
      const content: ResumeContent = {
        personal_info: data.personal_info,
        experiences: data.experiences,
        education: data.education,
        projects: data.projects,
        skills: data.skills,
        certifications: data.certifications || [],
        languages: data.languages || [],
      }

      if (isEditMode && resume) {
        await resumeService.updateResume(resume.id, {
          title: data.title,
          template_id: data.template_id,
          content,
          status: 'draft',
        })
      } else {
        await resumeService.createResume({
          title: data.title,
          template_id: data.template_id,
          content,
          selected_experience_ids: aiForm.selected_experience_ids,
        })
      }

      setSuccessMessage('简历已保存为草稿')
      if (!isEditMode) {
        navigate('/resumes')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败')
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    const isValid = await form.trigger()
    if (!isValid) {
      setError('请检查表单中的错误')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const data = form.getValues()
      const content: ResumeContent = {
        personal_info: data.personal_info,
        experiences: data.experiences,
        education: data.education,
        projects: data.projects,
        skills: data.skills,
        certifications: data.certifications || [],
        languages: data.languages || [],
      }

      if (isEditMode && resume) {
        await resumeService.updateResume(resume.id, {
          title: data.title,
          template_id: data.template_id,
          content,
          status: 'published',
        })
        await resumeService.publish(resume.id)
      } else {
        const newResume = await resumeService.createResume({
          title: data.title,
          template_id: data.template_id,
          content,
          selected_experience_ids: aiForm.selected_experience_ids,
        })
        await resumeService.publish(newResume.id)
      }

      setSuccessMessage('简历已发布')
      navigate('/resumes')
    } catch (err) {
      setError(err instanceof Error ? err.message : '发布失败')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAIGenerate = async () => {
    if (!aiForm.job_description_id) {
      setError('请选择职位描述')
      return
    }

    if (aiForm.selected_experience_ids.length === 0) {
      setError('请至少选择一项经历')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const result = await resumeService.generate({
        resume_id: resumeId || '',
        job_description_id: aiForm.job_description_id,
        experience_ids: aiForm.selected_experience_ids,
      })

      form.reset({
        title: result.title,
        template_id: result.template_id,
        personal_info: result.content.personal_info,
        experiences: result.content.experiences || [],
        education: result.content.education || [],
        projects: result.content.projects || [],
        skills: result.content.skills || [],
        certifications: result.content.certifications || [],
        languages: result.content.languages || [],
      })

      setResume(result)
      setMode('form')
      setSuccessMessage('AI 已成功生成简历内容')
      setActiveTab('basic')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 生成失败')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateId = () => Math.random().toString(36).substr(2, 9)

  const toggleExperienceSelection = (id: string) => {
    setAiForm((prev) => ({
      ...prev,
      selected_experience_ids: prev.selected_experience_ids.includes(id)
        ? prev.selected_experience_ids.filter((expId) => expId !== id)
        : [...prev.selected_experience_ids, id],
    }))
  }

  const selectAllExperiences = () => {
    setAiForm((prev) => ({
      ...prev,
      selected_experience_ids: experiences.map((exp) => exp.id),
    }))
  }

  const deselectAllExperiences = () => {
    setAiForm((prev) => ({
      ...prev,
      selected_experience_ids: [],
    }))
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/resumes')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {isEditMode ? '编辑简历' : '创建简历'}
              </h1>
              <p className="text-muted-foreground">
                {mode === 'ai' ? '使用 AI 生成简历内容' : '手动编辑简历内容'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={mode === 'form' ? 'default' : 'outline'}
              onClick={() => setMode('form')}
            >
              <FileText className="mr-2 h-4 w-4" />
              手动编辑
            </Button>
            <Button
              variant={mode === 'ai' ? 'default' : 'outline'}
              onClick={() => setMode('ai')}
            >
              <Bot className="mr-2 h-4 w-4" />
              AI 生成
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {successMessage && (
          <Alert className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <Check className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* AI Generation Mode */}
        {mode === 'ai' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI 简历生成
              </CardTitle>
              <CardDescription>
                选择职位描述和相关经历，AI 将为您生成量身定制的简历内容
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Job Description Selection */}
              <div className="space-y-2">
                <Label htmlFor="job-select">选择职位描述</Label>
                <select
                  id="job-select"
                  value={aiForm.job_description_id}
                  onChange={(e) => setAiForm((prev) => ({ ...prev, job_description_id: e.target.value }))}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">请选择职位...</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.position} - {job.companyName}
                    </option>
                  ))}
                </select>
                {jobs.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    暂无职位描述，请先 <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/jobs')}>添加职位</Button>
                  </p>
                )}
              </div>

              {/* Experience Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>选择要包含的经历</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAllExperiences}>
                      全选
                    </Button>
                    <Button variant="outline" size="sm" onClick={deselectAllExperiences}>
                      取消全选
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto border rounded-md p-4">
                  {experiences.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      暂无经历记录，请先 <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/experiences')}>添加经历</Button>
                    </p>
                  ) : (
                    experiences.map((exp) => (
                      <div
                        key={exp.id}
                        className={cn(
                          'flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors',
                          aiForm.selected_experience_ids.includes(exp.id)
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-muted-foreground'
                        )}
                        onClick={() => toggleExperienceSelection(exp.id)}
                      >
                        <Checkbox
                          checked={aiForm.selected_experience_ids.includes(exp.id)}
                          onCheckedChange={() => toggleExperienceSelection(exp.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{experienceTypeLabels[exp.type]}</Badge>
                            <span className="font-medium truncate">{exp.title}</span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {exp.organization} · {exp.start_date} {exp.end_date ? `- ${exp.end_date}` : '- 至今'}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  已选择 {aiForm.selected_experience_ids.length} 项经历
                </p>
              </div>

              {/* Generate Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleAIGenerate}
                disabled={isGenerating || !aiForm.job_description_id || aiForm.selected_experience_ids.length === 0}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    AI 生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    生成简历
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Form Mode */}
        {mode === 'form' && (
          <>
            {/* Basic Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
                <CardDescription>设置简历标题和选择模板</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    简历标题 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    {...form.register('title')}
                    placeholder="例如：高级前端工程师简历"
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>选择模板</Label>
                  <TemplateSelector
                    selectedTemplate={form.watch('template_id')}
                    onSelect={(template) => form.setValue('template_id', template)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tabs for Resume Sections */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">
                  <User className="mr-2 h-4 w-4" />
                  个人信息
                </TabsTrigger>
                <TabsTrigger value="experience">
                  <Briefcase className="mr-2 h-4 w-4" />
                  工作经历
                </TabsTrigger>
                <TabsTrigger value="education">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  教育经历
                </TabsTrigger>
                <TabsTrigger value="projects">
                  <Folder className="mr-2 h-4 w-4" />
                  项目经历
                </TabsTrigger>
                <TabsTrigger value="skills">
                  <Wrench className="mr-2 h-4 w-4" />
                  技能
                </TabsTrigger>
              </TabsList>

              {/* Personal Info Tab */}
              <TabsContent value="basic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>个人信息</CardTitle>
                    <CardDescription>填写您的基本联系信息</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">
                          姓名 <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="full_name"
                          {...form.register('personal_info.full_name')}
                          placeholder="请输入您的姓名"
                        />
                        {form.formState.errors.personal_info?.full_name && (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.personal_info.full_name.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">
                          邮箱 <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          {...form.register('personal_info.email')}
                          placeholder="your@email.com"
                        />
                        {form.formState.errors.personal_info?.email && (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.personal_info.email.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">电话</Label>
                        <Input
                          id="phone"
                          {...form.register('personal_info.phone')}
                          placeholder="+86 138 0000 0000"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">所在地</Label>
                        <Input
                          id="location"
                          {...form.register('personal_info.location')}
                          placeholder="例如：北京"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          {...form.register('personal_info.linkedin')}
                          placeholder="linkedin.com/in/username"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="github">GitHub</Label>
                        <Input
                          id="github"
                          {...form.register('personal_info.github')}
                          placeholder="github.com/username"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="website">个人网站</Label>
                        <Input
                          id="website"
                          {...form.register('personal_info.website')}
                          placeholder="https://your-website.com"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="summary">个人简介</Label>
                        <Textarea
                          id="summary"
                          {...form.register('personal_info.summary')}
                          placeholder="简要介绍您的专业背景和职业目标..."
                          rows={4}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Experience Tab */}
              <TabsContent value="experience" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>工作经历</CardTitle>
                      <CardDescription>添加您的工作经历</CardDescription>
                    </div>
                    <Button
                      onClick={() =>
                        appendExperience({
                          id: generateId(),
                          title: '',
                          organization: '',
                          location: '',
                          start_date: '',
                          end_date: '',
                          is_current: false,
                          description: '',
                          achievements: [],
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      添加经历
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {experienceFields.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>暂无工作经历</p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() =>
                            appendExperience({
                              id: generateId(),
                              title: '',
                              organization: '',
                              location: '',
                              start_date: '',
                              end_date: '',
                              is_current: false,
                              description: '',
                              achievements: [],
                            })
                          }
                        >
                          添加第一条经历
                        </Button>
                      </div>
                    ) : (
                      experienceFields.map((field, index) => (
                        <Card key={field.id} className="border-dashed">
                          <CardContent className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">工作经历 #{index + 1}</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeExperience(index)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>职位</Label>
                                <Input
                                  {...form.register(`experiences.${index}.title`)}
                                  placeholder="例如：高级前端工程师"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>公司/组织</Label>
                                <Input
                                  {...form.register(`experiences.${index}.organization`)}
                                  placeholder="例如：ABC科技有限公司"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>地点</Label>
                                <Input
                                  {...form.register(`experiences.${index}.location`)}
                                  placeholder="例如：北京"
                                />
                              </div>
                              <div className="space-y-2 flex items-center">
                                <div className="flex items-center gap-2 mt-6">
                                  <Checkbox
                                    checked={form.watch(`experiences.${index}.is_current`)}
                                    onCheckedChange={(checked) =>
                                      form.setValue(`experiences.${index}.is_current`, checked as boolean)
                                    }
                                  />
                                  <Label className="cursor-pointer">当前在职</Label>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>开始日期</Label>
                                <Input
                                  type="month"
                                  {...form.register(`experiences.${index}.start_date`)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>结束日期</Label>
                                <Input
                                  type="month"
                                  {...form.register(`experiences.${index}.end_date`)}
                                  disabled={form.watch(`experiences.${index}.is_current`)}
                                />
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <Label>工作描述</Label>
                                <Textarea
                                  {...form.register(`experiences.${index}.description`)}
                                  placeholder="描述您的工作职责和成就..."
                                  rows={3}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Education Tab */}
              <TabsContent value="education" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>教育经历</CardTitle>
                      <CardDescription>添加您的教育背景</CardDescription>
                    </div>
                    <Button
                      onClick={() =>
                        appendEducation({
                          id: generateId(),
                          institution: '',
                          degree: '',
                          field_of_study: '',
                          location: '',
                          start_date: '',
                          end_date: '',
                          is_current: false,
                          description: '',
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      添加教育
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {educationFields.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>暂无教育经历</p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() =>
                            appendEducation({
                              id: generateId(),
                              institution: '',
                              degree: '',
                              field_of_study: '',
                              location: '',
                              start_date: '',
                              end_date: '',
                              is_current: false,
                              description: '',
                            })
                          }
                        >
                          添加第一条教育经历
                        </Button>
                      </div>
                    ) : (
                      educationFields.map((field, index) => (
                        <Card key={field.id} className="border-dashed">
                          <CardContent className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">教育经历 #{index + 1}</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeEducation(index)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>学校/机构</Label>
                                <Input
                                  {...form.register(`education.${index}.institution`)}
                                  placeholder="例如：北京大学"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>学位</Label>
                                <Input
                                  {...form.register(`education.${index}.degree`)}
                                  placeholder="例如：本科"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>专业</Label>
                                <Input
                                  {...form.register(`education.${index}.field_of_study`)}
                                  placeholder="例如：计算机科学"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>地点</Label>
                                <Input
                                  {...form.register(`education.${index}.location`)}
                                  placeholder="例如：北京"
                                />
                              </div>
                              <div className="space-y-2 flex items-center">
                                <div className="flex items-center gap-2 mt-6">
                                  <Checkbox
                                    checked={form.watch(`education.${index}.is_current`)}
                                    onCheckedChange={(checked) =>
                                      form.setValue(`education.${index}.is_current`, checked as boolean)
                                    }
                                  />
                                  <Label className="cursor-pointer">在读</Label>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>开始日期</Label>
                                <Input
                                  type="month"
                                  {...form.register(`education.${index}.start_date`)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>结束日期</Label>
                                <Input
                                  type="month"
                                  {...form.register(`education.${index}.end_date`)}
                                  disabled={form.watch(`education.${index}.is_current`)}
                                />
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <Label>描述</Label>
                                <Textarea
                                  {...form.register(`education.${index}.description`)}
                                  placeholder="描述您的学习经历、成绩、荣誉等..."
                                  rows={3}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Projects Tab */}
              <TabsContent value="projects" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>项目经历</CardTitle>
                      <CardDescription>添加您的项目经验</CardDescription>
                    </div>
                    <Button
                      onClick={() =>
                        appendProject({
                          id: generateId(),
                          name: '',
                          description: '',
                          technologies: [],
                          url: '',
                          start_date: '',
                          end_date: '',
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      添加项目
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {projectFields.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>暂无项目经历</p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() =>
                            appendProject({
                              id: generateId(),
                              name: '',
                              description: '',
                              technologies: [],
                              url: '',
                              start_date: '',
                              end_date: '',
                            })
                          }
                        >
                          添加第一个项目
                        </Button>
                      </div>
                    ) : (
                      projectFields.map((field, index) => (
                        <Card key={field.id} className="border-dashed">
                          <CardContent className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">项目 #{index + 1}</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeProject(index)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>项目名称</Label>
                                <Input
                                  {...form.register(`projects.${index}.name`)}
                                  placeholder="例如：电商平台重构"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>项目链接</Label>
                                <Input
                                  {...form.register(`projects.${index}.url`)}
                                  placeholder="https://..."
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>开始日期</Label>
                                <Input
                                  type="month"
                                  {...form.register(`projects.${index}.start_date`)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>结束日期</Label>
                                <Input
                                  type="month"
                                  {...form.register(`projects.${index}.end_date`)}
                                />
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <Label>项目描述</Label>
                                <Textarea
                                  {...form.register(`projects.${index}.description`)}
                                  placeholder="描述项目背景、您的角色和贡献..."
                                  rows={3}
                                />
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <Label>技术栈（用逗号分隔）</Label>
                                <Input
                                  {...form.register(`projects.${index}.technologies`)}
                                  placeholder="React, TypeScript, Node.js..."
                                  onChange={(e) => {
                                    const value = e.target.value
                                    form.setValue(
                                      `projects.${index}.technologies`,
                                      value.split(',').map((s) => s.trim()).filter(Boolean)
                                    )
                                  }}
                                  value={form.watch(`projects.${index}.technologies`)?.join(', ') || ''}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Skills Tab */}
              <TabsContent value="skills" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>技能</CardTitle>
                      <CardDescription>添加您的专业技能</CardDescription>
                    </div>
                    <Button
                      onClick={() =>
                        appendSkill({
                          category: '',
                          items: [],
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      添加技能类别
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {skillFields.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>暂无技能</p>
                        <Button
                          variant="outline"
                          className="mt-4"
                          onClick={() =>
                            appendSkill({
                              category: '',
                              items: [],
                            })
                          }
                        >
                          添加第一个技能类别
                        </Button>
                      </div>
                    ) : (
                      skillFields.map((field, index) => (
                        <Card key={field.id} className="border-dashed">
                          <CardContent className="p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">技能类别 #{index + 1}</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSkill(index)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>类别名称</Label>
                                <Input
                                  {...form.register(`skills.${index}.category`)}
                                  placeholder="例如：编程语言、框架、工具..."
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>技能项（用逗号分隔）</Label>
                                <Input
                                  {...form.register(`skills.${index}.items`)}
                                  placeholder="JavaScript, Python, React..."
                                  onChange={(e) => {
                                    const value = e.target.value
                                    form.setValue(
                                      `skills.${index}.items`,
                                      value.split(',').map((s) => s.trim()).filter(Boolean)
                                    )
                                  }}
                                  value={form.watch(`skills.${index}.items`)?.join(', ') || ''}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => navigate('/resumes')}
              >
                取消
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  保存草稿
                </Button>
                <Button
                  onClick={handlePublish}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  {isEditMode ? '更新并发布' : '发布简历'}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ResumeBuilder
