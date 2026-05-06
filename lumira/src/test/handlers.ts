import { rest } from 'msw';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Mock data
const mockHoldings = [
  {
    id: 'holding-001',
    fundId: '000001',
    shares: 1000,
    avgCost: 1.5,
    fund: {
      id: '000001',
      name: 'Test Fund A',
      type: 'STOCK',
      nav: 1.6,
    },
  },
  {
    id: 'holding-002',
    fundId: '000002',
    shares: 500,
    avgCost: 2.0,
    fund: {
      id: '000002',
      name: 'Test Fund B',
      type: 'BOND',
      nav: 2.1,
    },
  },
];

const mockTransactions = [
  {
    id: 'tx-001',
    holdingId: 'holding-001',
    fundId: '000001',
    type: 'BUY',
    shares: 1000,
    price: 1.5,
    amount: 1500,
    date: '2024-01-15',
  },
  {
    id: 'tx-002',
    holdingId: 'holding-001',
    fundId: '000001',
    type: 'BUY',
    shares: 500,
    price: 1.55,
    amount: 775,
    date: '2024-02-15',
  },
];

const mockUser = {
  id: 'user-001',
  email: 'test@example.com',
  name: 'Test User',
};

const mockTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};

export const handlers = [
  // Auth endpoints
  rest.post(`${API_BASE_URL}/auth/login`, async (req, res, ctx) => {
    const body = await req.json();
    
    if (body.email === 'test@example.com' && body.password === 'password') {
      return res(
        ctx.json({
          data: {
            user: mockUser,
            ...mockTokens,
          },
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({ error: 'Invalid credentials', message: 'Email or password is incorrect' })
    );
  }),

  rest.post(`${API_BASE_URL}/auth/register`, async (req, res, ctx) => {
    const body = await req.json();
    
    return res(
      ctx.status(201),
      ctx.json({
        data: {
          user: {
            id: 'new-user-001',
            email: body.email,
            name: body.name,
          },
          ...mockTokens,
        },
      })
    );
  }),

  rest.post(`${API_BASE_URL}/auth/refresh`, async (req, res, ctx) => {
    const body = await req.json();
    
    if (body.refreshToken === mockTokens.refreshToken) {
      return res(
        ctx.json({
          data: {
            accessToken: 'new-mock-access-token',
            refreshToken: 'new-mock-refresh-token',
          },
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({ error: 'Invalid refresh token', message: 'Refresh token is invalid or expired' })
    );
  }),

  rest.post(`${API_BASE_URL}/auth/logout`, (req, res, ctx) => {
    return res(ctx.json({ data: { success: true } }));
  }),

  rest.get(`${API_BASE_URL}/auth/me`, (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (authHeader === `Bearer ${mockTokens.accessToken}`) {
      return res(ctx.json({ data: mockUser }));
    }
    
    return res(
      ctx.status(401),
      ctx.json({ error: 'Unauthorized', message: 'Access token is invalid or expired' })
    );
  }),

  // Holdings endpoints
  rest.get(`${API_BASE_URL}/holdings`, (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return res(
        ctx.status(401),
        ctx.json({ error: 'Unauthorized', message: 'Access token is required' })
      );
    }
    
    return res(ctx.json({ data: mockHoldings }));
  }),

  rest.get(`${API_BASE_URL}/holdings/:id`, (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return res(
        ctx.status(401),
        ctx.json({ error: 'Unauthorized', message: 'Access token is required' })
      );
    }
    
    const { id } = req.params;
    const holding = mockHoldings.find(h => h.id === id);
    
    if (!holding) {
      return res(
        ctx.status(404),
        ctx.json({ error: 'Not found', message: 'Holding not found' })
      );
    }
    
    return res(ctx.json({ data: holding }));
  }),

  rest.post(`${API_BASE_URL}/holdings`, async (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return res(
        ctx.status(401),
        ctx.json({ error: 'Unauthorized', message: 'Access token is required' })
      );
    }
    
    const body = await req.json();
    
    return res(
      ctx.status(201),
      ctx.json({
        data: {
          id: 'new-holding-001',
          ...body,
          createdAt: new Date().toISOString(),
        },
      })
    );
  }),

  rest.put(`${API_BASE_URL}/holdings/:id`, async (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return res(
        ctx.status(401),
        ctx.json({ error: 'Unauthorized', message: 'Access token is required' })
      );
    }
    
    const { id } = req.params;
    const body = await req.json();
    const holding = mockHoldings.find(h => h.id === id);
    
    if (!holding) {
      return res(
        ctx.status(404),
        ctx.json({ error: 'Not found', message: 'Holding not found' })
      );
    }
    
    return res(ctx.json({ data: { ...holding, ...body } }));
  }),

  rest.delete(`${API_BASE_URL}/holdings/:id`, (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return res(
        ctx.status(401),
        ctx.json({ error: 'Unauthorized', message: 'Access token is required' })
      );
    }
    
    const { id } = req.params;
    const holding = mockHoldings.find(h => h.id === id);
    
    if (!holding) {
      return res(
        ctx.status(404),
        ctx.json({ error: 'Not found', message: 'Holding not found' })
      );
    }
    
    return res(ctx.json({ data: { success: true } }));
  }),

  // Transactions endpoints
  rest.get(`${API_BASE_URL}/transactions`, (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return res(
        ctx.status(401),
        ctx.json({ error: 'Unauthorized', message: 'Access token is required' })
      );
    }
    
    const holdingId = req.url.searchParams.get('holdingId');
    
    if (holdingId) {
      const filtered = mockTransactions.filter(t => t.holdingId === holdingId);
      return res(ctx.json({ data: filtered }));
    }
    
    return res(ctx.json({ data: mockTransactions }));
  }),

  rest.post(`${API_BASE_URL}/transactions`, async (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return res(
        ctx.status(401),
        ctx.json({ error: 'Unauthorized', message: 'Access token is required' })
      );
    }
    
    const body = await req.json();
    
    return res(
      ctx.status(201),
      ctx.json({
        data: {
          id: 'new-tx-001',
          ...body,
          createdAt: new Date().toISOString(),
        },
      })
    );
  }),

  rest.put(`${API_BASE_URL}/transactions/:id`, async (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return res(
        ctx.status(401),
        ctx.json({ error: 'Unauthorized', message: 'Access token is required' })
      );
    }
    
    const { id } = req.params;
    const body = await req.json();
    const transaction = mockTransactions.find(t => t.id === id);
    
    if (!transaction) {
      return res(
        ctx.status(404),
        ctx.json({ error: 'Not found', message: 'Transaction not found' })
      );
    }
    
    return res(ctx.json({ data: { ...transaction, ...body } }));
  }),

  rest.delete(`${API_BASE_URL}/transactions/:id`, (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return res(
        ctx.status(401),
        ctx.json({ error: 'Unauthorized', message: 'Access token is required' })
      );
    }
    
    const { id } = req.params;
    const transaction = mockTransactions.find(t => t.id === id);
    
    if (!transaction) {
      return res(
        ctx.status(404),
        ctx.json({ error: 'Not found', message: 'Transaction not found' })
      );
    }
    
    return res(ctx.json({ data: { success: true } }));
  }),
];
