import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, LoginCredentials, RegisterCredentials } from '@/types/auth'
import { api } from '@/api/client'

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  // Internal setters (for useAuth hook and refresh logic)
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setRefreshToken: (refreshToken: string | null) => void
  setLoading: (isLoading: boolean) => void
  storeLogin: (user: User, token: string, refreshToken: string) => void
  // Template-aligned async actions
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const initialState = {
  user: null as User | null,
  token: null as string | null,
  refreshToken: null as string | null,
  isAuthenticated: false,
  isLoading: false,
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,

      // Internal setters
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      setLoading: (isLoading) => set({ isLoading }),
      storeLogin: (user, token, refreshToken) =>
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        }),

      // Template-aligned async actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true })
        try {
          const data = await api.post<{
            user: User
            tokens: { access_token: string; refresh_token: string; token_type: string }
          }>('/users/login', credentials)
          set({
            user: data.user,
            token: data.tokens.access_token,
            refreshToken: data.tokens.refresh_token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (credentials: RegisterCredentials) => {
        set({ isLoading: true })
        try {
          const data = await api.post<{
            user: User
            tokens: { access_token: string; refresh_token: string; token_type: string }
          }>('/users/register', credentials)
          set({
            user: data.user,
            token: data.tokens.access_token,
            refreshToken: data.tokens.refresh_token,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({ ...initialState })
      },

      updateUser: (userData: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
