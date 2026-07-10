import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create a new ratelimiter, that allows 10 requests per 10 seconds
export const rateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: '@upstash/ratelimit',
});

// Fallback in-memory rate limiter for local dev if Redis is not configured
const mockStore = new Map();
export const mockRateLimit = {
  limit: async (identifier: string) => {
    const now = Date.now();
    const record = mockStore.get(identifier) || { count: 0, reset: now + 10000 };
    if (now > record.reset) {
      record.count = 1;
      record.reset = now + 10000;
    } else {
      record.count += 1;
    }
    mockStore.set(identifier, record);
    return {
      success: record.count <= 10,
      limit: 10,
      remaining: Math.max(0, 10 - record.count),
      reset: record.reset,
    };
  }
};

export const getRateLimit = () => {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return rateLimit;
  }
  return mockRateLimit;
};
