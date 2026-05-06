export type JobSource = 'manual' | 'linkedin' | 'indeed' | 'boss' | 'lagou' | 'other';
export type JobStatus = 'pending' | 'analyzing' | 'analyzed' | 'error';

export interface Job {
  id: string;
  companyName: string;
  position: string;
  location: string;
  salary: string;
  description: string;
  source: JobSource;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
}

export interface JobAnalysis {
  id: string;
  jobId: string;
  skills: string[];
  requirements: string[];
  responsibilities: string[];
  experienceLevel: string;
  educationRequirement: string;
  analyzedAt: string;
}

export interface JobWithAnalysis extends Job {
  analysis?: JobAnalysis;
}

export interface CreateJobRequest {
  companyName: string;
  position: string;
  location: string;
  salary: string;
  description: string;
  source?: JobSource;
}

export interface UpdateJobRequest {
  companyName?: string;
  position?: string;
  location?: string;
  salary?: string;
  description?: string;
}

export interface JobListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  source?: JobSource;
  status?: JobStatus;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type JobListResponse = PaginatedResponse<Job>;
