import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Loader2, AlertCircle, Pencil, Trash2, Download, Copy, Star,
  FileText, Briefcase, GraduationCap, Folder, Wrench, User, Calendar,
  MapPin, Mail, Phone, Link as LinkIcon, Github, Globe, CheckCircle2,
  Archive, Send, Building2, ExternalLink, Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { resumeService } from '@/services/resume.service'
import type { ResumeWithDetails, ResumeExperience, ResumeEducation, ResumeProject, ResumeSkill, PersonalInfo } from '@/types/resume'
import { resumeStatusConfig, resumeTemplateLabels } from '@/types/resume'

const formatDate = (dateString?: string) => {
  if (!dateString) return '至今'
  return new Date(dateString).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' })
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const PersonalInfoSection = ({ info }: { info: PersonalInfo }) => (
  <Card className="print:shadow-none print:border-gray-300">
    <CardHeader className="pb-4">
      <CardTitle className="flex items-center gap-2 text-xl">
        <User className="h-5 w-5 text-primary" />个人信息
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex-1 space-y-3">
        <h3 className="text-2xl font-bold">{info.full_name}</h3>
        {info.summary && <p className="text-muted-foreground leading-relaxed">{info.summary}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
        <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" /><span>{info.email}</span></div>
        {info.phone && <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" /><span>{info.phone}</span></div>}
        {info.location && <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground" /><span>{info.location}</span></div>}
        {info.linkedin && <div className="flex items-center gap-2 text-sm"><LinkIcon className="h-4 w-4 text-muted-foreground" /><a href={info.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">LinkedIn</a></div>}
        {info.github && <div className="flex items-center gap-2 text-sm"><Github className="h-4 w-4 text-muted-foreground" /><a href={info.github} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">GitHub</a></div>}
        {info.website && <div className="flex items-center gap-2 text-sm"><Globe className="h-4 w-4 text-muted-foreground" /><a href={info.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">个人网站</a></div>}
      </div>
    </CardContent>
  </Card>
)

const ExperienceSection = ({ experiences }: { experiences: ResumeExperience[] }) => {
  if (experiences.length === 0) {
    return (
      <Card className="print:shadow-none print:border-gray-300">
        <CardHeader><CardTitle className="flex items-center gap-2 text-xl"><Briefcase className="h-5 w-5 text-primary" />工作经历</CardTitle></CardHeader>
        <CardContent><div className="text-center py-8 text-muted-foreground"><Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>暂无工作经历</p></div></CardContent>
      </Card>
    )
  }
  return (
    <Card className="print:shadow-none print:border-gray-300">
      <CardHeader><CardTitle className="flex items-center gap-2 text-xl"><Briefcase className="h-5 w-5 text-primary" />工作经历</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-6">
          {experiences.map((exp, index) => (
            <div key={exp.id} className={index !== experiences.length - 1 ? 'pb-6 border-b' : ''}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                <div><h4 className="font-semibold text-lg">{exp.title}</h4><p className="text-muted-foreground">{exp.organization}</p></div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="h-4 w-4" /><span>{formatDate(exp.start_date)} - {exp.is_current ? '至今' : formatDate(exp.end_date)}</span></div>
              </div>
              {exp.location && <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><MapPin className="h-4 w-4" /><span>{exp.location}</span></div>}
              {exp.description && <p className="text-sm text-muted-foreground mb-3">{exp.description}</p>}
              {exp.achievements.length > 0 && (
                <ul className="space-y-1">
                  {exp.achievements.map((achievement, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /><span>{achievement}</span></li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const EducationSection = ({ education }: { education: ResumeEducation[] }) => {
  if (education.length === 0) {
    return (
      <Card className="print:shadow-none print:border-gray-300">
        <CardHeader><CardTitle className="flex items-center gap-2 text-xl"><GraduationCap className="h-5 w-5 text-primary" />教育经历</CardTitle></CardHeader>
        <CardContent><div className="text-center py-8 text-muted-foreground"><GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>暂无教育经历</p></div></CardContent>
      </Card>
    )
  }
  return (
    <Card className="print:shadow-none print:border-gray-300">
      <CardHeader><CardTitle className="flex items-center gap-2 text-xl"><GraduationCap className="h-5 w-5 text-primary" />教育经历</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-6">
          {education.map((edu, index) => (
            <div key={edu.id} className={index !== education.length - 1 ? 'pb-6 border-b' : ''}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                <div><h4 className="font-semibold text-lg">{edu.institution}</h4><p className="text-muted-foreground">{edu.degree}{edu.field_of_study && ` · ${edu.field_of_study}`}</p></div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="h-4 w-4" /><span>{formatDate(edu.start_date)} - {edu.is_current ? '至今' : formatDate(edu.end_date)}</span></div>
              </div>
              {edu.location && <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2"><MapPin className="h-4 w-4" /><span>{edu.location}</span></div>}
              {edu.description && <p className="text-sm text-muted-foreground">{edu.description}</p>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const ProjectsSection = ({ projects }: { projects: ResumeProject[] }) => {
  if (projects.length === 0) {
    return (
      <Card className="print:shadow-none print:border-gray-300">
        <CardHeader><CardTitle className="flex items-center gap-2 text-xl"><Folder className="h-5 w-5 text-primary" />项目经历</CardTitle></CardHeader>
        <CardContent><div className="text-center py-8 text-muted-foreground"><Folder className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>暂无项目经历</p></div></CardContent>
      </Card>
    )
  }
  return (
    <Card className="print:shadow-none print:border-gray-300">
      <CardHeader><CardTitle className="flex items-center gap-2 text-xl"><Folder className="h-5 w-5 text-primary" />项目经历</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-6">
          {projects.map((project, index) => (
            <div key={project.id} className={index !== projects.length - 1 ? 'pb-6 border-b' : ''}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-semibold text-lg">{project.name}</h4>
                  {(project.start_date || project.end_date) && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="h-4 w-4" /><span>{project.start_date && formatDate(project.start_date)}{project.start_date && project.end_date && ' - '}{project.end_date && formatDate(project.end_date)}</span></div>}
                </div>
                {project.url && <a href={project.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline"><ExternalLink className="h-4 w-4" />查看项目</a>}
              </div>
              {project.description && <p className="text-sm text-muted-foreground mb-3">{project.description}</p>}
              {project.technologies.length > 0 && <div className="flex flex-wrap gap-2">{project.technologies.map((tech, idx) => <Badge key={idx} variant="secondary" className="text-xs">{tech}</Badge>)}</div>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const SkillsSection = ({ skills }: { skills: ResumeSkill[] }) => {
  if (skills.length === 0) {
    return (
      <Card className="print:shadow-none print:border-gray-300">
        <CardHeader><CardTitle className="flex items-center gap-2 text-xl"><Wrench className="h-5 w-5 text-primary" />技能</CardTitle></CardHeader>
        <CardContent><div className="text-center py-8 text-muted-foreground"><Wrench className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>暂无技能信息</p></div></CardContent>
      </Card>
    )
  }
  return (
    <Card className="print:shadow-none print:border-gray-300">
      <CardHeader><CardTitle className="flex items-center gap-2 text-xl"><Wrench className="h-5 w-5 text-primary" />技能</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-4">
          {skills.map((skillGroup, index) => (
            <div key={index}>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">{skillGroup.category}</h4>
              <div className="flex flex-wrap gap-2">{skillGroup.items.map((skill, idx) => <Badge key={idx} variant="outline" className="text-sm">{skill}</Badge>)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

const CertificationsSection = ({ certifications }: { certifications?: string[] }) => {
  if (!certifications || certifications.length === 0) return null
  return (
    <Card className="print:shadow-none print:border-gray-300">
      <CardHeader><CardTitle className="flex items-center gap-2 text-xl"><CheckCircle2 className="h-5 w-5 text-primary" />证书</CardTitle></CardHeader>
      <CardContent>
        <ul className="space-y-2">{certifications.map((cert, index) => <li key={index} className="flex items-start gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" /><span>{cert}</span></li>)}</ul>
      </CardContent>
    </Card>
  )
}

const LanguagesSection = ({ languages }: { languages?: string[] }) => {
  if (!languages || languages.length === 0) return null
  return (
    <Card className="print:shadow-none print:border-gray-300">
      <CardHeader><CardTitle className="flex items-center gap-2 text-xl"><Globe className="h-5 w-5 text-primary" />语言</CardTitle></CardHeader>
      <CardContent><div className="flex flex-wrap gap-2">{languages.map((lang, idx) => <Badge key={idx} variant="outline">{lang}</Badge>)}</div></CardContent>
    </Card>
  )
}



export function ResumeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [resume, setResume] = useState<ResumeWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSettingDefault, setIsSettingDefault] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [activeTab, setActiveTab] = useState('preview')

  const fetchResume = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const data = await resumeService.getResumeById(id)
      setResume(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载简历失败')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchResume()
  }, [fetchResume])

  const handleExportPDF = async () => {
    if (!resume) return
    setIsExporting(true)
    try {
      const result = await resumeService.exportToPDF(resume.id)
      window.open(result.download_url, '_blank')
    } catch (err) {
      setError(err instanceof Error ? err.message : '导出PDF失败')
    } finally {
      setIsExporting(false)
    }
  }

  const handleDuplicate = async () => {
    if (!resume) return
    setIsDuplicating(true)
    try {
      const newResume = await resumeService.duplicate(resume.id)
      navigate(`/resumes/${newResume.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : '复制简历失败')
      setIsDuplicating(false)
    }
  }

  const handleDelete = async () => {
    if (!resume) return
    setIsDeleting(true)
    try {
      await resumeService.deleteResume(resume.id)
      navigate('/resumes')
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除简历失败')
      setIsDeleting(false)
    }
  }

  const handleSetDefault = async () => {
    if (!resume) return
    setIsSettingDefault(true)
    try {
      const updated = await resumeService.setAsDefault(resume.id)
      setResume((prev) => (prev ? { ...prev, is_default: updated.is_default } : null))
    } catch (err) {
      setError(err instanceof Error ? err.message : '设置默认简历失败')
    } finally {
      setIsSettingDefault(false)
    }
  }

  const handlePublish = async () => {
    if (!resume) return
    setIsPublishing(true)
    try {
      const updated = await resumeService.publish(resume.id)
      setResume((prev) => (prev ? { ...prev, status: updated.status } : null))
    } catch (err) {
      setError(err instanceof Error ? err.message : '发布简历失败')
    } finally {
      setIsPublishing(false)
    }
  }

  const handleArchive = async () => {
    if (!resume) return
    setIsArchiving(true)
    try {
      const updated = await resumeService.archive(resume.id)
      setResume((prev) => (prev ? { ...prev, status: updated.status } : null))
    } catch (err) {
      setError(err instanceof Error ? err.message : '归档简历失败')
    } finally {
      setIsArchiving(false)
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

  if (error || !resume) {
    return (
      <div className="container py-8">
        <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error || '简历不存在'}
          <Button variant="ghost" size="sm" className="ml-auto" onClick={() => navigate('/resumes')}>返回列表</Button>
        </div>
      </div>
    )
  }

  const status = resumeStatusConfig[resume.status]

  return (
    <div className="container py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <Button variant="ghost" className="mb-4 -ml-4" onClick={() => navigate('/resumes')}>
              <ArrowLeft className="mr-2 h-4 w-4" />返回列表
            </Button>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-3xl font-bold tracking-tight">{resume.title}</h1>
              <Badge variant="outline" className={status.className}>{status.label}</Badge>
              {resume.is_default && <Badge variant="secondary" className="bg-amber-100 text-amber-700"><Star className="h-3 w-3 mr-1 fill-current" />默认</Badge>}
            </div>
            <p className="text-muted-foreground">{resumeTemplateLabels[resume.template_id]}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate(`/resumes/builder?id=${resume.id}`)}><Pencil className="mr-2 h-4 w-4" />编辑</Button>
            <Button variant="outline" onClick={handleExportPDF} disabled={isExporting}>
              {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}导出PDF
            </Button>
            <Button variant="outline" onClick={handleDuplicate} disabled={isDuplicating}>
              {isDuplicating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Copy className="mr-2 h-4 w-4" />}复制
            </Button>
            {!resume.is_default && (
              <Button variant="outline" onClick={handleSetDefault} disabled={isSettingDefault}>
                {isSettingDefault ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Star className="mr-2 h-4 w-4" />}设为默认
              </Button>
            )}
            {resume.status === 'draft' && (
              <Button onClick={handlePublish} disabled={isPublishing}>
                {isPublishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}发布
              </Button>
            )}
            {resume.status === 'published' && (
              <Button variant="secondary" onClick={handleArchive} disabled={isArchiving}>
                {isArchiving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Archive className="mr-2 h-4 w-4" />}归档
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isDeleting}>
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}删除
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认删除</AlertDialogTitle>
                  <AlertDialogDescription>确定要删除这份简历吗？此操作不可撤销。</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">删除</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Error Alert */}
        {error && <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</div>}

        {/* Job Info Card */}
        {resume.job_description && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">关联职位</p>
                    <p className="font-medium">{resume.job_description.company_name} · {resume.job_description.position}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/jobs/${resume.job_description.id}`}><ExternalLink className="mr-2 h-4 w-4" />查看职位</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="preview">简历预览</TabsTrigger>
            <TabsTrigger value="details">详细信息</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="space-y-6">
            <PersonalInfoSection info={resume.content.personal_info} />
            <ExperienceSection experiences={resume.content.experiences} />
            <EducationSection education={resume.content.education} />
            <ProjectsSection projects={resume.content.projects} />
            <SkillsSection skills={resume.content.skills} />
            <CertificationsSection certifications={resume.content.certifications} />
            <LanguagesSection languages={resume.content.languages} />
          </TabsContent>
          <TabsContent value="details">
            <Card>
              <CardHeader><CardTitle>简历详情</CardTitle><CardDescription>简历的元数据和统计信息</CardDescription></CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3"><Clock className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">创建时间</p><p className="font-medium">{formatDateTime(resume.created_at)}</p></div></div>
                  <div className="flex items-center gap-3"><Clock className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">更新时间</p><p className="font-medium">{formatDateTime(resume.updated_at)}</p></div></div>
                  <div className="flex items-center gap-3"><FileText className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">模板</p><p className="font-medium">{resumeTemplateLabels[resume.template_id]}</p></div></div>
                  <div className="flex items-center gap-3"><Briefcase className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">工作经历</p><p className="font-medium">{resume.content.experiences.length} 条</p></div></div>
                  <div className="flex items-center gap-3"><GraduationCap className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">教育经历</p><p className="font-medium">{resume.content.education.length} 条</p></div></div>
                  <div className="flex items-center gap-3"><Folder className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">项目经历</p><p className="font-medium">{resume.content.projects.length} 条</p></div></div>
                  <div className="flex items-center gap-3"><Wrench className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">技能类别</p><p className="font-medium">{resume.content.skills.length} 类</p></div></div>
                  <div className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-muted-foreground" /><div><p className="text-sm text-muted-foreground">状态</p><p className="font-medium">{status.label}</p></div></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ResumeDetail
