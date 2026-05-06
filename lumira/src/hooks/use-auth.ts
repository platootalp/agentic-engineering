'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { apiClient } from '@/lib/api-client';
import type { LoginCredentials, RegisterData } from '@/types/api';

const AUTH_QUERY_KEY = ['auth', 'user'];

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('accessToken');

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: authApi.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
    enabled: hasToken,
  });

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (data) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, data.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      queryClient.clear();
    },
  });

  useEffect(() => {
    const accessToken = apiClient.getAccessToken();
    if (accessToken && !user && !isLoading) {
      queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    }
  }, [queryClient, user, isLoading]);

  const requireAuth = useCallback((redirectPath?: string): boolean => {
    if (!apiClient.isAuthenticated()) {
      const targetPath = redirectPath || window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(targetPath)}`);
      return false;
    }
    return true;
  }, [router]);

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    error,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoginPending: loginMutation.isPending,
    isRegisterPending: registerMutation.isPending,
    isLogoutPending: logoutMutation.isPending,
    requireAuth,
  };
    }
