import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { getOutreachDrafts } from '@/server/dal/outreach-drafts'
import { MOCK_ORG_ID } from '@/lib/mock'
import { OutreachDraftCard } from '@/features/outreach/components/outreach-draft-card'

export default async function OutreachPage() {
  const drafts = await getOutreachDrafts(MOCK_ORG_ID)

  return (
    <>
      <PageHeader
        title="Outreach"
        subtitle="AI-drafted partnership messages and proposals"
      />
      {drafts.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
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
    </>
  )
}
