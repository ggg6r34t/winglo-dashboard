import { describe, it, expect } from 'vitest'
import { vi } from 'vitest'

vi.stubEnv('NEXT_PUBLIC_USE_MOCK_DATA', 'true')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://placeholder.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'placeholder')

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

describe('updateOpportunityStatus — mock mode', () => {
  it('returns updated opportunity with new status', async () => {
    const { updateOpportunityStatus } = await import('@/features/opportunities/server/actions')
    const result = await updateOpportunityStatus('opp-00000000-0000-0000-000000000001', 'approved')
    expect(result.id).toBe('opp-00000000-0000-0000-000000000001')
    expect(result.status).toBe('approved')
  })

  it('throws for an unknown opportunity id', async () => {
    const { updateOpportunityStatus } = await import('@/features/opportunities/server/actions')
    await expect(updateOpportunityStatus('nonexistent-id', 'approved')).rejects.toThrow()
  })
})
