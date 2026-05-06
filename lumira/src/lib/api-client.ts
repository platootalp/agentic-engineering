import type { AuthTokens } from '@/types/api';
import { setCookie, deleteCookie, AUTH_COOKIES } from './cookies';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000;
const REFRESH_CHECK_INTERVAL = 60 * 1000;

export class ApiError extends Error {
  constructor(message: string, public status: number, public code: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiresAt: number | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;
  private pendingRequests: Array<(token: string | null) => void> = [];
  private refreshCheckTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadTokens();
      this.startRefreshCheck();
    }
  }

  private startRefreshCheck(): void {
    if (this.refreshCheckTimer) clearInterval(this.refreshCheckTimer);
    this.refreshCheckTimer = setInterval(() => this.checkAndRefreshToken(), REFRESH_CHECK_INTERVAL);
  }

  private stopRefreshCheck(): void {
    if (this.refreshCheckTimer) {
      clearInterval(this.refreshCheckTimer);
      this.refreshCheckTimer = null;
    }
  }

  private async checkAndRefreshToken(): Promise<void> {
    if (!this.accessToken || !this.refreshToken || !this.tokenExpiresAt) return;
    const timeUntilExpiry = this.tokenExpiresAt - Date.now();
    if (timeUntilExpiry < TOKEN_REFRESH_THRESHOLD && timeUntilExpiry > 0) {
      try { 
        await this.refreshAccessToken(); 
      } catch (e) { 
        // Ignore - will retry on next check or 401
      }
    }
  }

  setTokens(tokens: AuthTokens): void {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.tokenExpiresAt = Date.now() + (tokens.expiresIn || 15 * 60) * 1000;
    this.saveTokensToStorage(tokens);
  }

  loadTokens(): boolean {
    const tokens = this.loadTokensFromStorage();
    if (tokens) {
      this.accessToken = tokens.accessToken;
      this.refreshToken = tokens.refreshToken;
      return true;
    }
    return false;
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiresAt = null;
    this.removeTokensFromStorage();
    this.stopRefreshCheck();
  }

  getAccessToken(): string | null { 
    return this.accessToken; 
  }
  
  getRefreshToken(): string | null { 
    return this.refreshToken; 
  }
  
  isAuthenticated(): boolean { 
    return this.accessToken !== null; 
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }
    if (!this.refreshToken) {
      return null;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const newToken = await this.refreshPromise;
      this.pendingRequests.forEach(resolve => resolve(newToken));
      this.pendingRequests.forEach(resolve => resolve(newToken));
      this.pendingRequests = [];
      return newToken;
    } catch (error) {
      this.pendingRequests.forEach(resolve => resolve(null));
      this.pendingRequests = [];
      throw error;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      
      const data = await response.json();
      if (!data.success || !data.data) {
        throw new Error('Invalid refresh response');
      }

      const { tokens } = data.data;
      this.setTokens(tokens);
      return tokens.accessToken;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      let response = await fetch(url, config);

      if (response.status === 401 && this.refreshToken) {
        try {
          const newToken = await this.refreshAccessToken();
          if (newToken) {
            headers['Authorization'] = `Bearer ${newToken}`;
            response = await fetch(url, { ...config, headers });
          }
        } catch (refreshError) {
        }
      }

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: { message: response.statusText, code: 'UNKNOWN_ERROR' } };
        }
        throw new ApiError(
          errorData.error?.message || `HTTP ${response.status}`,
          response.status,
          errorData.error?.code || 'UNKNOWN_ERROR'
        );
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return response.json() as Promise<T>;
      }

      const text = await response.text();
      try {
        return JSON.parse(text) as T;
      } catch {
        return text as unknown as T;
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error',
        0,
        'NETWORK_ERROR'
      );
    }
  }

  async get<T>(
    endpoint: string,
    params?: Record<string, string | number | undefined>
  ): Promise<T> {
    let url = endpoint;
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        url = `${endpoint}?${queryString}`;
      }
    }
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  private saveTokensToStorage(tokens: AuthTokens): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      setCookie(AUTH_COOKIES.ACCESS_TOKEN, tokens.accessToken, { 
        maxAge: 15 * 60,
        sameSite: 'lax' 
      });
      setCookie(AUTH_COOKIES.REFRESH_TOKEN, tokens.refreshToken, { 
        maxAge: 7 * 24 * 60 * 60,
        sameSite: 'lax' 
      });
    }
  }

  private loadTokensFromStorage(): AuthTokens | null {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      if (accessToken && refreshToken) {
        return { accessToken, refreshToken };
      }
    }
    return null;
  }

  private removeTokensFromStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      deleteCookie(AUTH_COOKIES.ACCESS_TOKEN);
      deleteCookie(AUTH_COOKIES.REFRESH_TOKEN);
    }
  }
}

export const apiClient = new ApiClient();
