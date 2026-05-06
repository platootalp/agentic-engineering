import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService } from './auth.service'
import apiClient from '@/api/client'
import type { LoginCredentials, RegisterCredentials, User } from '@/types/auth'

// Mock the apiClient
vi.mock('@/api/client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

describe('authService', () => {
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  const mockTokens = {
    access_token: 'access-token',
    refresh_token: 'refresh-token',
    token_type: 'bearer',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      }

      const mockResponse = {
        data: {
          user: mockUser,
          tokens: mockTokens,
        },
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await authService.login(credentials)

      expect(apiClient.post).toHaveBeenCalledWith('/users/login', credentials)
      expect(result.user).toEqual(mockUser)
      expect(result.tokens).toEqual(mockTokens)
    })

    it('should throw error on failed login', async () => {
      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }

      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Invalid credentials'))

      await expect(authService.login(credentials)).rejects.toThrow('Invalid credentials')
    })
  })

  describe('register', () => {
    it('should register with valid credentials', async () => {
      const credentials: RegisterCredentials = {
        email: 'newuser@example.com',
        password: 'password123',
        first_name: 'Jane',
        last_name: 'Doe',
      }

      const mockResponse = {
        data: {
          user: { ...mockUser, email: 'newuser@example.com' },
          tokens: mockTokens,
        },
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await authService.register(credentials)

      expect(apiClient.post).toHaveBeenCalledWith('/users/register', credentials)
      expect(result.user.email).toBe('newuser@example.com')
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: undefined })

      await authService.logout()

      expect(apiClient.post).toHaveBeenCalledWith('/users/logout')
    })
  })

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const refreshToken = 'old-refresh-token'
      const mockResponse = {
        data: { access_token: 'new-access-token' },
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)

      const result = await authService.refreshToken(refreshToken)

      expect(apiClient.post).toHaveBeenCalledWith('/users/refresh', {
        refresh_token: refreshToken,
      })
      expect(result.access_token).toBe('new-access-token')
    })
  })

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      const mockResponse = { data: mockUser }
      vi.mocked(apiClient.get).mockResolvedValueOnce(mockResponse)

      const result = await authService.getCurrentUser()

      expect(apiClient.get).toHaveBeenCalledWith('/users/me')
      expect(result).toEqual(mockUser)
    })
  })

  describe('forgotPassword', () => {
    it('should request password reset successfully', async () => {
      const email = 'test@example.com'
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: undefined })

      await authService.forgotPassword(email)

      expect(apiClient.post).toHaveBeenCalledWith('/users/forgot-password', { email })
    })
  })

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const token = 'reset-token'
      const newPassword = 'newpassword123'
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: undefined })

      await authService.resetPassword(token, newPassword)

      expect(apiClient.post).toHaveBeenCalledWith('/users/reset-password', {
        token,
        new_password: newPassword,
      })
    })
  })
})
