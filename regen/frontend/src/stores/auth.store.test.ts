import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'
import type { User } from '@/types/auth'

describe('useAuthStore', () => {
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    // Reset store to initial state
    const store = useAuthStore.getState()
    store.logout()
  })

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.refreshToken).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
    })
  })

  describe('setUser', () => {
    it('should set user correctly', () => {
      const store = useAuthStore.getState()
      store.setUser(mockUser)
      expect(useAuthStore.getState().user).toEqual(mockUser)
    })

    it('should allow setting user to null', () => {
      const store = useAuthStore.getState()
      store.setUser(mockUser)
      store.setUser(null)
      expect(useAuthStore.getState().user).toBeNull()
    })
  })

  describe('setToken', () => {
    it('should set token correctly', () => {
      const store = useAuthStore.getState()
      store.setToken('test-token')
      expect(useAuthStore.getState().token).toBe('test-token')
    })

    it('should allow setting token to null', () => {
      const store = useAuthStore.getState()
      store.setToken('test-token')
      store.setToken(null)
      expect(useAuthStore.getState().token).toBeNull()
    })
  })

  describe('setRefreshToken', () => {
    it('should set refresh token correctly', () => {
      const store = useAuthStore.getState()
      store.setRefreshToken('refresh-token')
      expect(useAuthStore.getState().refreshToken).toBe('refresh-token')
    })
  })

  describe('storeLogin', () => {
    it('should set all auth data correctly', () => {
      const store = useAuthStore.getState()
      store.storeLogin(mockUser, 'access-token', 'refresh-token')

      const state = useAuthStore.getState()
      expect(state.user).toEqual(mockUser)
      expect(state.token).toBe('access-token')
      expect(state.refreshToken).toBe('refresh-token')
      expect(state.isAuthenticated).toBe(true)
      expect(state.isLoading).toBe(false)
    })
  })

  describe('logout', () => {
    it('should reset all auth data to initial state', () => {
      const store = useAuthStore.getState()
      store.storeLogin(mockUser, 'access-token', 'refresh-token')
      store.logout()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.token).toBeNull()
      expect(state.refreshToken).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isLoading).toBe(false)
    })
  })

  describe('updateUser', () => {
    it('should update user data partially', () => {
      const store = useAuthStore.getState()
      store.setUser(mockUser)
      store.updateUser({ first_name: 'Jane' })

      const state = useAuthStore.getState()
      expect(state.user?.first_name).toBe('Jane')
      expect(state.user?.last_name).toBe('Doe')
      expect(state.user?.email).toBe('test@example.com')
    })

    it('should not throw when updating null user', () => {
      const store = useAuthStore.getState()
      expect(() => store.updateUser({ first_name: 'Jane' })).not.toThrow()
      expect(useAuthStore.getState().user).toBeNull()
    })

    it('should update multiple fields at once', () => {
      const store = useAuthStore.getState()
      store.setUser(mockUser)
      store.updateUser({ first_name: 'Jane', last_name: 'Smith' })

      const state = useAuthStore.getState()
      expect(state.user?.first_name).toBe('Jane')
      expect(state.user?.last_name).toBe('Smith')
    })
  })
})
