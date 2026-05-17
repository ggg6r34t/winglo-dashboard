import { OutreachDraftCard } from '@/features/outreach/components/outreach-draft-card'
import { GenerateSnapshotButton } from '@/features/analytics/components/generate-snapshot-button'
import { getOutreachDrafts } from '@/server/dal/outreach-drafts'
import { getAnalyticsSnapshots } from '@/server/dal/analytics-snapshots'
import { MOCK_ORG_ID } from '@/lib/mock'

export default async function GrowthReportsPage() {
  const [drafts, snapshots] = await Promise.all([
    getOutreachDrafts(MOCK_ORG_ID).catch(() => []),
    getAnalyticsSnapshots(MOCK_ORG_ID, { days: 7 }).catch(() => []),
  ])

  const latestSnapshot = snapshots.at(-1) ?? null

  return (
    <div className="fade-in">
      <div className="section">
        <div className="section-head">
          <div className="section-title">
            Outreach drafts
            <span className="lbl">{drafts.length} draft{drafts.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        {drafts.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--fg-3)', paddingTop: 8 }}>
            No drafts yet — approve opportunities to generate AI outreach.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 720 }}>
            {drafts.map(draft => (
              <OutreachDraftCard key={draft.id} draft={draft} />
            ))}
          </div>
        )}
      </div>

      <div className="section">
        <div className="section-head">
          <div className="section-title">
            Analytics snapshot
            {latestSnapshot && (
              <span className="lbl">{new Date(latestSnapshot.created_at).toLocaleDateString()}</span>
            )}
          </div>
          <GenerateSnapshotButton />
        </div>
        {latestSnapshot ? (
          <div className="workflow-list">
            <div className="wf-row">
              <div className="wf-state done" />
              <div className="wf-body">
                <div className="wf-title">Snapshot · {latestSnapshot.snapshot_date}</div>
                <div className="wf-meta">
                  <span>Generated {new Date(latestSnapshot.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: 13, color: 'var(--fg-3)', paddingTop: 8 }}>
            No snapshots yet — use Generate Snapshot to capture today&apos;s metrics.
          </p>
        )}
      </div>
    </div>
  )
}
