import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { authService } from '@/services/auth.service'
import type { LoginCredentials, RegisterCredentials, User } from '@/types/auth'

interface UseAuthReturn {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => Promise<void>
  refreshAccessToken: () => Promise<string | null>
}

export function useAuth(): UseAuthReturn {
  const navigate = useNavigate()
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    login: storeLogin,
    logout: storeLogout,
    setLoading,
  } = useAuthStore()

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<void> => {
      try {
        setLoading(true)
        const response = await authService.login(credentials)
        storeLogin(response.user, response.tokens.access_token, response.tokens.refresh_token)
        navigate('/dashboard')
      } catch (error) {
        console.error('Login failed:', error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [navigate, storeLogin, setLoading]
  )

  const register = useCallback(
    async (credentials: RegisterCredentials): Promise<void> => {
      try {
        setLoading(true)
        const response = await authService.register(credentials)
        storeLogin(response.user, response.tokens.access_token, response.tokens.refresh_token)
        navigate('/dashboard')
      } catch (error) {
        console.error('Registration failed:', error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    [navigate, storeLogin, setLoading]
  )

  const logout = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      storeLogout()
      navigate('/login')
      setLoading(false)
    }
  }, [navigate, storeLogout, setLoading])

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    const refreshToken = useAuthStore.getState().refreshToken
    if (!refreshToken) {
      return null
    }

    try {
      const response = await authService.refreshToken(refreshToken)
      useAuthStore.getState().setToken(response.access_token)
      return response.access_token
    } catch (error) {
      console.error('Token refresh failed:', error)
      storeLogout()
      navigate('/login')
      return null
    }
  }, [navigate, storeLogout])

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshAccessToken,
  }
}

export default useAuth
