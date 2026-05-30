import { PageHeader } from '@/components/shared/page-header'
import { ApprovalReviewClient } from '@/components/workspace/approval-review-client'
import { getApprovalCounts, getApprovals } from '@/server/dal/approvals'
import { getCurrentOrgId } from '@/server/auth/org'
import { approveApprovalAction, rejectApprovalAction } from '@/features/workforce/server/actions'

export default async function ApprovalsPage() {
  const orgId = await getCurrentOrgId()
  const [approvals, counts] = await Promise.all([
    getApprovals(orgId, { status: 'pending' }),
    getApprovalCounts(orgId),
  ])

  return (
    <>
      <PageHeader
        title="Approvals"
        subtitle={`${counts.pending} decision${counts.pending === 1 ? '' : 's'} waiting across the AI workforce`}
      />

      <ApprovalReviewClient
        approvals={approvals}
        actions={{
          approve: approveApprovalAction,
          reject: rejectApprovalAction,
        }}
      />
    </>
  )
}
