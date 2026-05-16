import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
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
    <>
      <PageHeader
        title="Reports"
        subtitle="Outreach drafts and generated analytics snapshots"
        action={<GenerateSnapshotButton />}
      />

      {/* Outreach drafts section */}
      <section className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
          Outreach drafts
        </p>
        {drafts.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
            title="No drafts yet"
            description="Approve opportunities to generate AI outreach drafts."
          />
        ) : (
          <div className="space-y-4 max-w-3xl">
            {drafts.map(draft => (
              <OutreachDraftCard key={draft.id} draft={draft} />
            ))}
          </div>
        )}
      </section>

      {/* Latest snapshot section */}
      {latestSnapshot && (
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
            Latest snapshot
          </p>
          <div className="p-4 rounded-lg border border-[var(--border-color)] bg-[var(--surface)] max-w-2xl">
            <p className="text-xs text-[var(--text-muted)] mb-2">
              {new Date(latestSnapshot.created_at).toLocaleDateString()}
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Snapshot date: {latestSnapshot.snapshot_date}
            </p>
          </div>
        </section>
      )}
    </>
  )
}
