import { afterEach, describe, expect, it, vi } from 'vitest'
import { MOCK_ORG_ID } from '@/lib/mock'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('inbox DAL mock adapter', () => {
  it('filters inbox items and returns enterprise counts', async () => {
    stubMockEnv()
    const { getInboxCounts, getInboxItems } = await import('@/server/dal/inbox')

    const all = await getInboxItems(MOCK_ORG_ID)
    const decisions = await getInboxItems(MOCK_ORG_ID, { filter: 'decisions' })
    const reports = await getInboxItems(MOCK_ORG_ID, { filter: 'reports' })
    const operational = await getInboxItems(MOCK_ORG_ID, { filter: 'operational' })
    const counts = await getInboxCounts(MOCK_ORG_ID)

    expect(all.length).toBeGreaterThan(0)
    expect(decisions.every(item => item.category === 'decision')).toBe(true)
    expect(reports.every(item => item.category === 'report')).toBe(true)
    expect(operational.every(item => item.category === 'operational')).toBe(true)
    expect(counts.all).toBe(all.length)
    expect(counts.decisions).toBe(decisions.length)
    expect(counts.reports).toBe(reports.length)
    expect(counts.operational).toBe(operational.length)
  })

  it('persists read, reply, resolve, and archive operations in mock mode', async () => {
    stubMockEnv()
    const {
      archiveInboxItem,
      getInboxItems,
      markInboxItemRead,
      replyToInboxItem,
      resolveInboxItem,
    } = await import('@/server/dal/inbox')

    const [item] = await getInboxItems(MOCK_ORG_ID)
    expect(item.read_at).toBeNull()

    const read = await markInboxItemRead(MOCK_ORG_ID, item.id, 'test-user')
    expect(read.read_at).not.toBeNull()

    const reply = await replyToInboxItem(MOCK_ORG_ID, item.id, 'test-user', 'Reviewed by ops.')
    expect(reply.comments.at(-1)?.body).toBe('Reviewed by ops.')

    const resolved = await resolveInboxItem(MOCK_ORG_ID, item.id, 'test-user')
    expect(resolved.status).toBe('resolved')
    expect(resolved.resolved_at).not.toBeNull()

    const archived = await archiveInboxItem(MOCK_ORG_ID, item.id, 'test-user')
    expect(archived.archived_at).not.toBeNull()
  })
})

function stubMockEnv() {
  vi.stubEnv('NEXT_PUBLIC_APP_ENV', 'local')
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK_DATA', 'true')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://placeholder.supabase.co')
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'placeholder-key')
  vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'placeholder')
  vi.stubEnv('OPENAI_API_KEY', 'sk-placeholder')
}
