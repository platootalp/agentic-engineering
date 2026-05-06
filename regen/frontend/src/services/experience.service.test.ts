import { describe, it, expect, vi, beforeEach } from 'vitest'
import { experienceService } from './experience.service'
import apiClient from './api'
import type {
  Experience,
  CreateExperienceRequest,
  UpdateExperienceRequest,
  ExperienceListResponse,
  OptimizeDescriptionResponse,
} from '@/types/experience'

// Mock the apiClient
vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('experienceService', () => {
  const mockExperience: Experience = {
    id: '1',
    user_id: 'user-1',
    type: 'work',
    title: 'Software Engineer',
    organization: 'Tech Corp',
    location: 'Beijing',
    start_date: '2020-01-01',
    end_date: '2023-12-31',
    is_current: false,
    description: 'Developed web applications',
    skills: ['React', 'TypeScript'],
    achievements: 'Increased performance by 50%',
    is_highlighted: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getExperiences', () => {
    it('should fetch experiences without params', async () => {
      const mockResponse = {
        data: {
          items: [mockExperience],
          total: 1,
          page: 1,
          page_size: 10,
        } as ExperienceListResponse,
      }

      vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse)

      const result = await experienceService.getExperiences()

      expect(apiClient.get).toHaveBeenCalledWith('/experiences', { params: undefined })
      expect(result.items).toHaveLength(1)
    })

    it('should fetch experiences with params', async () => {
      const mockResponse = {
        data: {
          items: [mockExperience],
          total: 1,
          page: 1,
          page_size: 10,
        } as ExperienceListResponse,
      }

      vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse)

      const params = { type: 'work' as const, is_highlighted: true }
      await experienceService.getExperiences(params)

      expect(apiClient.get).toHaveBeenCalledWith('/experiences', { params })
    })
  })

  describe('getExperienceById', () => {
    it('should fetch single experience by id', async () => {
      const mockResponse = { data: mockExperience }
      vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse)

      const result = await experienceService.getExperienceById('1')

      expect(apiClient.get).toHaveBeenCalledWith('/experiences/1')
      expect(result.id).toBe('1')
      expect(result.title).toBe('Software Engineer')
    })
  })

  describe('createExperience', () => {
    it('should create experience successfully', async () => {
      const createData: CreateExperienceRequest = {
        type: 'work',
        title: 'Software Engineer',
        organization: 'Tech Corp',
        location: 'Beijing',
        start_date: '2020-01-01',
        end_date: '2023-12-31',
        is_current: false,
        description: 'Developed web applications',
        skills: ['React', 'TypeScript'],
        achievements: 'Increased performance',
        is_highlighted: false,
      }

      const mockResponse = { data: mockExperience }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await experienceService.createExperience(createData)

      expect(apiClient.post).toHaveBeenCalledWith('/experiences', createData)
      expect(result.id).toBe('1')
    })
  })

  describe('updateExperience', () => {
    it('should update experience successfully', async () => {
      const updateData: UpdateExperienceRequest = {
        title: 'Senior Software Engineer',
      }

      const updatedExperience = { ...mockExperience, title: 'Senior Software Engineer' }
      const mockResponse = { data: updatedExperience }
      vi.mocked(apiClient.put).mockResolvedValueOnce(mockResponse)

      const result = await experienceService.updateExperience('1', updateData)

      expect(apiClient.put).toHaveBeenCalledWith('/experiences/1', updateData)
      expect(result.title).toBe('Senior Software Engineer')
    })
  })

  describe('deleteExperience', () => {
    it('should delete experience successfully', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: undefined })

      await experienceService.deleteExperience('1')

      expect(apiClient.delete).toHaveBeenCalledWith('/experiences/1')
    })
  })

  describe('toggleHighlight', () => {
    it('should toggle highlight on', async () => {
      const highlightedExp = { ...mockExperience, is_highlighted: true }
      const mockResponse = { data: highlightedExp }
      vi.mocked(apiClient.patch).mockResolvedValueOnce(mockResponse)

      const result = await experienceService.toggleHighlight('1', true)

      expect(apiClient.patch).toHaveBeenCalledWith('/experiences/1/highlight', {
        is_highlighted: true,
      })
      expect(result.is_highlighted).toBe(true)
    })

    it('should toggle highlight off', async () => {
      const unhighlightedExp = { ...mockExperience, is_highlighted: false }
      const mockResponse = { data: unhighlightedExp }
      vi.mocked(apiClient.patch).mockResolvedValueOnce(mockResponse)

      const result = await experienceService.toggleHighlight('1', false)

      expect(apiClient.patch).toHaveBeenCalledWith('/experiences/1/highlight', {
        is_highlighted: false,
      })
      expect(result.is_highlighted).toBe(false)
    })
  })

  describe('optimizeDescription', () => {
    it('should optimize description successfully', async () => {
      const mockResponse = {
        data: {
          optimized_description: 'Optimized experience description',
          keywords: ['React', 'TypeScript'],
          suggestions: ['Add more details'],
        } as OptimizeDescriptionResponse,
      }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await experienceService.optimizeDescription('1')

      expect(apiClient.post).toHaveBeenCalledWith('/experiences/1/optimize')
      expect(result.optimized_description).toBe('Optimized experience description')
    })
  })
})
