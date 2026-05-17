import type { MemoryEntry, MemoryEntryType } from '@/types'

const TYPE_LABELS: Record<MemoryEntryType, string> = {
  partner_interaction: 'Interaction',
  learning: 'Learning',
  observation: 'Observation',
}

interface MemoryEntryCardProps {
  entry: MemoryEntry
}

export function MemoryEntryCard({ entry }: MemoryEntryCardProps) {
  return (
    <div className="memory-record">
      <div className="memory-record-head">
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-0)', letterSpacing: '-0.005em', marginBottom: 3 }}>
            {entry.title}
          </div>
          <div className="memory-record-key">{entry.source}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {TYPE_LABELS[entry.entry_type]}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)' }}>
            {new Date(entry.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="memory-record-body">{entry.body}</div>
      <div className="memory-record-foot">
        {entry.related_company && (
          <span style={{ color: 'var(--fg-1)' }}>{entry.related_company}</span>
        )}
        <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 12 }}>
          <span style={{ cursor: 'pointer', color: 'var(--fg-2)' }}>Edit</span>
          <span style={{ cursor: 'pointer', color: 'var(--fg-2)' }}>Retract</span>
        </span>
      </div>
    </div>
  )
}
