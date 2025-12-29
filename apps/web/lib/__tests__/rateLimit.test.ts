import { describe, it, expect } from 'vitest';
import { checkSocketRateLimit, checkApiRateLimit, socketLimiter, apiLimiter } from '../rateLimit';

describe('Rate Limiting', () => {
  describe('Socket Rate Limiting', () => {
    it('should allow requests within the limit', async () => {
      const result = await checkSocketRateLimit('socket-unique-1');
      expect(result).toBe(true);
    });

    it('should return boolean response', async () => {
      const result = await checkSocketRateLimit('socket-unique-2');
      expect(typeof result).toBe('boolean');
    });

    it('should handle concurrent requests from same socket', async () => {
      const socketId = 'socket-concurrent-test';
      const promises = [];

      // Send 10 concurrent requests
      for (let i = 0; i < 10; i++) {
        promises.push(checkSocketRateLimit(socketId));
      }

      const results = await Promise.all(promises);
      expect(results.length).toBe(10);
      expect(results.every((r) => typeof r === 'boolean')).toBe(true);
    });

    it('should track rate limits separately for different socket IDs', async () => {
      const socket1 = 'socket-separate-1';
      const socket2 = 'socket-separate-2';

      const result1 = await checkSocketRateLimit(socket1);
      const result2 = await checkSocketRateLimit(socket2);

      // Both should have capacity initially
      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });

    it('should handle requests from many different sockets', async () => {
      const promises = [];

      // Send requests from 20 different sockets
      for (let i = 0; i < 20; i++) {
        promises.push(checkSocketRateLimit(`socket-many-${i}`));
      }

      const results = await Promise.all(promises);
      // All should succeed since each socket hasn't hit limit
      expect(results.filter((r) => r === true).length).toBe(20);
    });
  });

  describe('API Rate Limiting', () => {
    it('should allow requests within the limit', async () => {
      const result = await checkApiRateLimit('192.168.1.100');
      expect(result).toBe(true);
    });

    it('should return boolean response', async () => {
      const result = await checkApiRateLimit('192.168.1.101');
      expect(typeof result).toBe('boolean');
    });

    it('should track rate limits separately for different IPs', async () => {
      const ip1 = '192.168.1.102';
      const ip2 = '192.168.1.103';

      const result1 = await checkApiRateLimit(ip1);
      const result2 = await checkApiRateLimit(ip2);

      // Both should have capacity initially
      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });

    it('should handle requests from multiple IPs simultaneously', async () => {
      const promises = [];

      // Send requests from 10 different IPs
      for (let i = 0; i < 10; i++) {
        const ip = `192.168.1.${200 + i}`;
        promises.push(checkApiRateLimit(ip));
      }

      const results = await Promise.all(promises);
      expect(results.length).toBe(10);
      expect(results.every((r) => r === true)).toBe(true);
    });

    it('should handle repeated requests from same IP', async () => {
      const ip = 'test-ip-repeated';

      // Make multiple requests from same IP
      const results = [];
      for (let i = 0; i < 10; i++) {
        const result = await checkApiRateLimit(ip);
        results.push(result);
      }

      // All initial requests should succeed
      expect(results.every((r) => typeof r === 'boolean')).toBe(true);
    });
  });

  describe('Rate Limiter Configuration', () => {
    it('should have socket limiter configured with 100 points per 60 seconds', () => {
      expect(socketLimiter.points).toBe(100);
      expect(socketLimiter.duration).toBe(60);
    });

    it('should have API limiter configured with 30 points per 60 seconds', () => {
      expect(apiLimiter.points).toBe(30);
      expect(apiLimiter.duration).toBe(60);
    });

    it('should be configured as RateLimiterMemory instances', () => {
      expect(socketLimiter.constructor.name).toBe('RateLimiterMemory');
      expect(apiLimiter.constructor.name).toBe('RateLimiterMemory');
    });
  });

  describe('Error Handling', () => {
    it('should handle undefined socket ID gracefully', async () => {
      const result = await checkSocketRateLimit('' as any);
      expect(typeof result).toBe('boolean');
    });

    it('should handle undefined IP gracefully', async () => {
      const result = await checkApiRateLimit('' as any);
      expect(typeof result).toBe('boolean');
    });

    it('should not throw on rate limiting', async () => {
      const socketId = 'no-throw-socket';
      let thrown = false;

      try {
        for (let i = 0; i < 150; i++) {
          await checkSocketRateLimit(socketId);
        }
      } catch {
        thrown = true;
      }

      expect(thrown).toBe(false);
    });
  });
});
