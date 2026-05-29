'use server'

import { updateOpportunityStatus as dalUpdateStatus } from '@/server/dal/opportunities'
import type { Opportunity, OpportunityStatus } from '@/types'
import { revalidatePath } from 'next/cache'
import { createActivityEvent } from '@/server/dal/activity-events'
import { getCurrentOrgId } from '@/server/auth/org'

export async function updateOpportunityStatus(
  id: string,
  status: OpportunityStatus
): Promise<Opportunity> {
  const updated = await dalUpdateStatus(id, status)
  const orgId = await getCurrentOrgId()
  await createActivityEvent(orgId, {
    agent_slug: 'growth',
    actor_type: 'user',
    event_type: `opportunity.${status}`,
    entity_type: 'opportunity',
    entity_id: updated.id,
    severity: status === 'rejected' ? 'warning' : 'success',
    message: `${updated.company_name} marked ${status}`,
  })
  revalidatePath('/opportunities')
  revalidatePath('/agents/growth/opportunities')
  revalidatePath('/workspace')
  return updated
}
