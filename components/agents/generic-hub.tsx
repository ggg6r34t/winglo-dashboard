const TILES = [
  { label: 'Operations today', value: '14', unit: '',  foot: 'running',             footTone: ''   },
  { label: 'Avg time per op',  value: '2.4', unit: 'm', foot: '−18% vs baseline',   footTone: 'up' },
  { label: 'Success rate',     value: '98.2', unit: '%', foot: 'rolling 7d',         footTone: ''   },
  { label: 'Active workflows', value: '4',   unit: '',  foot: '1 paused',            footTone: ''   },
]

const ACTIVITY = [
  { verb: 'completed', target: 'scheduled operation', time: '6m ago',  detail: '4 items processed' },
  { verb: 'updated',   target: 'knowledge base',      time: '22m ago', detail: '3 records merged'   },
  { verb: 'executed',  target: 'workflow run',         time: '1h ago',  detail: 'Success · 2m 14s'   },
  { verb: 'standing by', target: 'for next task',      time: '—',       detail: ''                   },
]

interface GenericHubProps {
  agentName: string
}

export function GenericHub({ agentName }: GenericHubProps) {
  return (
    <div className="hub-body fade-in">
      <div className="tile-row">
        {TILES.map(t => (
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
            <span className="lbl">{agentName}&apos;s stream</span>
          </div>
        </div>
        <div className="workflow-list">
          {ACTIVITY.map((a, i) => (
            <div key={i} className="wf-row">
              <div className="wf-state run" />
              <div className="wf-body">
                <div className="wf-title">
                  <span style={{ color: 'var(--fg-2)' }}>{a.verb}</span> {a.target}
                </div>
                <div className="wf-meta">
                  <span>{a.detail || '—'}</span>
                </div>
              </div>
              <div className="wf-right"><span>{a.time}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
