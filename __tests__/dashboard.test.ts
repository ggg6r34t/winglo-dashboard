import { describe, it, expect, vi, beforeAll } from 'vitest'

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK_DATA', 'true')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://placeholder.supabase.co')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'placeholder')
  vi.stubEnv('OPENAI_API_KEY', 'sk-placeholder')
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'placeholder')
})

describe('getAIRuns — mock mode', () => {
  it('returns AI runs for mock org', async () => {
    const { getAIRuns } = await import('@/server/dal/ai-runs')
    const { MOCK_ORG_ID } = await import('@/lib/mock')
    const runs = await getAIRuns(MOCK_ORG_ID, { limit: 6 })
    expect(Array.isArray(runs)).toBe(true)
    expect(runs.length).toBeGreaterThan(0)
    expect(runs[0]).toHaveProperty('agent_type')
    expect(runs[0]).toHaveProperty('status')
  })

  it('filters by status', async () => {
    const { getAIRuns } = await import('@/server/dal/ai-runs')
    const { MOCK_ORG_ID } = await import('@/lib/mock')
    const failed = await getAIRuns(MOCK_ORG_ID, { status: 'failed' })
    expect(failed.length).toBeGreaterThan(0)
    expect(failed.every(r => r.status === 'failed')).toBe(true)
  })
})

describe('getActiveAIRuns — mock mode', () => {
  it('returns only running/queued runs', async () => {
    const { getActiveAIRuns } = await import('@/server/dal/ai-runs')
    const { MOCK_ORG_ID } = await import('@/lib/mock')
    const active = await getActiveAIRuns(MOCK_ORG_ID)
    expect(active.length).toBeGreaterThan(0)
    expect(active.every(r => ['running', 'queued'].includes(r.status))).toBe(true)
  })
})
