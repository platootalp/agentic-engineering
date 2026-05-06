/**
 * @fileoverview API Client Tests
 * 
 * Tests for ApiClient class
 * Coverage target: 90%+
 */

import { ApiClient, ApiError } from '@/lib/api-client';
import { server } from '@/test/server';
import { rest } from 'msw';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

describe('ApiClient', () => {
  let client: ApiClient;

  beforeEach(() => {
    client = new ApiClient();
    // Clear localStorage before each test
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  describe('Token Management', () => {
    it('should set tokens and save to storage', () => {
      const tokens = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      };

      client.setTokens(tokens);

      expect(client.getAccessToken()).toBe('test-access-token');
      expect(client.getRefreshToken()).toBe('test-refresh-token');
      expect(client.isAuthenticated()).toBe(true);
    });

    it('should load tokens from storage', () => {
      const tokens = {
        accessToken: 'loaded-access-token',
        refreshToken: 'loaded-refresh-token',
      };

      client.setTokens(tokens);
      
      // Create new client instance to test loading
      const newClient = new ApiClient();
      const loaded = newClient.loadTokens();

      expect(loaded).toBe(true);
      expect(newClient.getAccessToken()).toBe('loaded-access-token');
      expect(newClient.getRefreshToken()).toBe('loaded-refresh-token');
    });

    it('should return false when no tokens in storage', () => {
      const loaded = client.loadTokens();
      expect(loaded).toBe(false);
    });

    it('should clear tokens', () => {
      client.setTokens({
        accessToken: 'test-token',
        refreshToken: 'test-refresh',
      });

      client.clearTokens();

      expect(client.getAccessToken()).toBeNull();
      expect(client.getRefreshToken()).toBeNull();
      expect(client.isAuthenticated()).toBe(false);
    });
  });

  describe('HTTP Methods', () => {
    beforeEach(() => {
      server.use(
        rest.get(`${API_BASE_URL}/test`, (req, res, ctx) => {
          return res(ctx.json({ data: 'GET success' }));
        }),
        rest.post(`${API_BASE_URL}/test`, async (req, res, ctx) => {
          const body = await req.json();
          return res(ctx.json({ data: 'POST success', received: body }));
        }),
        rest.put(`${API_BASE_URL}/test`, async (req, res, ctx) => {
          const body = await req.json();
          return res(ctx.json({ data: 'PUT success', received: body }));
        }),
        rest.delete(`${API_BASE_URL}/test`, (req, res, ctx) => {
          return res(ctx.json({ data: 'DELETE success' }));
        })
      );
    });

    it('should make GET request', async () => {
      const result = await client.get('/test');
      expect(result).toEqual({ data: 'GET success' });
    });

    it('should make GET request with query params', async () => {
      server.use(
        rest.get(`${API_BASE_URL}/test`, (req, res, ctx) => {
          const page = req.url.searchParams.get('page');
          const limit = req.url.searchParams.get('limit');
          expect(page).toBe('1');
          expect(limit).toBe('10');
          return res(ctx.json({ data: 'GET with params' }));
        })
      );

      const result = await client.get('/test', { page: 1, limit: 10 });
      expect(result).toEqual({ data: 'GET with params' });
    });

    it('should make POST request', async () => {
      const body = { name: 'test', value: 123 };
      const result = await client.post('/test', body);
      
      expect(result.data).toBe('POST success');
      expect(result.received).toEqual(body);
    });

    it('should make PUT request', async () => {
      const body = { name: 'updated' };
      const result = await client.put('/test', body);
      
      expect(result.data).toBe('PUT success');
      expect(result.received).toEqual(body);
    });

    it('should make DELETE request', async () => {
      const result = await client.delete('/test');
      expect(result).toEqual({ data: 'DELETE success' });
    });
  });

  describe('Authentication', () => {
    it('should include Authorization header when authenticated', async () => {
      client.setTokens({
        accessToken: 'Bearer test-token',
        refreshToken: 'test-refresh',
      });

      server.use(
        rest.get(`${API_BASE_URL}/protected`, (req, res, ctx) => {
          const authHeader = req.headers.get('Authorization');
          expect(authHeader).toBe('Bearer Bearer test-token');
          return res(ctx.json({ data: 'authenticated' }));
        })
      );

      await client.get('/protected');
    });

    it('should not include Authorization header when not authenticated', async () => {
      server.use(
        rest.get(`${API_BASE_URL}/public`, (req, res, ctx) => {
          const authHeader = req.headers.get('Authorization');
          expect(authHeader).toBeNull();
          return res(ctx.json({ data: 'public' }));
        })
      );

      await client.get('/public');
    });
  });

  describe('Error Handling', () => {
    it('should throw ApiError for 401 Unauthorized', async () => {
      server.use(
        rest.get(`${API_BASE_URL}/unauthorized`, (req, res, ctx) => {
          return res(
            ctx.status(401),
            ctx.json({ error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
          );
        })
      );

      await expect(client.get('/unauthorized')).rejects.toThrow(ApiError);
    });

    it('should throw ApiError for 404 Not Found', async () => {
      server.use(
        rest.get(`${API_BASE_URL}/not-found`, (req, res, ctx) => {
          return res(
            ctx.status(404),
            ctx.json({ error: { message: 'Not Found', code: 'NOT_FOUND' } })
          );
        })
      );

      await expect(client.get('/not-found')).rejects.toThrow(ApiError);
    });

    it('should throw ApiError for 500 Server Error', async () => {
      server.use(
        rest.get(`${API_BASE_URL}/error`, (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ error: { message: 'Server Error', code: 'SERVER_ERROR' } })
          );
        })
      );

      await expect(client.get('/error')).rejects.toThrow(ApiError);
    });

    it('should call unauthorized handler on 401', async () => {
      const unauthorizedHandler = jest.fn();
      client.setUnauthorizedHandler(unauthorizedHandler);

      server.use(
        rest.get(`${API_BASE_URL}/unauthorized`, (req, res, ctx) => {
          return res(
            ctx.status(401),
            ctx.json({ error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } })
          );
        })
      );

      try {
        await client.get('/unauthorized');
      } catch {
        // Expected to throw
      }

      expect(unauthorizedHandler).toHaveBeenCalled();
    });

    it('should handle error with no response body', async () => {
      server.use(
        rest.get(`${API_BASE_URL}/no-body`, (req, res, ctx) => {
          return res(ctx.status(500));
        })
      );

      await expect(client.get('/no-body')).rejects.toThrow('Internal Server Error');
    });
  });

  describe('Query Parameters', () => {
    it('should handle undefined params', async () => {
      server.use(
        rest.get(`${API_BASE_URL}/filter`, (req, res, ctx) => {
          expect(req.url.searchParams.has('undefined')).toBe(false);
          expect(req.url.searchParams.get('defined')).toBe('value');
          return res(ctx.json({ success: true }));
        })
      );

      await client.get('/filter', { defined: 'value', undefined: undefined });
    });

    it('should handle empty params object', async () => {
      server.use(
        rest.get(`${API_BASE_URL}/no-params`, (req, res, ctx) => {
          expect(req.url.search).toBe('');
          return res(ctx.json({ success: true }));
        })
      );

      await client.get('/no-params', {});
    });

    it('should handle numeric params', async () => {
      server.use(
        rest.get(`${API_BASE_URL}/numbers`, (req, res, ctx) => {
          expect(req.url.searchParams.get('int')).toBe('42');
          expect(req.url.searchParams.get('float')).toBe('3.14');
          return res(ctx.json({ success: true }));
        })
      );

      await client.get('/numbers', { int: 42, float: 3.14 });
    });
  });

  describe('ApiError', () => {
    it('should create ApiError with correct properties', () => {
      const error = new ApiError('Test error', 400, 'TEST_ERROR');
      
      expect(error.message).toBe('Test error');
      expect(error.status).toBe(400);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.name).toBe('ApiError');
    });

    it('should be instanceof Error', () => {
      const error = new ApiError('Test', 500, 'ERROR');
      expect(error).toBeInstanceOf(Error);
    });

    it('should be instanceof ApiError', () => {
      const error = new ApiError('Test', 500, 'ERROR');
      expect(error).toBeInstanceOf(ApiError);
    });
  });

  describe('Singleton Export', () => {
    it('should export apiClient singleton', async () => {
      const { apiClient: singletonClient } = await import('@/lib/api-client');
      expect(singletonClient).toBeDefined();
      expect(singletonClient).toBeInstanceOf(ApiClient);
    });
  });
});
