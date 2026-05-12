'use client'

import { useRouter, usePathname } from 'next/navigation'
import type { OpportunityStatus } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_TABS: { label: string; value: OpportunityStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'New', value: 'new' },
  { label: 'Reviewing', value: 'reviewing' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
]

const SCORE_OPTIONS: { label: string; value: string }[] = [
  { label: 'All scores', value: '' },
  { label: '≥70', value: '70' },
  { label: '≥80', value: '80' },
  { label: '≥90', value: '90' },
]

interface FilterBarProps {
  currentStatus: OpportunityStatus | 'all'
  currentMinScore: string
  total: number
}

export function FilterBar({ currentStatus, currentMinScore, total }: FilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()

  function buildUrl(status: OpportunityStatus | 'all', minScore: string): string {
    const params = new URLSearchParams()
    if (status !== 'all') params.set('status', status)
    if (minScore) params.set('minScore', minScore)
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  return (
    <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
      <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--surface-raised)]">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => router.push(buildUrl(tab.value, currentMinScore))}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              currentStatus === tab.value
                ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <select
          value={currentMinScore}
          onChange={(e) => router.push(buildUrl(currentStatus, e.target.value))}
          className="text-sm bg-[var(--surface-raised)] border border-[var(--border-color)] rounded-md px-2 py-1.5 text-[var(--text-secondary)] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        >
          {SCORE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="text-sm text-[var(--text-muted)] whitespace-nowrap">
          {total} result{total !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}
