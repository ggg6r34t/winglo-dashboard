import { PageHeader } from '@/components/shared/page-header'
import { getMemoryEntries } from '@/server/dal/memory-entries'
import { MOCK_ORG_ID } from '@/lib/mock'
import { MemoryEntryCard } from '@/features/memory/components/memory-entry-card'
import { AddMemoryForm } from '@/features/memory/components/add-memory-form'

export default async function GrowthMemoryPage() {
  const entries = await getMemoryEntries(MOCK_ORG_ID)

  return (
    <>
      <PageHeader
        title="Memory"
        subtitle="Institutional knowledge and partner history"
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px] items-start">
        <div className="space-y-4">
          {entries.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] py-8 text-center">
              No memory entries yet. Capture your first note below.
            </p>
          ) : (
            entries.map(entry => <MemoryEntryCard key={entry.id} entry={entry} />)
          )}
        </div>
        <div className="lg:sticky lg:top-6">
          <AddMemoryForm />
        </div>
      </div>
    </>
  )
}
