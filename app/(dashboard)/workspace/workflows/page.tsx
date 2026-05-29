import { PageHeader } from '@/components/shared/page-header'
import { getWorkflows } from '@/server/dal/workflows'
import { getCurrentOrgId } from '@/server/auth/org'
import { updateWorkflowAction } from '@/features/workforce/server/actions'

export default async function WorkflowsPage() {
  const orgId = await getCurrentOrgId()
  const workflows = await getWorkflows(orgId)

  return (
    <>
      <PageHeader title="Workflows" subtitle={`${workflows.length} production workflow${workflows.length === 1 ? '' : 's'}`} />

      {workflows.length === 0 ? (
        <div className="tab-empty">No workflows are configured yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12 }}>
          {workflows.map(workflow => (
            <article
              key={workflow.id}
              className="wf-tab-card"
            >
              <div className="wf-tab-head">
                <div className="wf-tab-state">
                  <span className={`dot ${workflow.state}`} />
                  <span>{workflow.state === 'run' ? 'Running' : workflow.state === 'wait' ? 'Waiting' : 'Healthy'}</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)' }}>
                  {workflow.agent_slug}
                </span>
              </div>

              <form action={updateWorkflowAction} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input type="hidden" name="id" value={workflow.id} />
                <input className="input" name="title" defaultValue={workflow.title} />
                <input className="input" name="schedule" defaultValue={workflow.schedule} />
                <textarea className="input" name="description" defaultValue={workflow.description} rows={3} />
                <div className="wf-tab-stats">
                  <div className="wf-tab-stat"><div className="lbl">Runs</div><div className="val">{workflow.runs}</div></div>
                  <div className="wf-tab-stat"><div className="lbl">Success</div><div className="val">{(workflow.success * 100).toFixed(1)}%</div></div>
                  <div className="wf-tab-stat"><div className="lbl">Avg</div><div className="val">{workflow.avg_duration}</div></div>
                </div>
                <button className="btn primary" type="submit">Save changes</button>
              </form>

              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line-1)' }}>
                {workflow.runs_recent.slice(0, 3).map(run => (
                  <div key={run.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--fg-2)', marginBottom: 5 }}>
                    <span>{run.id} / {run.time}</span>
                    <span>{run.state} / {run.dur}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
