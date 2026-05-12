import { createRateLimiter } from './rate-limit'

// Per-IP limits for LLM-heavy server actions
export const intakeRateLimiter = createRateLimiter({ limit: 3, windowMs: 60_000 })    // 3/min
export const discoveryRateLimiter = createRateLimiter({ limit: 2, windowMs: 60_000 })  // 2/min
export const outreachRateLimiter = createRateLimiter({ limit: 5, windowMs: 60_000 })   // 5/min
export const memoryRateLimiter = createRateLimiter({ limit: 10, windowMs: 60_000 })    // 10/min
export const analyticsRateLimiter = createRateLimiter({ limit: 3, windowMs: 60_000 })  // 3/min
