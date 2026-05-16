import { PageHeader } from '@/components/shared/page-header'
import { AgentCard } from '@/components/agents/agent-card'
import { AGENT_REGISTRY } from '@/lib/agents/registry'
import { getAIRuns, getActiveAIRuns } from '@/server/dal/ai-runs'
import { MOCK_ORG_ID } from '@/lib/mock'
import type { AgentStatus } from '@/components/agents/agent-status-badge'

async function loadData() {
  const [recentRuns, activeRuns] = await Promise.all([
    getAIRuns(MOCK_ORG_ID, { limit: 50 }),
    getActiveAIRuns(MOCK_ORG_ID),
  ])
  return { recentRuns, activeRuns }
}

export default async function AgentsRosterPage() {
  let data: Awaited<ReturnType<typeof loadData>> | null = null
  try {
    data = await loadData()
  } catch {
    data = { recentRuns: [], activeRuns: [] }
  }

  const { recentRuns, activeRuns } = data
  const deployedCount = AGENT_REGISTRY.filter(a => a.deployed).length
  const activeCount   = activeRuns.length

  // Runs in the last 7 days for the Growth agent
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const runsThisWeek = recentRuns.filter(
    r => new Date(r.created_at) > sevenDaysAgo,
  ).length
  const lastRun = recentRuns[0] ?? null

  function getStatus(slug: string): AgentStatus {
    if (slug !== 'growth') return 'not-deployed'
    if (activeCount > 0) return 'active'
    return 'idle'
  }

  return (
    <>
      <PageHeader
        title="AI Workforce"
        subtitle={`${deployedCount} deployed · ${activeCount} active`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {AGENT_REGISTRY.map(agent => (
          <AgentCard
            key={agent.slug}
            agent={agent}
            status={getStatus(agent.slug)}
            runsThisWeek={agent.slug === 'growth' ? runsThisWeek : undefined}
            lastActiveAt={agent.slug === 'growth' ? lastRun?.created_at ?? null : null}
          />
        ))}
      </div>
    </>
  )
}
