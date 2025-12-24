// Simple in-memory rate limiting
// For production at scale, use Redis-based rate limiting (e.g., Upstash Redis)

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.requests.entries()) {
        if (now > entry.resetTime) {
          this.requests.delete(key);
        }
      }
    }, 60000);
  }

  check(identifier: string, limit: number, windowMs: number): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    if (!entry || now > entry.resetTime) {
      // Create new entry
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });
      return {
        allowed: true,
        remaining: limit - 1,
        resetAt: now + windowMs,
      };
    }

    if (entry.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.resetTime,
      };
    }

    entry.count++;
    return {
      allowed: true,
      remaining: limit - entry.count,
      resetAt: entry.resetTime,
    };
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.requests.clear();
  }
}

const rateLimiter = new RateLimiter();

export function rateLimit(identifier: string, limit: number, windowMs: number) {
  return rateLimiter.check(identifier, limit, windowMs);
}

// Helper to get identifier from request
export function getRateLimitIdentifier(request: Request): string {
  // Try to get IP from headers (works with Vercel/proxies)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  return ip;
}

