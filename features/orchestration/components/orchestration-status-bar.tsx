'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useOrchestrationStore } from '../hooks/use-orchestration-store'
import { MonitoringToggle } from './monitoring-toggle'

function relativeTime(iso: string | null): string {
  if (!iso) return 'never'
  const diffMs = Date.now() - new Date(iso).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  return `${Math.floor(diffMin / 60)}h ago`
}

interface Props {
  monitoringEnabled: boolean
}

export function OrchestrationStatusBar({ monitoringEnabled }: Props) {
  const recentRuns = useOrchestrationStore(s => s.recentRuns)
  const isLive = useOrchestrationStore(s => s.isLive)

  const activeCount = useMemo(
    () => recentRuns.filter(r => r.status === 'running' || r.status === 'queued').length,
    [recentRuns]
  )

  const totalTokensToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return recentRuns
      .filter(r => r.created_at.startsWith(today))
      .reduce((sum, r) => sum + (r.tokens_used ?? 0), 0)
  }, [recentRuns])

  const lastRunAt = useMemo(() => {
    const completed = recentRuns
      .filter(r => r.completed_at)
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
    return completed[0]?.completed_at ?? null
  }, [recentRuns])

  return (
    <div className="flex items-center gap-6 px-4 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--surface)] text-xs text-[var(--text-muted)]">
      <span>
        <span className="font-semibold text-[var(--text-primary)]">{activeCount}</span>{' '}
        active run{activeCount !== 1 ? 's' : ''}
      </span>
      <span>
        <span className="font-semibold text-[var(--text-primary)]">
          {totalTokensToday.toLocaleString()}
        </span>{' '}
        tokens today
      </span>
      <span>Last run: {relativeTime(lastRunAt)}</span>
      <div className="flex items-center gap-4 ml-auto">
        <MonitoringToggle initialEnabled={monitoringEnabled} />
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              isLive ? 'bg-green-500 animate-pulse' : 'bg-[var(--text-muted)]'
            )}
          />
          <span className={isLive ? 'text-green-500' : 'text-[var(--text-muted)]'}>
            {isLive ? 'Live' : 'Offline'}
          </span>
        </span>
      </div>
    </div>
  )
}
