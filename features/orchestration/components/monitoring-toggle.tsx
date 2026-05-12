'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { toggleMonitoring } from '@/features/monitoring/server/actions'

interface Props {
  initialEnabled: boolean
}

export function MonitoringToggle({ initialEnabled }: Props) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    const next = !enabled
    setEnabled(next)
    startTransition(async () => {
      try {
        await toggleMonitoring(next)
      } catch {
        setEnabled(!next)
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      aria-pressed={enabled}
      title={enabled ? 'Continuous monitoring on — click to disable' : 'Continuous monitoring off — click to enable'}
      className={cn(
        'flex items-center gap-1.5 text-xs font-medium transition-colors',
        enabled ? 'text-emerald-400' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
        isPending && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span className={cn(
        'relative inline-flex w-7 h-4 rounded-full border transition-colors shrink-0',
        enabled
          ? 'bg-emerald-500/20 border-emerald-500/40'
          : 'bg-[var(--surface-raised)] border-[var(--border-color)]'
      )}>
        <span className={cn(
          'absolute top-0.5 h-3 w-3 rounded-full transition-transform',
          enabled ? 'translate-x-3.5 bg-emerald-400' : 'translate-x-0.5 bg-[var(--text-muted)]'
        )} />
      </span>
      Monitor
    </button>
  )
}
