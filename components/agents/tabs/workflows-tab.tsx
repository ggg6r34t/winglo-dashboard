import type { AgentConfig } from '@/lib/agents/registry'

type WfState = 'run' | 'done' | 'wait'
type Workflow = { id: string; title: string; state: WfState; runs: number; success: number; schedule: string; lastRun: string }

const WORKFLOWS: Record<string, Workflow[]> = {
  'social-media': [
    { id: 'wf-s1', title: 'Weekly content publishing — IG / TT / LI',   state: 'run',  runs: 142, success: 0.987, schedule: 'Mon · 06:00 PT',  lastRun: '14m ago' },
    { id: 'wf-s2', title: 'Daily engagement triage',                      state: 'run',  runs: 318, success: 0.994, schedule: 'Daily · 09:00',   lastRun: '5h ago'  },
    { id: 'wf-s3', title: 'Trend listening — surface viral hooks',        state: 'run',  runs: 84,  success: 0.962, schedule: 'Hourly',          lastRun: '12m ago' },
    { id: 'wf-s4', title: 'Crisis response · auto-pause queue',           state: 'wait', runs: 4,   success: 1.0,   schedule: 'On-trigger',      lastRun: '31m ago' },
  ],
  growth: [
    { id: 'wf-g1', title: 'Partnership outreach — Series A SaaS list',   state: 'run',  runs: 84,  success: 0.971, schedule: 'Daily · 07:00',   lastRun: '1h ago'  },
    { id: 'wf-g2', title: 'Inbound lead enrichment + routing',            state: 'run',  runs: 412, success: 0.996, schedule: 'On-trigger',      lastRun: '2m ago'  },
    { id: 'wf-g3', title: 'Re-engage cooled trials at day 11',            state: 'run',  runs: 28,  success: 0.928, schedule: 'Daily · 11:00',   lastRun: '3h ago'  },
    { id: 'wf-g4', title: 'ICP scoring · weekly recalibration',           state: 'done', runs: 22,  success: 1.0,   schedule: 'Sun · 22:00',     lastRun: '2d ago'  },
  ],
  seo: [
    { id: 'wf-v1', title: 'Daily regression audit',                       state: 'done', runs: 318, success: 0.994, schedule: 'Daily · 02:00',   lastRun: '12h ago' },
    { id: 'wf-v2', title: 'Canonical fix · proposal + PR',                state: 'run',  runs: 42,  success: 0.952, schedule: 'On-trigger',      lastRun: '1h ago'  },
    { id: 'wf-v3', title: 'Keyword cluster · monthly opportunity scan',   state: 'done', runs: 6,   success: 1.0,   schedule: '1st of month',    lastRun: '16d ago' },
  ],
  marketing: [
    { id: 'wf-o1', title: 'Q3 launch announcement — multi-channel',       state: 'wait', runs: 1,   success: 1.0,   schedule: 'On-trigger',      lastRun: '13:51'   },
    { id: 'wf-o2', title: 'Monthly newsletter · compose + send',          state: 'done', runs: 12,  success: 1.0,   schedule: '1st of month',    lastRun: '16d ago' },
    { id: 'wf-o3', title: 'Brand consistency · cross-channel check',      state: 'done', runs: 22,  success: 0.989, schedule: 'Weekly',          lastRun: '3d ago'  },
  ],
  sales: [
    { id: 'wf-h1', title: 'Inbound demo follow-up · within 4 hours',     state: 'run',  runs: 204, success: 0.984, schedule: 'On-trigger',      lastRun: '12m ago' },
    { id: 'wf-h2', title: 'Cooled trial re-engagement · day 11',         state: 'run',  runs: 28,  success: 0.928, schedule: 'Daily · 11:00',   lastRun: '3h ago'  },
    { id: 'wf-h3', title: 'Stage-4 stall · weekly review prompt',        state: 'done', runs: 22,  success: 1.0,   schedule: 'Mon · 09:00',     lastRun: '1w ago'  },
    { id: 'wf-h4', title: 'Customer health · monthly check-in',          state: 'done', runs: 6,   success: 0.998, schedule: '1st of month',    lastRun: '16d ago' },
  ],
  telehealth: [
    { id: 'wf-m1', title: 'Overnight triage · intake → routing',         state: 'run',  runs: 248, success: 0.998, schedule: 'Daily · 22:00–06:00', lastRun: 'this morning' },
    { id: 'wf-m2', title: '48h post-visit follow-up',                     state: 'run',  runs: 184, success: 0.996, schedule: 'On-trigger',      lastRun: '40m ago' },
    { id: 'wf-m3', title: 'Prescription refill · 90-day cycle',          state: 'run',  runs: 92,  success: 1.0,   schedule: 'On-trigger',      lastRun: '1h ago'  },
    { id: 'wf-m4', title: 'Anomaly detection · intake volume',           state: 'run',  runs: 31,  success: 1.0,   schedule: 'Hourly',          lastRun: '8m ago'  },
  ],
  'analytics-manager': [
    { id: 'wf-c1', title: 'Pipeline velocity report — weekly',           state: 'done', runs: 22,  success: 1.0,   schedule: 'Mon · 06:00',     lastRun: '1d ago'  },
    { id: 'wf-c2', title: 'Real-time anomaly detection',                  state: 'run',  runs: 31,  success: 1.0,   schedule: 'Continuous',      lastRun: 'now'     },
    { id: 'wf-c3', title: 'Daily ops digest · #leadership',              state: 'done', runs: 142, success: 0.998, schedule: 'Daily · 18:00',   lastRun: 'yest.'   },
    { id: 'wf-c4', title: 'Forecast calibration · self-check',           state: 'done', runs: 8,   success: 1.0,   schedule: 'Weekly',          lastRun: '2d ago'  },
  ],
  research: [
    { id: 'wf-r1', title: 'Competitor pricing scan · biweekly',          state: 'run',  runs: 4,   success: 1.0,   schedule: 'Biweekly',        lastRun: '12m ago' },
    { id: 'wf-r2', title: 'Q3 strategic memo · ongoing',                 state: 'run',  runs: 1,   success: 1.0,   schedule: 'On-trigger',      lastRun: '1d ago'  },
    { id: 'wf-r3', title: 'Daily news + signal scan',                    state: 'done', runs: 142, success: 0.987, schedule: 'Daily · 05:00',   lastRun: '11h ago' },
  ],
  outreach: [
    { id: 'wf-e1', title: 'Series A SaaS outreach · daily batch',        state: 'run',  runs: 84,  success: 0.971, schedule: 'Daily · 07:00',   lastRun: '1h ago'  },
    { id: 'wf-e2', title: 'Inbound lead sequence · on-trigger',          state: 'run',  runs: 248, success: 0.988, schedule: 'On-trigger',      lastRun: '4m ago'  },
    { id: 'wf-e3', title: 'Re-engagement · cooled contacts day 11',     state: 'run',  runs: 28,  success: 0.921, schedule: 'Daily · 11:00',   lastRun: '3h ago'  },
    { id: 'wf-e4', title: 'Bounce cleanup · weekly hygiene',             state: 'done', runs: 12,  success: 1.0,   schedule: 'Mon · 08:00',     lastRun: '1w ago'  },
  ],
}

