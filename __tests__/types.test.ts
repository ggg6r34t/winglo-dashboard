import { describe, it, expectTypeOf } from 'vitest'
import type { Organization, BusinessProfile, Opportunity, OutreachDraft, MemoryEntry, AIRun, AgentLog, AnalyticsSnapshot } from '@/types'

describe('entity types', () => {
  it('Organization has required fields', () => {
    expectTypeOf<Organization>().toHaveProperty('id')
    expectTypeOf<Organization>().toHaveProperty('name')
    expectTypeOf<Organization>().toHaveProperty('slug')
  })
  it('Opportunity has score field', () => {
    expectTypeOf<Opportunity>().toHaveProperty('score')
  })
})
