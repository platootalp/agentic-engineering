import Redis from 'ioredis';
import { env } from './env';

export const redis = new Redis(env.REDIS_URL);

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

export const CACHE_TTL = {
  FUND_ESTIMATE: 30,        // 30 seconds
  FUND_DETAIL: 300,         // 5 minutes
  FUND_HISTORY: 600,        // 10 minutes
  FUND_RANKING: 60,         // 1 minute
  FUND_SEARCH: 600,         // 10 minutes
  PORTFOLIO_SUMMARY: 60,    // 1 minute
};
