import Link from 'next/link'
import { WorkspaceOperationLauncher } from '@/components/workspace/workspace-operation-launcher'
import { getCurrentOrgId } from '@/server/auth/org'
import { createWorkspaceOverviewService, type WorkspaceOverview } from '@/lib/workforce/workspace-overview'

export default async function WorkspacePage() {
  const orgId = await getCurrentOrgId()
  const overview = await createWorkspaceOverviewService().getOverview(orgId)

  const agentUnit = overview.appEnv === 'production' ? '' : ` / ${overview.agents.length}`
  const tiles = [
    { label: 'AI employees', value: String(overview.counts.deployedAgents), unit: agentUnit, foot: overview.appEnv === 'production' ? 'deployed only' : 'deployed' },
    { label: 'Active runs', value: String(overview.counts.activeRuns), unit: '', foot: overview.counts.activeRuns ? 'running now' : 'idle' },
    { label: 'Pending approvals', value: String(overview.counts.pendingApprovals), unit: '', foot: 'visible to viewers' },
    { label: 'Workflows', value: String(overview.counts.workflows), unit: '', foot: 'configured' },
  ]

  return (
    <div style={{ padding: '22px 28px 60px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: 18, marginBottom: 22, borderBottom: '1px solid var(--line-1)' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            Workforce
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 500, margin: 0, color: 'var(--fg-0)' }}>
            Command center
          </h1>
          <div style={{ marginTop: 4, fontSize: 13, color: 'var(--fg-2)' }}>
            Live production data for deployed agents, approvals, workflows, reports, connector health, and activity.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link className="btn" href="/workspace/audit">Audit</Link>
          <WorkspaceOperationLauncher />
        </div>
      </div>

      <div className="tile-row" style={{ marginBottom: 22 }}>
        {tiles.map(tile => (
          <div className="tile" key={tile.label}>
            <div className="tile-label">{tile.label}</div>
            <div className="tile-value">{tile.value}<span className="unit">{tile.unit}</span></div>
            <div className="tile-foot">{tile.foot}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 22, marginBottom: 22 }}>
        <WorkflowPanel overview={overview} />
        <ApprovalsPanel overview={overview} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, marginBottom: 22 }}>
        <ConnectorHealthPanel overview={overview} />
        <ReportsPanel overview={overview} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 22 }}>
        <ActivityPanel overview={overview} />
      </div>
    </div>
  )
}

function WorkflowPanel({ overview }: { overview: WorkspaceOverview }) {
  return (
    <section>
      <div className="section-head">
        <div className="section-title">Workflows<span className="lbl">production definitions</span></div>
        <Link href="/workspace/workflows" className="section-link">View all</Link>
      </div>
      <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
        <PanelError message={overview.errors.workflows} />
        {overview.workflows.map((workflow, index) => (
          <div key={workflow.id} className="wf-row" style={{ borderBottom: index < overview.workflows.length - 1 ? '1px solid var(--line-1)' : undefined }}>
            <div className={`wf-state ${workflow.state}`} />
            <div className="wf-body">
              <div className="wf-title">{workflow.title}</div>
              <div className="wf-meta"><span>{workflow.agent_slug} / {workflow.schedule}</span></div>
            </div>
            <div className="wf-right"><span>{(workflow.success * 100).toFixed(1)}%</span></div>
          </div>
        ))}
        {overview.workflows.length === 0 && !overview.errors.workflows && <div className="tab-empty">No workflows configured.</div>}
      </div>
    </section>
  )
}

