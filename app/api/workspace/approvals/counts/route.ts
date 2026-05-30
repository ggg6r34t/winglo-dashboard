import { NextResponse } from 'next/server'
import { getCurrentOrgId } from '@/server/auth/org'
import { getApprovalCounts } from '@/server/dal/approvals'

export async function GET() {
  const orgId = await getCurrentOrgId()
  const counts = await getApprovalCounts(orgId)
  return NextResponse.json(counts)
}
