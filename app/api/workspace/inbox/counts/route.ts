import { NextResponse } from 'next/server'
import { getCurrentOrgId } from '@/server/auth/org'
import { getInboxCounts } from '@/server/dal/inbox'

export async function GET() {
  const orgId = await getCurrentOrgId()
  const counts = await getInboxCounts(orgId)
  return NextResponse.json(counts)
}
