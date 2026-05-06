import apiClient from './api'
import type { LoginCredentials, RegisterCredentials, AuthResponseData, User } from '@/types/auth'

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponseData> {
    const response = await apiClient.post<AuthResponseData>('/auth/login', credentials)
    return response as unknown as AuthResponseData
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponseData> {
    const response = await apiClient.post<AuthResponseData>('/auth/register', credentials)
    return response as unknown as AuthResponseData
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    const response = await apiClient.post<{ access_token: string }>('/auth/refresh', {
      refresh_token: refreshToken,
    })
    return response as unknown as { access_token: string }
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me')
    return response as unknown as User
  }

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email })
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, new_password: newPassword })
  }
}

export const authService = new AuthService()
export default authService
