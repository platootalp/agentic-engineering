import apiClient from '@/api/client'
import type { LoginCredentials, RegisterCredentials, AuthResponseData, User } from '@/types/auth'

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponseData> {
    const response = await apiClient.post<AuthResponseData>('/users/login', credentials)
    return response as unknown as AuthResponseData
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponseData> {
    const response = await apiClient.post<AuthResponseData>('/users/register', credentials)
    return response as unknown as AuthResponseData
  }

  async logout(): Promise<void> {
    await apiClient.post('/users/logout')
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    const response = await apiClient.post<{ access_token: string }>('/users/refresh', {
      refresh_token: refreshToken,
    })
    return response as unknown as { access_token: string }
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/users/me')
    return response as unknown as User
  }

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/users/forgot-password', { email })
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/users/reset-password', { token, new_password: newPassword })
  }
}

export const authService = new AuthService()
export default authService
