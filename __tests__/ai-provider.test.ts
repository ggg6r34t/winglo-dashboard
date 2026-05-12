import { describe, it, expect } from 'vitest'
import { vi } from 'vitest'

vi.stubEnv('NEXT_PUBLIC_USE_MOCK_DATA', 'true')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://placeholder.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'placeholder')
vi.stubEnv('OPENAI_API_KEY', 'sk-placeholder')

describe('AI provider', () => {
  it('mock provider returns a CompletionResult', async () => {
    const { ai } = await import('@/lib/ai/providers/index')
    const result = await ai.complete({ messages: [{ role: 'user', content: 'test' }] })
    expect(result).toHaveProperty('content')
    expect(result).toHaveProperty('tokensUsed')
    expect(result).toHaveProperty('model')
    expect(result).toHaveProperty('durationMs')
  })
})
