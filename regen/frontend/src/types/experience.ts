export type ExperienceType = 'work' | 'education' | 'project'

export interface Experience {
  id: string
  type: ExperienceType
  title: string
  organization: string
  location?: string
  start_date: string
  end_date?: string
  is_current: boolean
  description?: string
  skills: string[]
  achievements: string[]
  is_highlighted: boolean
  created_at: string
  updated_at: string
}

export interface CreateExperienceRequest {
  type: ExperienceType
  title: string
  organization: string
  location?: string
  start_date: string
  end_date?: string
  is_current: boolean
  description?: string
  skills: string[]
  achievements: string[]
  is_highlighted?: boolean
}

export interface UpdateExperienceRequest {
  title?: string
  organization?: string
  location?: string
  start_date?: string
  end_date?: string
  is_current?: boolean
  description?: string
  skills?: string[]
  achievements?: string[]
  is_highlighted?: boolean
}

export interface ExperienceListParams {
  type?: ExperienceType
  page?: number
  limit?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export type ExperienceListResponse = PaginatedResponse<Experience>

export interface OptimizeDescriptionResponse {
  description: string
  skills: string[]
  achievements: string[]
}

export const experienceTypeLabels: Record<ExperienceType, string> = {
  work: '工作经历',
  education: '教育经历',
  project: '项目经历',
}

export const experienceTypeIcons: Record<ExperienceType, string> = {
  work: 'briefcase',
  education: 'graduation-cap',
  project: 'folder',
}
