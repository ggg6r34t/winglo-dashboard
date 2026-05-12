import { describe, it, expect, vi } from 'vitest'

// Real mode: mock OFF
vi.stubEnv('NEXT_PUBLIC_USE_MOCK_DATA', 'false')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://placeholder.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'placeholder')
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'placeholder')
vi.stubEnv('OPENAI_API_KEY', 'sk-placeholder')

vi.mock('@/lib/ai/providers', () => ({
  ai: {
    complete: vi.fn(),
  },
}))

vi.mock('@/server/dal/business-profiles', () => ({
  createBusinessProfile: vi.fn().mockRejectedValue(new Error('DB connection failed')),
  updateBusinessProfile: vi.fn(),
  getLatestBusinessProfile: vi.fn().mockResolvedValue(null),
}))

vi.mock('@/server/dal/ai-runs', () => ({
  createAIRun: vi.fn(),
  updateAIRun: vi.fn(),
}))

vi.mock('@/lib/get-client-key', () => ({
  getClientKey: vi.fn().mockResolvedValue('test-client'),
}))

vi.mock('@/lib/rate-limiters', () => ({
  intakeRateLimiter: { check: vi.fn(), clear: vi.fn() },
  discoveryRateLimiter: { check: vi.fn(), clear: vi.fn() },
  outreachRateLimiter: { check: vi.fn(), clear: vi.fn() },
  memoryRateLimiter: { check: vi.fn(), clear: vi.fn() },
  analyticsRateLimiter: { check: vi.fn(), clear: vi.fn() },
}))

describe('analyzeBusinessProfile — real mode error propagation', () => {
  it('throws when createBusinessProfile fails', async () => {
    const { analyzeBusinessProfile } = await import('@/features/intake/server/actions')
    await expect(
      analyzeBusinessProfile({
        name: 'Test Co',
        description: 'A description long enough to pass validation',
        website_url: '',
      })
    ).rejects.toThrow('DB connection failed')
  })
})
