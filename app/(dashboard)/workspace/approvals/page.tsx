import { PageHeader } from '@/components/shared/page-header'
import { getApprovals } from '@/server/dal/approvals'
import { getCurrentOrgId } from '@/server/auth/org'
import { approveApprovalAction, rejectApprovalAction } from '@/features/workforce/server/actions'

const urgencyColor = {
  high: 'var(--bad)',
  med: 'var(--warn)',
  low: 'var(--fg-3)',
}

export default async function ApprovalsPage() {
  const orgId = await getCurrentOrgId()
  const approvals = await getApprovals(orgId, { status: 'pending' })

  return (
    <>
      <PageHeader
        title="Approvals"
        subtitle={`${approvals.length} decision${approvals.length === 1 ? '' : 's'} waiting`}
      />

      {approvals.length === 0 ? (
        <div className="tab-empty">No approvals are waiting.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {approvals.map(approval => (
            <div
              key={approval.id}
              style={{
                background: 'var(--bg-1)',
                border: '1px solid var(--line-1)',
                borderRadius: 'var(--r-lg)',
                padding: 14,
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 12,
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: 'var(--fg-0)', fontWeight: 500 }}>
                    {approval.title}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: urgencyColor[approval.urgency] }}>
                    {approval.urgency.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.5 }}>
                  {approval.summary}
                </div>
                <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)' }}>
                  {approval.agent_slug} / {approval.approval_type}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <form action={approveApprovalAction.bind(null, approval.id)}>
                  <button className="btn-mini approve" type="submit">Approve</button>
                </form>
                <form action={rejectApprovalAction.bind(null, approval.id)}>
                  <button className="btn-mini" type="submit">Reject</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
