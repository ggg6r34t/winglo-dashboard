import { getMemoryEntries } from '@/server/dal/memory-entries'
import { MOCK_ORG_ID } from '@/lib/mock'
import { MemoryEntryCard } from '@/features/memory/components/memory-entry-card'
import { AddMemoryForm } from '@/features/memory/components/add-memory-form'

export default async function GrowthMemoryPage() {
  const entries = await getMemoryEntries(MOCK_ORG_ID)

  return (
    <div className="fade-in memory-layout">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {entries.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--fg-3)', paddingTop: 24 }}>
            No memory entries yet. Capture your first note using the form.
          </p>
        ) : (
          entries.map(entry => <MemoryEntryCard key={entry.id} entry={entry} />)
        )}
      </div>
      <aside className="approvals-side" style={{ position: 'sticky', top: 24 }}>
        <AddMemoryForm />
      </aside>
    </div>
  )
}
