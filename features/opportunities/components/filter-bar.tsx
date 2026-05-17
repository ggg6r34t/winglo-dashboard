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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => router.push(buildUrl(tab.value, currentMinScore))}
            className={"chip" + (currentStatus === tab.value ? " active" : "")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {SCORE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => router.push(buildUrl(currentStatus, opt.value))}
            className={"chip" + (currentMinScore === opt.value ? " active" : "")}
          >
            {opt.label}
          </button>
        ))}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)', marginLeft: 8, whiteSpace: 'nowrap' }}>
          {total} result{total !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}
