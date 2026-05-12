import { describe, it, expect } from 'vitest'
import { createRateLimiter, RateLimitError } from '@/lib/rate-limit'

describe('createRateLimiter', () => {
  it('allows calls within the limit', () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 60_000 })
    expect(() => limiter.check('user-1')).not.toThrow()
    expect(() => limiter.check('user-1')).not.toThrow()
    expect(() => limiter.check('user-1')).not.toThrow()
  })

  it('throws RateLimitError when limit exceeded', () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 60_000 })
    limiter.check('user-2')
    limiter.check('user-2')
    expect(() => limiter.check('user-2')).toThrow(RateLimitError)
  })

  it('RateLimitError has positive retryAfterMs', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 })
    limiter.check('user-3')
    try {
      limiter.check('user-3')
      expect.fail('should have thrown')
    } catch (err) {
      expect(err).toBeInstanceOf(RateLimitError)
      expect((err as RateLimitError).retryAfterMs).toBeGreaterThan(0)
    }
  })

  it('different keys do not interfere', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 })
    limiter.check('user-a')
    expect(() => limiter.check('user-b')).not.toThrow()
  })

  it('clear() resets the limiter', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 })
    limiter.check('user-clear')
    limiter.clear()
    expect(() => limiter.check('user-clear')).not.toThrow()
  })
})