const STATE_LABEL: Record<WfState, string> = { run: 'Running', wait: 'Waiting', done: 'Healthy' }

export function WorkflowsTab({ agent }: { agent: AgentConfig }) {
  const workflows = WORKFLOWS[agent.slug] ?? []
  const running = workflows.filter(w => w.state === 'run').length
  const waiting = workflows.filter(w => w.state === 'wait').length
  const avgSuccess = workflows.length
    ? workflows.reduce((s, w) => s + w.success, 0) / workflows.length * 100
    : 0

  return (
    <div className="hub-body fade-in">
      <div className="tile-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="tile">
          <div className="tile-label">Workflows</div>
          <div className="tile-value">{workflows.length}</div>
          <div className="tile-foot">owned by {agent.name}</div>
        </div>
        <div className="tile">
          <div className="tile-label">Running</div>
          <div className="tile-value" style={{ color: 'var(--accent)' }}>{running}</div>
          <div className="tile-foot">in flight</div>
        </div>
        <div className="tile">
          <div className="tile-label">Waiting</div>
          <div className="tile-value" style={{ color: 'var(--warn)' }}>{waiting}</div>
          <div className="tile-foot">paused or blocked</div>
        </div>
        <div className="tile">
          <div className="tile-label">Avg success</div>
          <div className="tile-value" style={{ color: 'var(--ok)' }}>
            {workflows.length ? avgSuccess.toFixed(1) : '—'}<span className="unit">%</span>
          </div>
          <div className="tile-foot">across all runs</div>
        </div>
      </div>

      <div className="hub-section-head">
        <div className="section-title">
          {agent.name}&apos;s workflows
          <span className="lbl">composable, observable, rerunnable</span>
        </div>
        <button className="btn primary">New workflow</button>
      </div>

      <div className="wf-tab-grid">
        {workflows.map(w => (
          <div className="wf-tab-card" key={w.id}>
            <div className="wf-tab-head">
              <div className="wf-tab-state">
                <span className={`dot ${w.state}`} />
                <span>{STATE_LABEL[w.state]}</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)' }}>
                {w.id.toUpperCase()}
              </span>
            </div>
            <div className="wf-tab-title">{w.title}</div>
            <div className="wf-tab-stats">
              <div className="wf-tab-stat">
                <div className="lbl">Runs</div>
                <div className="val">{w.runs}</div>
              </div>
              <div className="wf-tab-stat">
                <div className="lbl">Success</div>
                <div className={`val ${w.success >= 0.99 ? 'ok' : w.success < 0.95 ? 'warn' : ''}`}>
                  {(w.success * 100).toFixed(1)}%
                </div>
              </div>
              <div className="wf-tab-stat">
                <div className="lbl">Schedule</div>
                <div className="val" style={{ fontSize: 10.5 }}>{w.schedule}</div>
              </div>
            </div>
            <div className="wf-tab-foot">Last run · {w.lastRun}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
