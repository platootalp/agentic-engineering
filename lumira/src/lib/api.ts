import { apiClient, ApiError } from './api-client';
import type { Holding, Transaction, PortfolioSummary, AssetAllocation, TopHolding } from '@/types';
import type {
  ApiResponse,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  CreateHoldingRequest,
  UpdateHoldingRequest,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  TransactionQueryParams,
  TransactionsResponse,
} from '@/types/api';

async function handleResponse<T>(response: ApiResponse<T>): Promise<T> {
  if (!response.success) {
    throw new ApiError(
      response.error.message,
      400,
      response.error.code || 'API_ERROR'
    );
  }
  return response.data;
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    const data = await handleResponse(response);
    apiClient.setTokens(data.tokens);
    return data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    const result = await handleResponse(response);
    apiClient.setTokens(result.tokens);
    return result;
  },

  async logout(): Promise<void> {
    const refreshToken = apiClient.getRefreshToken();
    if (refreshToken) {
      try {
        await apiClient.post<ApiResponse<void>>('/auth/logout', { refreshToken });
      } catch (error) {
        console.warn('Logout API call failed:', error);
      }
    }
    apiClient.clearTokens();
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return handleResponse(response);
  },
};

export const holdingsApi = {
  async getHoldings(): Promise<Holding[]> {
    const response = await apiClient.get<ApiResponse<Holding[]>>('/holdings');
    return handleResponse(response);
  },

  async getHolding(id: string): Promise<Holding> {
    const response = await apiClient.get<ApiResponse<Holding>>(`/holdings/${id}`);
    return handleResponse(response);
  },

  async createHolding(holding: CreateHoldingRequest): Promise<Holding> {
    const response = await apiClient.post<ApiResponse<Holding>>('/holdings', holding);
    return handleResponse(response);
  },

  async updateHolding(id: string, changes: UpdateHoldingRequest): Promise<Holding> {
    const response = await apiClient.put<ApiResponse<Holding>>(`/holdings/${id}`, changes);
    return handleResponse(response);
  },

  async deleteHolding(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/holdings/${id}`);
    await handleResponse(response);
  },
};

export const transactionsApi = {
  async getTransactions(params?: TransactionQueryParams): Promise<TransactionsResponse> {
    const queryParams: Record<string, string | number | undefined> = {};
    if (params) {
      if (params.page !== undefined) queryParams.page = params.page;
      if (params.limit !== undefined) queryParams.limit = params.limit;
      if (params.startDate) queryParams.startDate = params.startDate;
      if (params.endDate) queryParams.endDate = params.endDate;
      if (params.type) queryParams.type = params.type;
      if (params.fundId) queryParams.fundId = params.fundId;
    }
    const response = await apiClient.get<ApiResponse<TransactionsResponse>>('/transactions', queryParams);
    return handleResponse(response);
  },

  async getTransactionsByHolding(holdingId: string): Promise<Transaction[]> {
    const response = await apiClient.get<ApiResponse<Transaction[]>>(`/transactions/holding/${holdingId}`);
    return handleResponse(response);
  },

  async createTransaction(transaction: CreateTransactionRequest): Promise<Transaction> {
    const response = await apiClient.post<ApiResponse<Transaction>>('/transactions', transaction);
    return handleResponse(response);
  },

  async updateTransaction(id: string, changes: UpdateTransactionRequest): Promise<Transaction> {
    const response = await apiClient.put<ApiResponse<Transaction>>(`/transactions/${id}`, changes);
    return handleResponse(response);
  },

  async deleteTransaction(id: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/transactions/${id}`);
    await handleResponse(response);
  },
};

export const portfolioApi = {
  async getPortfolioSummary(): Promise<PortfolioSummary> {
    const response = await apiClient.get<ApiResponse<PortfolioSummary>>('/portfolio/summary');
    return handleResponse(response);
  },

  async getPortfolioAllocation(): Promise<AssetAllocation> {
    const response = await apiClient.get<ApiResponse<AssetAllocation>>('/portfolio/allocation');
    return handleResponse(response);
  },

  async getTopHoldings(limit?: number): Promise<TopHolding[]> {
    const params: Record<string, string | number | undefined> = {};
    if (limit !== undefined) {
      params.limit = limit;
    }
    const response = await apiClient.get<ApiResponse<TopHolding[]>>('/portfolio/top-holdings', params);
    return handleResponse(response);
  },

  async getBottomHoldings(limit?: number): Promise<TopHolding[]> {
    const params: Record<string, string | number | undefined> = {};
    if (limit !== undefined) {
      params.limit = limit;
    }
    const response = await apiClient.get<ApiResponse<TopHolding[]>>('/portfolio/bottom-holdings', params);
    return handleResponse(response);
  },
};
