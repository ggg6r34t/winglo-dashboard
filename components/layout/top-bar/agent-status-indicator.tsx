import { Suspense } from 'react'
import { getActiveAIRuns } from '@/server/dal/ai-runs'
import { MOCK_ORG_ID } from '@/lib/mock'

async function AgentStatusIndicatorInner() {
  const activeRuns = await getActiveAIRuns(MOCK_ORG_ID)
  const count = activeRuns.length

  if (count === 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] px-2">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]" />
        <span>Idle</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 text-xs text-[var(--success)] px-2">
      <span className="relative flex w-1.5 h-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75" />
        <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-[var(--success)]" />
      </span>
      <span>{count} agent{count !== 1 ? 's' : ''} running</span>
    </div>
  )
}

function AgentStatusFallback() {
  return (
    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] px-2">
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]" />
      <span>Idle</span>
    </div>
  )
}

export function AgentStatusIndicator() {
  return (
    <Suspense fallback={<AgentStatusFallback />}>
      <AgentStatusIndicatorInner />
    </Suspense>
  )
}
