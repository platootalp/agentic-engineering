/**
 * @fileoverview useAuth Hook Tests
 */

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { authApi } from '@/lib/api';
import { apiClient } from '@/lib/api-client';

// Mocks
jest.mock('@/lib/api');
jest.mock('@/lib/api-client');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
};

describe('useAuth', () => {
  const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
  const mockTokens = {
    accessToken: 'test-access',
    refreshToken: 'test-refresh',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (apiClient.getAccessToken as jest.Mock).mockReturnValue(null);
  });

  it('should not fetch user when no token exists', () => {
    (authApi.getCurrentUser as jest.Mock).mockRejectedValue(new Error('Should not be called'));
    
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('should fetch user when token exists', async () => {
    localStorage.setItem('accessToken', 'test-token');
    (authApi.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(authApi.getCurrentUser).toHaveBeenCalled();
  });

  it('should login successfully', async () => {
    const loginResponse = { user: mockUser, tokens: mockTokens };
    (authApi.login as jest.Mock).mockResolvedValue(loginResponse);
    (authApi.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await result.current.login({ email: 'test@test.com', password: 'password' });

    expect(authApi.login).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password' });
    expect(result.current.isLoginPending).toBe(false);
  });

  it('should register successfully', async () => {
    const registerResponse = { user: mockUser, tokens: mockTokens };
    (authApi.register as jest.Mock).mockResolvedValue(registerResponse);
    (authApi.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await result.current.register({
      email: 'new@test.com',
      password: 'password',
      name: 'New User',
    });

    expect(authApi.register).toHaveBeenCalled();
  });

  it('should logout successfully', async () => {
    (authApi.logout as jest.Mock).mockResolvedValue(undefined);
    (authApi.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
    localStorage.setItem('accessToken', 'test-token');
    
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    
    await result.current.logout();

    expect(authApi.logout).toHaveBeenCalled();
  });

  it('should handle login error', async () => {
    (authApi.login as jest.Mock).mockRejectedValue(new Error('Invalid credentials'));
    
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    await expect(result.current.login({ email: 'test@test.com', password: 'wrong' }))
      .rejects.toThrow('Invalid credentials');
  });

  it('should track pending states', async () => {
    let resolveLogin: (value: any) => void;
    const loginPromise = new Promise((resolve) => { resolveLogin = resolve; });
    (authApi.login as jest.Mock).mockReturnValue(loginPromise);
    
    const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

    // Start login but don't await
    result.current.login({ email: 'test@test.com', password: 'password' });

    await waitFor(() => {
      expect(result.current.isLoginPending).toBe(true);
    });

    resolveLogin!({ user: mockUser, tokens: mockTokens });
  });
});
