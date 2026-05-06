/**
 * API客户端
 * 负责与后端API通信
 */

import type { JobData, ApiResponse, ExtractorConfig } from '@/types/jd';
import { storage } from '@/utils/storage';

/**
 * API客户端类
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  /**
   * 设置API基础URL
   */
  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  /**
   * 获取当前配置
   */
  private async getConfig(): Promise<ExtractorConfig> {
    return await storage.getConfig();
  }

  /**
   * 发送请求
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const config = await this.getConfig();
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    // 添加认证Token
    if (config.userToken) {
      headers['Authorization'] = `Bearer ${config.userToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '网络请求失败',
      };
    }
  }

  /**
   * 同步单个职位到后端
   */
  async syncJob(job: JobData): Promise<ApiResponse<{ id: string }>> {
    return this.request('/api/v1/extension/jobs', {
      method: 'POST',
      body: JSON.stringify({ job }),
    });
  }

  /**
   * 批量同步职位到后端
   */
  async syncJobs(jobs: JobData[]): Promise<ApiResponse<{ count: number }>> {
    return this.request('/api/v1/extension/jobs/batch', {
      method: 'POST',
      body: JSON.stringify({ jobs }),
    });
  }

  /**
   * 验证Token是否有效
   */
  async verifyToken(token: string): Promise<ApiResponse<{ valid: boolean; user?: { id: string; name: string } }>> {
    return this.request('/api/v1/extension/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  /**
   * 获取用户统计信息
   */
  async getUserStats(): Promise<ApiResponse<{ totalJobs: number; todayJobs: number }>> {
    return this.request('/api/v1/extension/stats');
  }
}

// 导出单例
export const apiClient = new ApiClient();
