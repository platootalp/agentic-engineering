export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  first_name: string
  last_name: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
  error: null | string
}

export interface AuthResponseData {
  user: User
  tokens: AuthTokens
}

export type AuthResponse = ApiResponse<AuthResponseData>

export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface AuthError {
  message: string
  code?: string
  field?: string
}
