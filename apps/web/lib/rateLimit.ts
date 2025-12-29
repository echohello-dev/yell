import { RateLimiterMemory } from 'rate-limiter-flexible';

export const socketLimiter = new RateLimiterMemory({
  points: 100,
  duration: 60,
});

export const apiLimiter = new RateLimiterMemory({
  points: 30,
  duration: 60,
});

export async function checkSocketRateLimit(socketId: string): Promise<boolean> {
  try {
    await socketLimiter.consume(socketId, 1);
    return true;
  } catch {
    return false;
  }
}

export async function checkApiRateLimit(ip: string): Promise<boolean> {
  try {
    await apiLimiter.consume(ip, 1);
    return true;
  } catch {
    return false;
  }
}
