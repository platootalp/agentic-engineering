import { describe, it, expect, vi, beforeEach } from 'vitest'
import { jobService } from './job.service'
import type { Job, JobWithAnalysis, JobAnalysis, CreateJobRequest, UpdateJobRequest, JobListResponse } from '@/types/job'

// Mock global fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('jobService', () => {
  const mockJob: Job = {
    id: '1',
    title: 'Software Engineer',
    company: 'Tech Corp',
    source: 'manual',
    status: 'active',
    content: 'Job description',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  const mockJobWithAnalysis: JobWithAnalysis = {
    ...mockJob,
    analysis: {
      id: '1',
      job_id: '1',
      skills: ['React', 'TypeScript'],
      requirements: ['3+ years experience'],
      responsibilities: ['Develop web apps'],
      summary: 'Senior frontend position',
      raw_response: '{}',
      status: 'completed',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getJobs', () => {
    it('should fetch jobs without params', async () => {
      const mockResponse: JobListResponse = {
        items: [mockJob],
        total: 1,
        page: 1,
        page_size: 10,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await jobService.getJobs()

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/jobs', expect.any(Object))
      expect(result.items).toHaveLength(1)
      expect(result.total).toBe(1)
    })

    it('should fetch jobs with params', async () => {
      const mockResponse: JobListResponse = {
        items: [mockJob],
        total: 1,
        page: 2,
        page_size: 20,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await jobService.getJobs({
        page: 2,
        pageSize: 20,
        search: 'engineer',
        source: 'manual',
        status: 'active',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/jobs?page=2&pageSize=20&search=engineer&source=manual&status=active',
        expect.any(Object)
      )
    })

    it('should throw error on failed request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Server error' }),
      })

      await expect(jobService.getJobs()).rejects.toThrow('Server error')
    })
  })

  describe('getJob', () => {
    it('should fetch single job with analysis', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockJobWithAnalysis,
      })

      const result = await jobService.getJob('1')

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/jobs/1', expect.any(Object))
      expect(result.id).toBe('1')
      expect(result.analysis).toBeDefined()
    })
  })

  describe('createJob', () => {
    it('should create job successfully', async () => {
      const createData: CreateJobRequest = {
        title: 'Software Engineer',
        company: 'Tech Corp',
        content: 'Job description',
        source: 'manual',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockJob,
      })

      const result = await jobService.createJob(createData)

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/jobs',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(createData),
        })
      )
      expect(result.id).toBe('1')
    })
  })

  describe('updateJob', () => {
    it('should update job successfully', async () => {
      const updateData: UpdateJobRequest = {
        title: 'Senior Software Engineer',
      }

      const updatedJob = { ...mockJob, title: 'Senior Software Engineer' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedJob,
      })

      const result = await jobService.updateJob('1', updateData)

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/jobs/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData),
        })
      )
      expect(result.title).toBe('Senior Software Engineer')
    })
  })

  describe('deleteJob', () => {
    it('should delete job successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => undefined,
      })

      await jobService.deleteJob('1')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/jobs/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      )
    })
  })

  describe('analyzeJob', () => {
    it('should analyze job successfully', async () => {
      const mockAnalysis: JobAnalysis = {
        id: '1',
        job_id: '1',
        skills: ['React', 'TypeScript'],
        requirements: ['3+ years experience'],
        responsibilities: ['Develop web apps'],
        summary: 'Senior frontend position',
        raw_response: '{}',
        status: 'completed',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalysis,
      })

      const result = await jobService.analyzeJob('1')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/jobs/1/analyze',
        expect.objectContaining({
          method: 'POST',
        })
      )
      expect(result.skills).toContain('React')
    })
  })

  describe('getJobAnalysis', () => {
    it('should get job analysis successfully', async () => {
      const mockAnalysis: JobAnalysis = {
        id: '1',
        job_id: '1',
        skills: ['React', 'TypeScript'],
        requirements: ['3+ years experience'],
        responsibilities: ['Develop web apps'],
        summary: 'Senior frontend position',
        raw_response: '{}',
        status: 'completed',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalysis,
      })

      const result = await jobService.getJobAnalysis('1')

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/jobs/1/analysis', expect.any(Object))
      expect(result).toEqual(mockAnalysis)
    })

    it('should return null for 404 error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: '404 Not Found' }),
      })

      const result = await jobService.getJobAnalysis('999')
      expect(result).toBeNull()
    })

    it('should throw error for non-404 errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: '500 Server Error' }),
      })

      await expect(jobService.getJobAnalysis('1')).rejects.toThrow()
    })
  })
})
