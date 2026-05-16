import { MetricCard } from '@/features/analytics/components/metric-card'
import { getOpportunities } from '@/server/dal/opportunities'
import { getAIRuns, getActiveAIRuns } from '@/server/dal/ai-runs'
import { MOCK_ORG_ID } from '@/lib/mock'
import { getAgentBySlug } from '@/lib/agents/registry'
import Link from 'next/link'

async function loadData() {
  const [opportunities, recentRuns, activeRuns] = await Promise.all([
    getOpportunities(MOCK_ORG_ID, { limit: 100 }),
    getAIRuns(MOCK_ORG_ID, { limit: 5 }),
    getActiveAIRuns(MOCK_ORG_ID),
  ])
  return { opportunities, recentRuns, activeRuns }
}

export default async function GrowthOverviewPage() {
  const agent = getAgentBySlug('growth')

  let data: Awaited<ReturnType<typeof loadData>> | null = null
  try {
    data = await loadData()
  } catch {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        Failed to load agent data. Please refresh.
      </p>
    )
  }

  const { opportunities, recentRuns, activeRuns } = data
  const totalDiscovered  = opportunities.length
  const totalApproved    = opportunities.filter(o => o.status === 'approved').length
  const totalContacted   = opportunities.filter(o => o.status === 'contacted').length
  const activeRunCount   = activeRuns.length

  return (
    <div className="flex flex-col gap-6">
      {/* Mission */}
      <p className="text-sm text-[var(--text-secondary)] max-w-xl leading-relaxed">
        {agent.mission}
      </p>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard label="Discovered" value={totalDiscovered} sub="opportunities found" />
        <MetricCard label="Approved"   value={totalApproved}   sub="ready for outreach" />
        <MetricCard label="Contacted"  value={totalContacted}  sub="outreach sent" />
        <MetricCard label="Active Runs" value={activeRunCount} sub="running now" />
      </div>

      {/* Quick link to Activity */}
      {activeRunCount > 0 && (
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
          {activeRunCount} pipeline step{activeRunCount !== 1 ? 's' : ''} currently executing.{' '}
          <Link
            href="/agents/growth/activity"
            className="text-[var(--accent)] hover:underline"
          >
            View live activity →
          </Link>
        </div>
      )}

      {/* Recent runs summary */}
      {recentRuns.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
            Recent runs
          </p>
          <div className="flex flex-col gap-2 max-w-xl">
            {recentRuns.map(run => (
              <div
                key={run.id}
                className="flex items-center justify-between py-2 border-b border-[var(--border-color)] last:border-0"
              >
                <span className="text-xs text-[var(--text-secondary)] capitalize">
                  {run.agent_type}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {run.status} · {new Date(run.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
