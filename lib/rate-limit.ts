// In-memory sliding window rate limiter
// Each entry tracks call timestamps within the window

interface RateLimiterOptions {
  limit: number     // max calls per window
  windowMs: number  // window size in ms
}

export class RateLimitError extends Error {
  readonly retryAfterMs: number
  constructor(retryAfterMs: number) {
    super(`Rate limit exceeded. Try again in ${Math.ceil(retryAfterMs / 1000)}s.`)
    this.name = 'RateLimitError'
    this.retryAfterMs = retryAfterMs
  }
}

export function createRateLimiter(options: RateLimiterOptions) {
  // NOTE: In-memory store — not effective across multiple server instances or serverless deployments
  const store = new Map<string, number[]>() // key → timestamps array

  return {
    check(key: string): void {
      const now = Date.now()
      const windowStart = now - options.windowMs
      const existing = store.get(key) ?? []
      const active = existing.filter(t => t > windowStart)

      // Lazy eviction: if previous timestamps all expired, clean up the old entry
      if (existing.length > 0 && active.length === 0) {
        store.delete(key)
      }

      if (active.length >= options.limit) {
        const oldest = active[0]
        throw new RateLimitError(oldest + options.windowMs - now)
      }

      active.push(now)
      store.set(key, active)
    },
    // Allows clearing state between tests
    clear(): void {
      store.clear()
    },
  }
}
