import { getOpportunities } from '@/server/dal/opportunities'
import { getAIRuns, getActiveAIRuns } from '@/server/dal/ai-runs'
import { MOCK_ORG_ID } from '@/lib/mock'
import Link from 'next/link'

const RUN_STATE: Record<string, string> = {
  running:   'run',
  completed: 'done',
  queued:    'wait',
  failed:    'wait',
}

async function loadData() {
  const [opportunities, recentRuns, activeRuns] = await Promise.all([
    getOpportunities(MOCK_ORG_ID, { limit: 100 }),
    getAIRuns(MOCK_ORG_ID, { limit: 5 }),
    getActiveAIRuns(MOCK_ORG_ID),
  ])
  return { opportunities, recentRuns, activeRuns }
}

export default async function GrowthOverviewPage() {
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
  const totalDiscovered = opportunities.length
  const totalApproved   = opportunities.filter(o => o.status === 'approved').length
  const totalContacted  = opportunities.filter(o => o.status === 'contacted').length
  const activeRunCount  = activeRuns.length

  const tiles = [
    { label: 'Discovered',   value: String(totalDiscovered), unit: '', foot: 'opportunities found', footTone: ''   },
    { label: 'Approved',     value: String(totalApproved),   unit: '', foot: 'ready for outreach',  footTone: totalApproved > 0 ? 'up' : '' },
    { label: 'Contacted',    value: String(totalContacted),  unit: '', foot: 'outreach sent',        footTone: ''   },
    { label: 'Active runs',  value: String(activeRunCount),  unit: '', foot: activeRunCount > 0 ? 'running now' : 'idle', footTone: activeRunCount > 0 ? 'up' : '' },
  ]

  return (
    <div className="fade-in">
      <div className="tile-row">
        {tiles.map(t => (
          <div className="tile" key={t.label}>
            <div className="tile-label">{t.label}</div>
            <div className="tile-value">
              {t.value}<span className="unit">{t.unit}</span>
            </div>
            <div className={"tile-foot " + t.footTone}>{t.foot}</div>
          </div>
        ))}
      </div>

      <div className="section">
        <div className="section-head">
          <div className="section-title">
            Recent activity
            <span className="lbl">Atlas&apos;s stream</span>
          </div>
          {activeRunCount > 0 && (
            <Link href="/agents/growth/activity" className="section-link">
              {activeRunCount} running · View live →
            </Link>
          )}
        </div>
        <div className="workflow-list">
          {recentRuns.length > 0 ? recentRuns.map(run => (
            <div key={run.id} className="wf-row">
              <div className={"wf-state " + (RUN_STATE[run.status] ?? 'done')} />
              <div className="wf-body">
                <div className="wf-title">
                  <span style={{ color: 'var(--fg-2)' }}>{run.status}</span> {run.agent_type}
                </div>
                <div className="wf-meta">
                  <span>{new Date(run.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="wf-right">
                <span>{new Date(run.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          )) : (
            <div className="wf-row">
              <div className="wf-state done" />
              <div className="wf-body">
                <div className="wf-title">
                  <span style={{ color: 'var(--fg-2)' }}>standing by</span> for next task
                </div>
                <div className="wf-meta"><span>—</span></div>
              </div>
              <div className="wf-right"><span>—</span></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
