import { afterEach, describe, expect, it, vi } from 'vitest'
import { MOCK_ORG_ID } from '@/lib/mock'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('approval DAL MVQP behavior', () => {
  it('persists mock decisions with actor and note', async () => {
    stubMockEnv()
    const { decideApproval, getApprovals } = await import('@/server/dal/approvals')

    const [pending] = await getApprovals(MOCK_ORG_ID, { status: 'pending' })
    const decided = await decideApproval(MOCK_ORG_ID, pending.id, 'approved', {
      decisionNote: 'Reviewed source artifact.',
      actorId: 'operator-1',
    })

    expect(decided.status).toBe('approved')
    expect(decided.decision_note).toBe('Reviewed source artifact.')
    expect(decided.decided_by).toBe('operator-1')

    const stillPending = await getApprovals(MOCK_ORG_ID, { status: 'pending' })
    expect(stillPending.some(item => item.id === pending.id)).toBe(false)
  })

  it('requires a rejection note', async () => {
    stubMockEnv()
    const { decideApproval, getApprovals } = await import('@/server/dal/approvals')

    const [pending] = await getApprovals(MOCK_ORG_ID, { status: 'pending' })

    await expect(
      decideApproval(MOCK_ORG_ID, pending.id, 'rejected', { actorId: 'operator-1' }),
    ).rejects.toThrow('Rejection note is required')
  })

  it('returns approval counts by status and urgency', async () => {
    stubMockEnv()
    const { getApprovalCounts } = await import('@/server/dal/approvals')

    const counts = await getApprovalCounts(MOCK_ORG_ID)

    expect(counts.pending).toBeGreaterThan(0)
    expect(counts.byUrgency.low + counts.byUrgency.med + counts.byUrgency.high).toBe(counts.pending)
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
