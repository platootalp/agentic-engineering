import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { useAuth } from './useAuth'
import { useAuthStore } from '@/stores/auth.store'
import { authService } from '@/services/auth.service'
import type { LoginCredentials, RegisterCredentials, User } from '@/types/auth'

// Mock authService
vi.mock('@/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
  },
}))

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
)

describe('useAuth', () => {
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
    // Reset store
    useAuthStore.getState().logout()
  })

  describe('initial state', () => {
    it('should return initial auth state', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.user).toBeNull()
      expect(result.current.token).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('login', () => {
    it('should login successfully', async () => {
      vi.mocked(authService.login).mockResolvedValueOnce({
        user: mockUser,
        tokens: mockTokens,
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'password123',
      }

      await act(async () => {
        await result.current.login(credentials)
      })

      expect(authService.login).toHaveBeenCalledWith(credentials)
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.isLoading).toBe(false)
    })

    it('should handle login error', async () => {
      vi.mocked(authService.login).mockRejectedValueOnce(new Error('Invalid credentials'))

      const { result } = renderHook(() => useAuth(), { wrapper })

      const credentials: LoginCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }

      await expect(result.current.login(credentials)).rejects.toThrow('Invalid credentials')
      expect(result.current.isLoading).toBe(false)
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should set loading during login', async () => {
      vi.mocked(authService.login).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({
          user: mockUser,
          tokens: mockTokens,
        }), 100))
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      act(() => {
        result.current.login({ email: 'test@example.com', password: 'password123' })
      })

      expect(result.current.isLoading).toBe(true)
    })
  })

  describe('register', () => {
    it('should register successfully', async () => {
      vi.mocked(authService.register).mockResolvedValueOnce({
        user: mockUser,
        tokens: mockTokens,
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      const credentials: RegisterCredentials = {
        email: 'newuser@example.com',
        password: 'password123',
        first_name: 'Jane',
        last_name: 'Doe',
      }

      await act(async () => {
        await result.current.register(credentials)
      })

      expect(authService.register).toHaveBeenCalledWith(credentials)
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('should handle registration error', async () => {
      vi.mocked(authService.register).mockRejectedValueOnce(new Error('Email already exists'))

      const { result } = renderHook(() => useAuth(), { wrapper })

      const credentials: RegisterCredentials = {
        email: 'existing@example.com',
        password: 'password123',
        first_name: 'Jane',
        last_name: 'Doe',
      }

      await expect(result.current.register(credentials)).rejects.toThrow('Email already exists')
      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      vi.mocked(authService.login).mockResolvedValueOnce({
        user: mockUser,
        tokens: mockTokens,
      })
      vi.mocked(authService.logout).mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useAuth(), { wrapper })

      // Login first
      await act(async () => {
        await result.current.login({ email: 'test@example.com', password: 'password123' })
      })

      // Then logout
      await act(async () => {
        await result.current.logout()
      })

      expect(authService.logout).toHaveBeenCalled()
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('should handle logout error gracefully', async () => {
      vi.mocked(authService.logout).mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useAuth(), { wrapper })

      // Should not throw
      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('refreshAccessToken', () => {
    it('should refresh token successfully', async () => {
      vi.mocked(authService.refreshToken).mockResolvedValueOnce({
        access_token: 'new-access-token',
      })

      // Set refresh token in store
      useAuthStore.getState().setRefreshToken('refresh-token')

      const { result } = renderHook(() => useAuth(), { wrapper })

      const newToken = await act(async () => {
        return await result.current.refreshAccessToken()
      })

      expect(authService.refreshToken).toHaveBeenCalledWith('refresh-token')
      expect(newToken).toBe('new-access-token')
      expect(useAuthStore.getState().token).toBe('new-access-token')
    })

    it('should return null when no refresh token exists', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      const newToken = await act(async () => {
        return await result.current.refreshAccessToken()
      })

      expect(newToken).toBeNull()
      expect(authService.refreshToken).not.toHaveBeenCalled()
    })

    it('should handle refresh token error', async () => {
      vi.mocked(authService.refreshToken).mockRejectedValueOnce(new Error('Invalid refresh token'))

      useAuthStore.getState().setRefreshToken('invalid-token')
      useAuthStore.getState().login(mockUser, 'old-token', 'invalid-token')

      const { result } = renderHook(() => useAuth(), { wrapper })

      const newToken = await act(async () => {
        return await result.current.refreshAccessToken()
      })

      expect(newToken).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })
})
