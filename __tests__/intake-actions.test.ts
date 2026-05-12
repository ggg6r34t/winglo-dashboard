import { describe, it, expect } from 'vitest'
import { vi } from 'vitest'

vi.stubEnv('NEXT_PUBLIC_USE_MOCK_DATA', 'true')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://placeholder.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'placeholder')
vi.stubEnv('OPENAI_API_KEY', 'sk-placeholder')

describe('analyzeBusinessProfile — mock mode', () => {
  it('returns the mock business profile', async () => {
    const { analyzeBusinessProfile } = await import('@/features/intake/server/actions')
    const { MOCK_PROFILE_ID } = await import('@/lib/mock')
    const result = await analyzeBusinessProfile({
      name: 'Test Co',
      description: 'A description long enough to pass validation',
      website_url: '',
    })
    expect(result.id).toBe(MOCK_PROFILE_ID)
    expect(result.status).toBe('complete')
  })
})

describe('runDiscovery — mock mode', () => {
  it('returns mock opportunities', async () => {
    const { runDiscovery } = await import('@/features/intake/server/actions')
    const { MOCK_PROFILE_ID } = await import('@/lib/mock')
    const result = await runDiscovery(MOCK_PROFILE_ID)
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })
})
