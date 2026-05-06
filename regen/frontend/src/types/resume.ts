export type ResumeStatus = 'draft' | 'published' | 'archived'
export type ResumeTemplate = 'modern' | 'classic' | 'minimal' | 'professional' | 'creative'

export interface PersonalInfo {
  full_name: string
  email: string
  phone?: string
  location?: string
  linkedin?: string
  github?: string
  website?: string
  summary?: string
}

export interface ResumeExperience {
  id: string
  title: string
  organization: string
  location?: string
  start_date: string
  end_date?: string
  is_current: boolean
  description?: string
  achievements: string[]
}

export interface ResumeEducation {
  id: string
  institution: string
  degree: string
  field_of_study?: string
  location?: string
  start_date: string
  end_date?: string
  is_current: boolean
  description?: string
}

export interface ResumeProject {
  id: string
  name: string
  description?: string
  technologies: string[]
  url?: string
  start_date?: string
  end_date?: string
}

export interface ResumeSkill {
  category: string
  items: string[]
}

export interface ResumeContent {
  personal_info: PersonalInfo
  experiences: ResumeExperience[]
  education: ResumeEducation[]
  projects: ResumeProject[]
  skills: ResumeSkill[]
  certifications?: string[]
  languages?: string[]
}

export interface Resume {
  id: string
  title: string
  template_id: ResumeTemplate
  content: ResumeContent
  selected_experience_ids: string[]
  status: ResumeStatus
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface ResumeWithDetails extends Resume {
  job_description?: {
    id: string
    company_name: string
    position: string
  }
}

export interface CreateResumeRequest {
  title: string
  template_id: ResumeTemplate
  content?: Partial<ResumeContent>
  selected_experience_ids?: string[]
  job_description_id?: string
}

export interface UpdateResumeRequest {
  title?: string
  template_id?: ResumeTemplate
  content?: Partial<ResumeContent>
  selected_experience_ids?: string[]
  status?: ResumeStatus
  is_default?: boolean
}

export interface GenerateResumeRequest {
  resume_id: string
  job_description_id: string
  experience_ids?: string[]
}

export interface ResumeListParams {
  page?: number
  page_size?: number
  search?: string
  status?: ResumeStatus
  template?: ResumeTemplate
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export type ResumeListResponse = PaginatedResponse<Resume>

export interface ExportPDFResponse {
  download_url: string
  filename: string
}

export const resumeStatusLabels: Record<ResumeStatus, string> = {
  draft: '草稿',
  published: '已发布',
  archived: '已归档',
}

export const resumeStatusConfig: Record<ResumeStatus, { label: string; className: string }> = {
  draft: { label: '草稿', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  published: { label: '已发布', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  archived: { label: '已归档', className: 'bg-slate-100 text-slate-700 border-slate-200' },
}

export const resumeTemplateLabels: Record<ResumeTemplate, string> = {
  modern: '现代风格',
  classic: '经典风格',
  minimal: '极简风格',
  professional: '专业风格',
  creative: '创意风格',
}

export const resumeTemplateDescriptions: Record<ResumeTemplate, string> = {
  modern: '简洁现代的设计，适合科技和创意行业',
  classic: '传统经典的布局，适合金融和法律行业',
  minimal: '极简主义风格，突出内容本身',
  professional: '专业商务风格，适合各类正式场合',
  creative: '富有创意的设计，适合设计和艺术行业',
}
