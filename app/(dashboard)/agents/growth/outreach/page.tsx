import { OutreachDraftCard } from '@/features/outreach/components/outreach-draft-card'
import { getOutreachDrafts } from '@/server/dal/outreach-drafts'
import { getCurrentOrgId } from '@/server/auth/org'

export default async function GrowthOutreachPage() {
  const orgId = await getCurrentOrgId()
  const drafts = await getOutreachDrafts(orgId).catch(() => [])

  return (
    <div className="hub-body fade-in">
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {drafts.map(draft => (
              <OutreachDraftCard key={draft.id} draft={draft} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