function ApprovalsPanel({ overview }: { overview: WorkspaceOverview }) {
  return (
    <section>
      <div className="section-head">
        <div className="section-title">Approvals<span className="lbl">pending</span></div>
        <Link href="/workspace/approvals" className="section-link">Review</Link>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <PanelError message={overview.errors.approvals} />
        {overview.approvals.map(approval => (
          <div key={approval.id} style={{ background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-lg)', padding: 14 }}>
            <div style={{ fontSize: 13, color: 'var(--fg-0)', fontWeight: 500 }}>{approval.title}</div>
            <div style={{ fontSize: 12, color: 'var(--fg-2)', marginTop: 4 }}>{approval.summary}</div>
          </div>
        ))}
        {overview.approvals.length === 0 && !overview.errors.approvals && <div className="tab-empty">No approvals waiting.</div>}
      </div>
    </section>
  )
}

function ConnectorHealthPanel({ overview }: { overview: WorkspaceOverview }) {
  const health = overview.connectorHealth
  const connectedText = health.total ? `${health.connected}/${health.total} connected` : 'No connector accounts'

  return (
    <section>
      <div className="section-head">
        <div className="section-title">Connector health<span className="lbl">data sources</span></div>
        <Link href="/workspace/integrations" className="section-link">Manage</Link>
      </div>
      <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-lg)', padding: 14 }}>
        <PanelError message={overview.errors.connectors} />
        {!overview.errors.connectors && (
          <>
            <div style={{ fontSize: 20, color: 'var(--fg-0)', fontWeight: 600 }}>{connectedText}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 14 }}>
              <HealthMetric label="Attention" value={health.attention} />
              <HealthMetric label="Errors" value={health.error} />
              <HealthMetric label="Not connected" value={health.notConnected} />
            </div>
          </>
        )}
      </div>
    </section>
  )
}

function ReportsPanel({ overview }: { overview: WorkspaceOverview }) {
  return (
    <section>
      <div className="section-head">
        <div className="section-title">Reports<span className="lbl">latest artifacts</span></div>
        <Link href="/workspace/reports" className="section-link">Archive</Link>
      </div>
      <PanelError message={overview.errors.reports} />
      {overview.reports.map(report => (
        <article key={report.id} style={{ background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-lg)', padding: 14, marginBottom: 10 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)' }}>{report.agent_slug} / {report.category}</div>
          <div style={{ fontSize: 13, color: 'var(--fg-0)', fontWeight: 500, marginTop: 6 }}>{report.title}</div>
          <div style={{ fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.5, marginTop: 4 }}>{report.summary}</div>
        </article>
      ))}
      {overview.reports.length === 0 && !overview.errors.reports && <div className="tab-empty">No reports generated yet.</div>}
    </section>
  )
}

function ActivityPanel({ overview }: { overview: WorkspaceOverview }) {
  return (
    <section>
      <div className="section-head">
        <div className="section-title">Activity<span className="lbl">execution history</span></div>
        <Link href="/workspace/audit" className="section-link">Audit</Link>
      </div>
      <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
        <PanelError message={overview.errors.activity} />
        {overview.activity.map((event, index) => (
          <div key={event.id} className="wf-row" style={{ borderBottom: index < overview.activity.length - 1 ? '1px solid var(--line-1)' : undefined }}>
            <div className={`wf-state ${event.severity === 'error' ? 'wait' : 'done'}`} />
            <div className="wf-body">
              <div className="wf-title">{event.message}</div>
              <div className="wf-meta"><span>{event.agent_slug ?? event.actor_type}</span></div>
            </div>
            <div className="wf-right"><span>{new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
          </div>
        ))}
        {overview.activity.length === 0 && !overview.errors.activity && <div className="tab-empty">No activity recorded.</div>}
      </div>
    </section>
  )
}

function HealthMetric({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ border: '1px solid var(--line-1)', borderRadius: 'var(--r-md)', padding: 10 }}>
      <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{label}</div>
      <div style={{ fontSize: 18, color: 'var(--fg-0)', fontWeight: 600, marginTop: 3 }}>{value}</div>
    </div>
  )
}

function PanelError({ message }: { message?: string }) {
  if (!message) return null

  return (
    <div style={{ background: 'rgba(185, 28, 28, 0.08)', border: '1px solid rgba(185, 28, 28, 0.22)', borderRadius: 'var(--r-md)', padding: 12, margin: 10, color: 'var(--fg-1)', fontSize: 12 }}>
      This panel could not load: {message}
    </div>
  )
}
