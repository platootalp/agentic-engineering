import request from 'supertest';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import express from 'express';
import { fundController } from '../fund.controller';
import { fundService } from '../../services/fund.service';

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.get('/api/funds/search', fundController.search);
  app.get('/api/funds/:id', fundController.getById);
  app.get('/api/funds/:id/estimate', fundController.getEstimate);
  app.get('/api/funds/:id/history', fundController.getHistory);
  app.post('/api/funds/:id/sync', fundController.sync);
  return app;
};

describe('FundController', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
    jest.restoreAllMocks();
  });

  it('should search funds successfully', async () => {
    jest.spyOn(fundService, 'searchFunds').mockResolvedValue([]);
    const response = await request(app).get('/api/funds/search?query=test');
    expect(response.status).toBe(200);
  });

  it('should handle invalid query', async () => {
    const response = await request(app).get('/api/funds/search?query=');
    expect(response.status).toBe(500);
  });

  it('should return fund by id', async () => {
    jest.spyOn(fundService, 'getFund').mockResolvedValue({ id: '000001' } as any);
    const response = await request(app).get('/api/funds/000001');
    expect(response.status).toBe(200);
  });

  it('should return 404 when fund not found', async () => {
    jest.spyOn(fundService, 'getFund').mockResolvedValue(null);
    const response = await request(app).get('/api/funds/nonexistent');
    expect(response.status).toBe(404);
  });

  it('should return fund estimate', async () => {
    jest.spyOn(fundService, 'getFundEstimate').mockResolvedValue({
      fundId: '000001', fundName: 'Test', estimateNav: 1.5, estimateTime: '2024-01-01',
      estimateChange: 0.1, estimateChangePercent: 1.0, lastNav: 1.4, lastNavDate: '2024-01-01'
    });
    const response = await request(app).get('/api/funds/000001/estimate');
    expect(response.status).toBe(200);
  });

  it('should return 404 when estimate not available', async () => {
    jest.spyOn(fundService, 'getFundEstimate').mockResolvedValue(null);
    const response = await request(app).get('/api/funds/000001/estimate');
    expect(response.status).toBe(404);
  });

  it('should return fund NAV history', async () => {
    jest.spyOn(fundService, 'getFundNavHistory').mockResolvedValue([]);
    const response = await request(app).get('/api/funds/000001/history');
    expect(response.status).toBe(200);
  });

  it('should sync fund successfully', async () => {
    jest.spyOn(fundService, 'syncFundFromEastmoney').mockResolvedValue({ id: '000001' } as any);
    const response = await request(app).post('/api/funds/000001/sync');
    expect(response.status).toBe(200);
  });

  it('should return 404 when sync fund not found', async () => {
    jest.spyOn(fundService, 'syncFundFromEastmoney').mockResolvedValue(null);
    const response = await request(app).post('/api/funds/nonexistent/sync');
    expect(response.status).toBe(404);
  });
});
