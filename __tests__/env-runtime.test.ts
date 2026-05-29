import { describe, expect, it } from 'vitest'
import { assertMockDataAllowed, parseRuntimeEnv, resolveDataSource } from '@/lib/env/runtime'

describe('runtime env guardrails', () => {
  it('allows mock data in local app env', () => {
    const env = parseRuntimeEnv({
      NEXT_PUBLIC_APP_ENV: 'local',
      NEXT_PUBLIC_USE_MOCK_DATA: 'true',
    })

    expect(() => assertMockDataAllowed(env)).not.toThrow()
    expect(resolveDataSource(env)).toBe('mock')
  })

  it('blocks mock data in preview without explicit opt-in', () => {
    const env = parseRuntimeEnv({
      NEXT_PUBLIC_APP_ENV: 'preview',
      NEXT_PUBLIC_USE_MOCK_DATA: 'true',
      ALLOW_PREVIEW_MOCK_DATA: 'false',
    })

    expect(() => assertMockDataAllowed(env)).toThrow(/Preview mock data requires/)
  })

  it('allows mock data in preview with explicit opt-in', () => {
    const env = parseRuntimeEnv({
      NEXT_PUBLIC_APP_ENV: 'preview',
      NEXT_PUBLIC_USE_MOCK_DATA: 'true',
      ALLOW_PREVIEW_MOCK_DATA: 'true',
    })

    expect(() => assertMockDataAllowed(env)).not.toThrow()
  })

  it('blocks mock data in production', () => {
    const env = parseRuntimeEnv({
      NEXT_PUBLIC_APP_ENV: 'production',
      NEXT_PUBLIC_USE_MOCK_DATA: 'true',
      ALLOW_PREVIEW_MOCK_DATA: 'true',
    })

    expect(() => assertMockDataAllowed(env)).toThrow(/Production cannot run with mock data enabled/)
  })

  it('defaults to live data when mock mode is disabled', () => {
    const env = parseRuntimeEnv({
      NEXT_PUBLIC_APP_ENV: 'production',
      NEXT_PUBLIC_USE_MOCK_DATA: 'false',
    })

    expect(resolveDataSource(env)).toBe('live')
  })
})
