'use server'

import { updateOpportunityStatus as dalUpdateStatus } from '@/server/dal/opportunities'
import type { Opportunity, OpportunityStatus } from '@/types'
import { revalidatePath } from 'next/cache'

export async function updateOpportunityStatus(
  id: string,
  status: OpportunityStatus
): Promise<Opportunity> {
  const updated = await dalUpdateStatus(id, status)
  revalidatePath('/opportunities')
  return updated
}
