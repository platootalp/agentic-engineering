import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resumeService } from './resume.service'
import apiClient from './api'
import type {
  Resume,
  ResumeWithDetails,
  CreateResumeRequest,
  UpdateResumeRequest,
  GenerateResumeRequest,
  ResumeListResponse,
  ExportPDFResponse,
} from '@/types/resume'

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

describe('resumeService', () => {
  const mockResume: Resume = {
    id: '1',
    user_id: 'user-1',
    job_id: 'job-1',
    title: 'Software Engineer Resume',
    template_id: 'template-1',
    status: 'draft',
    is_default: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  const mockResumeWithDetails: ResumeWithDetails = {
    ...mockResume,
    sections: [],
    job: {
      id: 'job-1',
      title: 'Software Engineer',
      company: 'Tech Corp',
      source: 'manual',
      status: 'active',
      content: 'Job description',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getResumes', () => {
    it('should fetch resumes without params', async () => {
      const mockResponse = {
        data: {
          items: [mockResume],
          total: 1,
          page: 1,
          page_size: 10,
        } as ResumeListResponse,
      }

      vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse)

      const result = await resumeService.getResumes()

      expect(apiClient.get).toHaveBeenCalledWith('/resumes', { params: undefined })
      expect(result.items).toHaveLength(1)
    })

    it('should fetch resumes with params', async () => {
      const mockResponse = {
        data: {
          items: [mockResume],
          total: 1,
          page: 2,
          page_size: 20,
        } as ResumeListResponse,
      }

      vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse)

      const params = { job_id: 'job-1', status: 'draft' as const }
      await resumeService.getResumes(params)

      expect(apiClient.get).toHaveBeenCalledWith('/resumes', { params })
    })
  })

  describe('getResumeById', () => {
    it('should fetch single resume with details', async () => {
      const mockResponse = { data: mockResumeWithDetails }
      vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse)

      const result = await resumeService.getResumeById('1')

      expect(apiClient.get).toHaveBeenCalledWith('/resumes/1')
      expect(result.id).toBe('1')
      expect(result.job).toBeDefined()
    })
  })

  describe('createResume', () => {
    it('should create resume successfully', async () => {
      const createData: CreateResumeRequest = {
        job_id: 'job-1',
        title: 'New Resume',
        template_id: 'template-1',
      }

      const mockResponse = { data: mockResume }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await resumeService.createResume(createData)

      expect(apiClient.post).toHaveBeenCalledWith('/resumes', createData)
      expect(result.id).toBe('1')
    })
  })

  describe('updateResume', () => {
    it('should update resume successfully', async () => {
      const updateData: UpdateResumeRequest = {
        title: 'Updated Resume Title',
      }

      const updatedResume = { ...mockResume, title: 'Updated Resume Title' }
      const mockResponse = { data: updatedResume }
      vi.mocked(apiClient.put).mockResolvedValueOnce(mockResponse)

      const result = await resumeService.updateResume('1', updateData)

      expect(apiClient.put).toHaveBeenCalledWith('/resumes/1', updateData)
      expect(result.title).toBe('Updated Resume Title')
    })
  })

  describe('deleteResume', () => {
    it('should delete resume successfully', async () => {
      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: undefined })

      await resumeService.deleteResume('1')

      expect(apiClient.delete).toHaveBeenCalledWith('/resumes/1')
    })
  })

  describe('generate', () => {
    it('should generate resume successfully', async () => {
      const generateData: GenerateResumeRequest = {
        job_id: 'job-1',
        title: 'AI Generated Resume',
        template_id: 'template-1',
        experience_ids: ['exp-1', 'exp-2'],
      }

      const mockResponse = { data: mockResume }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await resumeService.generate(generateData)

      expect(apiClient.post).toHaveBeenCalledWith('/resumes/generate', generateData)
      expect(result.id).toBe('1')
    })
  })

  describe('exportToPDF', () => {
    it('should export resume to PDF successfully', async () => {
      const mockResponse = {
        data: {
          download_url: 'https://example.com/resume.pdf',
          expires_at: '2024-12-31T23:59:59Z',
        } as ExportPDFResponse,
      }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await resumeService.exportToPDF('1')

      expect(apiClient.post).toHaveBeenCalledWith('/resumes/1/export')
      expect(result.download_url).toBe('https://example.com/resume.pdf')
    })
  })

  describe('publish', () => {
    it('should publish resume successfully', async () => {
      const publishedResume = { ...mockResume, status: 'published' as const }
      const mockResponse = { data: publishedResume }
      vi.mocked(apiClient.patch).mockResolvedValueOnce(mockResponse)

      const result = await resumeService.publish('1')

      expect(apiClient.patch).toHaveBeenCalledWith('/resumes/1/publish')
      expect(result.status).toBe('published')
    })
  })

  describe('archive', () => {
    it('should archive resume successfully', async () => {
      const archivedResume = { ...mockResume, status: 'archived' as const }
      const mockResponse = { data: archivedResume }
      vi.mocked(apiClient.patch).mockResolvedValueOnce(mockResponse)

      const result = await resumeService.archive('1')

      expect(apiClient.patch).toHaveBeenCalledWith('/resumes/1/archive')
      expect(result.status).toBe('archived')
    })
  })

  describe('setAsDefault', () => {
    it('should set resume as default', async () => {
      const defaultResume = { ...mockResume, is_default: true }
      const mockResponse = { data: defaultResume }
      vi.mocked(apiClient.patch).mockResolvedValueOnce(mockResponse)

      const result = await resumeService.setAsDefault('1')

      expect(apiClient.patch).toHaveBeenCalledWith('/resumes/1/default')
      expect(result.is_default).toBe(true)
    })
  })

  describe('duplicate', () => {
    it('should duplicate resume successfully', async () => {
      const duplicatedResume = { ...mockResume, id: '2', title: 'Copy of Software Engineer Resume' }
      const mockResponse = { data: duplicatedResume }
      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await resumeService.duplicate('1')

      expect(apiClient.post).toHaveBeenCalledWith('/resumes/1/duplicate')
      expect(result.id).toBe('2')
    })
  })
})
