import type {
  Job,
  JobWithAnalysis,
  JobAnalysis,
  CreateJobRequest,
  UpdateJobRequest,
  JobListParams,
  JobListResponse,
} from '../types/job';

const API_BASE_URL = '/api/v1';

class JobService {
  private async fetchWithError<T>(
    url: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getJobs(params: JobListParams = {}): Promise<JobListResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.source) queryParams.append('source', params.source);
    if (params.status) queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/jobs${queryString ? `?${queryString}` : ''}`;

    return this.fetchWithError<JobListResponse>(url);
  }

  async getJob(id: string): Promise<JobWithAnalysis> {
    return this.fetchWithError<JobWithAnalysis>(`${API_BASE_URL}/jobs/${id}`);
  }

  async createJob(data: CreateJobRequest): Promise<Job> {
    return this.fetchWithError<Job>(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateJob(id: string, data: UpdateJobRequest): Promise<Job> {
    return this.fetchWithError<Job>(`${API_BASE_URL}/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteJob(id: string): Promise<void> {
    await this.fetchWithError<void>(`${API_BASE_URL}/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  async analyzeJob(id: string): Promise<JobAnalysis> {
    return this.fetchWithError<JobAnalysis>(`${API_BASE_URL}/jobs/${id}/analyze`, {
      method: 'POST',
    });
  }

  async getJobAnalysis(id: string): Promise<JobAnalysis | null> {
    try {
      return await this.fetchWithError<JobAnalysis>(`${API_BASE_URL}/jobs/${id}/analysis`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }
}

export const jobService = new JobService();
