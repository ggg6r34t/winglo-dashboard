'use server'

import { revalidatePath } from 'next/cache'
import { updateMonitoringEnabled } from '@/server/dal/organizations'
import { MOCK_ORG_ID } from '@/lib/mock'

const ORG_ID = MOCK_ORG_ID

export async function toggleMonitoring(enabled: boolean): Promise<void> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') return
  await updateMonitoringEnabled(ORG_ID, enabled)
  revalidatePath('/orchestration')
}
