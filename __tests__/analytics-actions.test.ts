import { describe, it, expect, vi, beforeAll } from 'vitest'

beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK_DATA', 'true')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://placeholder.supabase.co')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'placeholder')
  vi.stubEnv('NEXT_PUBLIC_AI_PROVIDER', 'openai')
  vi.stubEnv('OPENAI_API_KEY', 'sk-placeholder')
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'placeholder')
})

describe('generateAnalyticsInsights — mock mode', () => {
  it('returns AnalyticsOutput with required fields', async () => {
    const { generateAnalyticsInsights } = await import('@/features/analytics/server/actions')
    const result = await generateAnalyticsInsights()
    expect(result).toHaveProperty('summary')
    expect(result).toHaveProperty('insights')
    expect(result).toHaveProperty('recommendations')
    expect(result).toHaveProperty('highlight_metric')
    expect(Array.isArray(result.insights)).toBe(true)
    expect(Array.isArray(result.recommendations)).toBe(true)
    expect(['up', 'down', 'flat']).toContain(result.highlight_metric.trend)
  })
})
