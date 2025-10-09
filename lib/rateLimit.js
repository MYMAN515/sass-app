const DEFAULT_INTERVAL = 60_000;
const DEFAULT_MAX = 10;

export function createRateLimiter({ interval = DEFAULT_INTERVAL, uniqueTokenPerInterval = DEFAULT_MAX } = {}) {
  const hits = new Map();

  function clean(now) {
    for (const [key, entry] of hits.entries()) {
      if (entry.resetTime <= now) {
        hits.delete(key);
      }
    }
  }

  return {
    check(identifier = 'anonymous') {
      const now = Date.now();
      clean(now);

      const entry = hits.get(identifier) || { count: 0, resetTime: now + interval };
      if (entry.count >= uniqueTokenPerInterval) {
        return {
          success: false,
          retryAfter: Math.max(0, Math.ceil((entry.resetTime - now) / 1000)),
        };
      }

      entry.count += 1;
      hits.set(identifier, entry);

      return { success: true, remaining: uniqueTokenPerInterval - entry.count };
    },
  };
}
