import apiClient from '@/api/client'
import type {
  Resume,
  ResumeWithDetails,
  CreateResumeRequest,
  UpdateResumeRequest,
  GenerateResumeRequest,
  ResumeListParams,
  ResumeListResponse,
  ExportPDFResponse,
} from '@/types/resume'

class ResumeService {
  async getResumes(params?: ResumeListParams): Promise<ResumeListResponse> {
    const response = await apiClient.get<ResumeListResponse>('/resumes', {
      params,
    })
    return response.data
  }

  async getResumeById(id: string): Promise<ResumeWithDetails> {
    const response = await apiClient.get<ResumeWithDetails>(`/resumes/${id}`)
    return response.data
  }

  async createResume(data: CreateResumeRequest): Promise<Resume> {
    const response = await apiClient.post<Resume>('/resumes', data)
    return response.data
  }

  async updateResume(id: string, data: UpdateResumeRequest): Promise<Resume> {
    const response = await apiClient.put<Resume>(`/resumes/${id}`, data)
    return response.data
  }

  async deleteResume(id: string): Promise<void> {
    await apiClient.delete(`/resumes/${id}`)
  }

  async generate(data: GenerateResumeRequest): Promise<Resume> {
    const response = await apiClient.post<Resume>('/resumes/generate', data)
    return response.data
  }

  async exportToPDF(id: string): Promise<ExportPDFResponse> {
    const response = await apiClient.post<ExportPDFResponse>(`/resumes/${id}/export`)
    return response.data
  }

  async publish(id: string): Promise<Resume> {
    const response = await apiClient.patch<Resume>(`/resumes/${id}/publish`)
    return response.data
  }

  async archive(id: string): Promise<Resume> {
    const response = await apiClient.patch<Resume>(`/resumes/${id}/archive`)
    return response.data
  }

  async setAsDefault(id: string): Promise<Resume> {
    const response = await apiClient.patch<Resume>(`/resumes/${id}/default`)
    return response.data
  }

  async duplicate(id: string): Promise<Resume> {
    const response = await apiClient.post<Resume>(`/resumes/${id}/duplicate`)
    return response.data
  }
}

export const resumeService = new ResumeService()
export default resumeService
