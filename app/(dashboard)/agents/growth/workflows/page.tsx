import { getWorkflows } from '@/server/dal/workflows'
import { getCurrentOrgId } from '@/server/auth/org'
import { updateWorkflowAction } from '@/features/workforce/server/actions'

export default async function GrowthWorkflowsPage() {
  const orgId = await getCurrentOrgId()
  const workflows = await getWorkflows(orgId, { agentSlug: 'growth' })

  return (
    <div className="hub-body fade-in">
      <div className="tile-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="tile">
          <div className="tile-label">Workflows</div>
          <div className="tile-value">{workflows.length}</div>
          <div className="tile-foot">owned by Growth</div>
        </div>
        <div className="tile">
          <div className="tile-label">Running</div>
          <div className="tile-value">{workflows.filter(w => w.state === 'run').length}</div>
          <div className="tile-foot">in flight</div>
        </div>
        <div className="tile">
          <div className="tile-label">Avg success</div>
          <div className="tile-value">
            {workflows.length
              ? (workflows.reduce((sum, workflow) => sum + workflow.success, 0) / workflows.length * 100).toFixed(1)
              : '-'}
            <span className="unit">%</span>
          </div>
          <div className="tile-foot">all Growth workflows</div>
        </div>
      </div>

      <div className="wf-tab-grid">
        {workflows.map(workflow => (
          <article className="wf-tab-card" key={workflow.id}>
            <div className="wf-tab-head">
              <div className="wf-tab-state">
                <span className={`dot ${workflow.state}`} />
                <span>{workflow.state === 'run' ? 'Running' : workflow.state === 'wait' ? 'Waiting' : 'Healthy'}</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)' }}>
                {workflow.id.toUpperCase()}
              </span>
            </div>

            <form action={updateWorkflowAction} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input type="hidden" name="id" value={workflow.id} />
              <input className="input" name="title" defaultValue={workflow.title} />
              <input className="input" name="schedule" defaultValue={workflow.schedule} />
              <textarea className="input" name="description" defaultValue={workflow.description} rows={3} />
              <button type="submit" className="btn primary">Save changes</button>
            </form>

            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line-1)' }}>
              {workflow.runs_recent.map(run => (
                <div key={run.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--fg-2)', marginBottom: 5 }}>
                  <span>{run.id} / {run.time}</span>
                  <span>{run.state} / {run.dur}</span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
