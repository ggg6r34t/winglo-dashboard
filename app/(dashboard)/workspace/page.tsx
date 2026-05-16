import { PageHeader } from '@/components/shared/page-header'
import { MetricCard } from '@/features/analytics/components/metric-card'
import { ActivityFeed } from '@/features/dashboard/components/activity-feed'
import { RecentRunsList } from '@/features/dashboard/components/recent-runs-list'
import { AgentStatusCard } from '@/components/workspace/agent-status-card'
import { AGENT_REGISTRY } from '@/lib/agents/registry'
import { getOpportunities } from '@/server/dal/opportunities'
import { getAIRuns, getActiveAIRuns } from '@/server/dal/ai-runs'
import { MOCK_ORG_ID } from '@/lib/mock'
import type { AgentStatus } from '@/components/agents/agent-status-badge'

async function loadData() {
  const [opportunities, recentRuns, activeRuns] = await Promise.all([
    getOpportunities(MOCK_ORG_ID, { limit: 100 }),
    getAIRuns(MOCK_ORG_ID, { limit: 8 }),
    getActiveAIRuns(MOCK_ORG_ID),
  ])
  return { opportunities, recentRuns, activeRuns }
}

export default async function WorkspacePage() {
  let data: Awaited<ReturnType<typeof loadData>> | null = null
  try {
    data = await loadData()
  } catch {
    return (
      <p className="text-sm text-[var(--text-muted)] p-4">
        Failed to load workspace data. Please refresh.
      </p>
    )
  }

  const { opportunities, recentRuns, activeRuns } = data
  const totalDiscovered = opportunities.length
  const totalApproved   = opportunities.filter(o => o.status === 'approved').length
  const totalContacted  = opportunities.filter(o => o.status === 'contacted').length
  const activeAgentCount = activeRuns.length

  const growthStatus: AgentStatus = activeAgentCount > 0 ? 'active' : 'idle'

  return (
    <>
      <PageHeader title="Workspace" subtitle="AI workforce command center" />

      {/* Workforce status strip */}
      <div className="flex gap-3 overflow-x-auto pb-2 mb-6">
        {AGENT_REGISTRY.map(agent => (
          <AgentStatusCard
            key={agent.slug}
            agent={agent}
            status={agent.slug === 'growth' ? growthStatus : 'not-deployed'}
          />
        ))}
      </div>

      {/* Global metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="Discovered"   value={totalDiscovered}  sub="last 100 opportunities" />
        <MetricCard label="Approved"     value={totalApproved}    sub="ready for outreach" />
        <MetricCard label="Contacted"    value={totalContacted}   sub="outreach sent" />
        <MetricCard label="Active Runs"  value={activeAgentCount} sub="running now" />
      </div>

      {/* Activity */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <ActivityFeed runs={recentRuns} />
        </div>
        <div>
          <RecentRunsList runs={recentRuns.slice(0, 5)} />
        </div>
      </div>
    </>
  )
}
