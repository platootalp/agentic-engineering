import apiClient from './api'
import type {
  Experience,
  CreateExperienceRequest,
  UpdateExperienceRequest,
  ExperienceListParams,
  ExperienceListResponse,
  OptimizeDescriptionResponse,
} from '@/types/experience'

class ExperienceService {
  async getExperiences(params?: ExperienceListParams): Promise<ExperienceListResponse> {
    const response = await apiClient.get<ExperienceListResponse>('/experiences', {
      params,
    })
    return response.data
  }

  async getExperienceById(id: string): Promise<Experience> {
    const response = await apiClient.get<Experience>(`/experiences/${id}`)
    return response.data
  }

  async createExperience(data: CreateExperienceRequest): Promise<Experience> {
    const response = await apiClient.post<Experience>('/experiences', data)
    return response.data
  }

  async updateExperience(id: string, data: UpdateExperienceRequest): Promise<Experience> {
    const response = await apiClient.put<Experience>(`/experiences/${id}`, data)
    return response.data
  }

  async deleteExperience(id: string): Promise<void> {
    await apiClient.delete(`/experiences/${id}`)
  }

  async toggleHighlight(id: string, isHighlighted: boolean): Promise<Experience> {
    const response = await apiClient.patch<Experience>(`/experiences/${id}/highlight`, {
      is_highlighted: isHighlighted,
    })
    return response.data
  }

  async optimizeDescription(id: string): Promise<OptimizeDescriptionResponse> {
    const response = await apiClient.post<OptimizeDescriptionResponse>(
      `/experiences/${id}/optimize`
    )
    return response.data
  }
}

export const experienceService = new ExperienceService()
export default experienceService
