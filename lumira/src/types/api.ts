import type { Transaction, PortfolioSummary, AssetAllocation } from './index';

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: ResponseMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
  meta?: ResponseMeta;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface ResponseMeta {
  timestamp: string;
  requestId?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface CreateHoldingRequest {
  fundId: string;
  fundName: string;
  fundType?: string;
  totalShares: number;
  avgCost: number;
  totalCost: number;
  channel?: string;
  group?: string;
  tags?: string[];
}

export interface UpdateHoldingRequest {
  fundName?: string;
  fundType?: string;
  totalShares?: number;
  avgCost?: number;
  totalCost?: number;
  channel?: string;
  group?: string;
  tags?: string[];
}

export interface CreateTransactionRequest {
  holdingId: string;
  fundId: string;
  fundName?: string;
  type: 'BUY' | 'SELL' | 'DIVIDEND';
  date: string;
  shares: number;
  price: number;
  amount: number;
  fee: number;
  notes?: string;
}

export interface UpdateTransactionRequest {
  type?: 'BUY' | 'SELL' | 'DIVIDEND';
  date?: string;
  shares?: number;
  price?: number;
  amount?: number;
  fee?: number;
  notes?: string;
}

export interface TransactionQueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  type?: 'BUY' | 'SELL' | 'DIVIDEND';
  fundId?: string;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
}

export interface PortfolioSummaryResponse extends PortfolioSummary {}

export interface PortfolioAllocationResponse extends AssetAllocation {}

export interface HoldingsRankingResponse {
  fundId: string;
  fundName: string;
  profit: number;
  profitRate: number;
  contribution: number;
  marketValue: number;
  percentage: number;
}
