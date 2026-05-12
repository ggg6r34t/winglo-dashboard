import type { MemoryEntry, MemoryEntryType } from '@/types'
import { cn } from '@/lib/utils'

const TYPE_STYLES: Record<MemoryEntryType, { label: string; className: string }> = {
  partner_interaction: { label: 'Interaction', className: 'bg-blue-500/10 text-blue-400' },
  learning: { label: 'Learning', className: 'bg-purple-500/10 text-purple-400' },
  observation: { label: 'Observation', className: 'bg-amber-500/10 text-amber-400' },
}

interface MemoryEntryCardProps {
  entry: MemoryEntry
}

export function MemoryEntryCard({ entry }: MemoryEntryCardProps) {
  const typeStyle = TYPE_STYLES[entry.entry_type]
  return (
    <div className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-[var(--text-primary)] leading-snug flex-1">
          {entry.title}
        </h3>
        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium shrink-0', typeStyle.className)}>
          {typeStyle.label}
        </span>
      </div>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{entry.body}</p>
      <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
        {entry.related_company && (
          <span className="font-medium text-[var(--text-secondary)]">{entry.related_company}</span>
        )}
        <span>{new Date(entry.created_at).toLocaleDateString()}</span>
        <span className="capitalize">{entry.source.replace(/-/g, ' ')}</span>
      </div>
    </div>
  )
}
