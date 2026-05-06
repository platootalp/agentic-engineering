import { successResponse, errorResponse, ResponseMeta } from '../response';

describe('successResponse', () => {
  it('returns success response with data', () => {
    const data = { id: 1, name: 'Test' };
    const result = successResponse(data);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(data);
    expect(result.meta).toBeDefined();
    expect(result.meta?.timestamp).toBeDefined();
  });

  it('returns success response with null data', () => {
    const result = successResponse(null);

    expect(result.success).toBe(true);
    expect(result.data).toBeNull();
    expect(result.meta).toBeDefined();
    expect(result.meta?.timestamp).toBeDefined();
  });

  it('returns success response with array data', () => {
    const data = [1, 2, 3];
    const result = successResponse(data);

    expect(result.success).toBe(true);
    expect(result.data).toEqual([1, 2, 3]);
    expect(result.meta).toBeDefined();
    expect(result.meta?.timestamp).toBeDefined();
  });

  it('returns success response with meta', () => {
    const data = { items: [] };
    const meta = { cached: true, source: 'cache' };
    const result = successResponse(data, meta);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(data);
    expect(result.meta).toBeDefined();
    expect(result.meta?.timestamp).toBeDefined();
    expect(result.meta?.cached).toBe(true);
    expect(result.meta?.source).toBe('cache');
  });
});

describe('errorResponse', () => {
  it('returns error response with code and message', () => {
    const result = errorResponse('NOT_FOUND', 'Resource not found');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error?.code).toBe('NOT_FOUND');
    expect(result.error?.message).toBe('Resource not found');
    expect(result.meta).toBeDefined();
    expect(result.meta?.timestamp).toBeDefined();
  });

  it('returns error response with details', () => {
    const details = { field: 'email', issue: 'invalid format' };
    const result = errorResponse('VALIDATION_ERROR', 'Invalid input', details);

    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('VALIDATION_ERROR');
    expect(result.error?.message).toBe('Invalid input');
    expect(result.error?.details).toEqual(details);
    expect(result.meta).toBeDefined();
    expect(result.meta?.timestamp).toBeDefined();
  });

  it('returns error response without details when not provided', () => {
    const result = errorResponse('UNAUTHORIZED', 'Access denied');

    expect(result.error?.details).toBeUndefined();
    expect(result.meta).toBeDefined();
    expect(result.meta?.timestamp).toBeDefined();
  });
});
