import { PageHeader } from '@/components/shared/page-header'
import { AgentLiveCard } from '@/components/workspace/agent-live-card'
import { AGENT_REGISTRY } from '@/lib/agents/registry'
import { getAIRuns, getActiveAIRuns } from '@/server/dal/ai-runs'
import { MOCK_ORG_ID } from '@/lib/mock'
import type { AgentStatus } from '@/components/agents/agent-status-badge'

async function loadData() {
  const [recentRuns, activeRuns] = await Promise.all([
    getAIRuns(MOCK_ORG_ID, { limit: 20 }),
    getActiveAIRuns(MOCK_ORG_ID),
  ])
  return { recentRuns, activeRuns }
}

export default async function WorkspaceLivePage() {
  let data: Awaited<ReturnType<typeof loadData>> | null = null
  try {
    data = await loadData()
  } catch {
    return (
      <p className="text-sm text-[var(--text-muted)] p-4">
        Failed to load live data. Please refresh.
      </p>
    )
  }

  const { recentRuns, activeRuns } = data
  const activeCount = activeRuns.length
  const mostRecentRun = recentRuns[0] ?? null

  function getGrowthStatus(): AgentStatus {
    if (activeCount > 0) return 'active'
    return 'idle'
  }

  return (
    <>
      <PageHeader
        title="Live"
        subtitle={`${activeCount} agent${activeCount !== 1 ? 's' : ''} running`}
      />

      <div className="grid grid-cols-3 gap-4">
        {AGENT_REGISTRY.map(agent => (
          <AgentLiveCard
            key={agent.slug}
            agent={agent}
            status={agent.slug === 'growth' ? getGrowthStatus() : 'not-deployed'}
            lastRunAt={agent.slug === 'growth' ? mostRecentRun?.created_at ?? null : null}
            tokensUsed={agent.slug === 'growth' ? mostRecentRun?.tokens_used ?? null : null}
          />
        ))}
      </div>
    </>
  )
}
