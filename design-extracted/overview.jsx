// Workforce overview — main page when no agent hub is selected.

const Sparkline = ({ points, color = "var(--fg-2)", w = 60, h = 22 }) => {
  const max = Math.max(...points), min = Math.min(...points);
  const range = max - min || 1;
  const d = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / range) * (h - 2) - 1;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg className="kpi-spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={d} fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    </svg>
  );
};

const Kpis = () => {
  const data = [
    { label: "Active AI employees", value: "6", unit: "/ 8", delta: "+1 since 9am", spark: [3,4,4,5,5,6,5,6,6,6], tone: "" },
    { label: "Operations / hr", value: "184", unit: "ops", delta: "+12.4% vs yesterday", spark: [110,124,138,142,151,160,165,170,176,184], tone: "up" },
    { label: "Pending approvals", value: "3", unit: "queued", delta: "Oldest 14m", spark: [4,5,3,4,5,4,3,2,3,3], tone: "" },
    { label: "Anomalies (24h)", value: "2", unit: "flagged", delta: "1 resolved · 1 open", spark: [1,2,2,3,2,3,2,4,3,2], tone: "down" },
  ];
  return (
    <div className="kpi-strip">
      {data.map(k => (
        <div className="kpi" key={k.label}>
          <div className="kpi-label">{k.label}</div>
          <div className="kpi-value">
            {k.value}<span className="unit">{k.unit}</span>
          </div>
          <div className={"kpi-delta " + k.tone}>{k.delta}</div>
          <Sparkline points={k.spark} />
        </div>
      ))}
    </div>
  );
};

const OperationCard = ({ op, onOpenAgent }) => {
  const { AGENT_BY_ID } = window.WingloData;
  const agent = AGENT_BY_ID[op.agent];
  return (
    <div className="op-card" onClick={() => onOpenAgent(agent.id)}>
      <div className="op-card-head">
        <AgentGlyph agent={agent} size={22} />
        <div className="agent-info">
          <div className="agent-name">{agent.name}</div>
          <div className="agent-role">{agent.role}</div>
        </div>
        <div className={"presence " + agent.status} style={{ marginLeft: "auto" }} />
      </div>
      <div className="op-card-task">{op.task}</div>
      <div className="op-card-progress">
        <span>{op.ref}</span>
        <div className="bar">
          <div className={"bar-fill " + op.barTone} style={{ width: `${Math.round(op.progress * 100)}%` }} />
        </div>
        <span>{op.eta}</span>
      </div>
    </div>
  );
};

const NowOperating = ({ onOpenAgent }) => {
  const { OPERATIONS } = window.WingloData;
  return (
    <div className="section">
      <div className="section-head">
        <div className="section-title">
          Now operating
          <span className="lbl">live · {OPERATIONS.length} agents in flight</span>
        </div>
        <span className="section-link">View all ops →</span>
      </div>
      <div className="ops-grid">
        {OPERATIONS.map(op => (
          <OperationCard key={op.ref} op={op} onOpenAgent={onOpenAgent} />
        ))}
      </div>
    </div>
  );
};

const Workflows = ({ onOpenAgent }) => {
  const { WORKFLOWS, AGENT_BY_ID } = window.WingloData;
  return (
    <div>
      <div className="section-head">
        <div className="section-title">
          Workflows
          <span className="lbl">9 active · 23 today</span>
        </div>
        <span className="section-link">Compose →</span>
      </div>
      <div className="workflow-list">
        {WORKFLOWS.map((w, i) => {
          const a = AGENT_BY_ID[w.agent];
          return (
            <div key={i} className="wf-row" onClick={() => onOpenAgent(a.id)}>
              <div className={"wf-state " + w.state}></div>
              <div className="wf-body">
                <div className="wf-title">{w.title}</div>
                <div className="wf-meta">
                  <span>{a.name}</span>
                  <span className="dot-sep">·</span>
                  <span>{w.step}</span>
                </div>
              </div>
              <div className="wf-right">
                <span>{w.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Reports = ({ onOpenAgent }) => {
  const { REPORTS, AGENT_BY_ID } = window.WingloData;
  return (
    <div>
      <div className="section-head">
        <div className="section-title">
          Reports
          <span className="lbl">latest from your analysts</span>
        </div>
        <span className="section-link">Archive →</span>
      </div>
      {REPORTS.map((r, i) => {
        const a = AGENT_BY_ID[r.agent];
        return (
          <div key={i} className="report-card" onClick={() => onOpenAgent(a.id)}>
            <div className="report-head">
              <div className="report-author">
                <AgentGlyph agent={a} size={18} />
                <span>{a.name}</span>
                <span style={{ color: "var(--fg-3)" }}>/ {a.role}</span>
              </div>
              <div className="report-time">{r.time}</div>
            </div>
            <div className="report-title">{r.title}</div>
            <div className="report-excerpt">{r.excerpt}</div>
            <div className="report-foot">
              {r.tags.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Orchestration graph — nodes positioned by % coords, edges drawn in SVG.
const Orchestration = ({ onOpenAgent }) => {
  const { ORCH_NODES, ORCH_EDGES, AGENT_BY_ID } = window.WingloData;
  const canvasRef = React.useRef(null);
  const [size, setSize] = React.useState({ w: 800, h: 220 });

  React.useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        setSize({ w: e.contentRect.width, h: e.contentRect.height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const nodePos = (id) => {
    const n = ORCH_NODES.find(n => n.agent === id);
    return { x: (n.x / 100) * size.w, y: (n.y / 100) * size.h };
  };

  return (
    <div className="orch">
      <div className="orch-head">
        <div className="section-title">
          Orchestration
          <span className="lbl">live collaboration graph · last 60s</span>
        </div>
        <span className="section-link">Open graph →</span>
      </div>
      <div className="orch-canvas" ref={canvasRef}>
        <svg className="orch-svg" width={size.w} height={size.h}>
          <defs>
            <linearGradient id="edge" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="oklch(0.35 0.01 250)" />
              <stop offset="100%" stopColor="oklch(0.55 0.04 75)" />
            </linearGradient>
          </defs>
          {ORCH_EDGES.map(([a, b], i) => {
            const p1 = nodePos(a), p2 = nodePos(b);
            const cx = (p1.x + p2.x) / 2;
            const cy = (p1.y + p2.y) / 2 - 18;
            return (
              <path
                key={i}
                d={`M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`}
                stroke="url(#edge)"
                strokeWidth="1"
                fill="none"
                opacity="0.55"
              />
            );
          })}
          {/* animated flow dots */}
          {ORCH_EDGES.slice(0, 4).map(([a, b], i) => {
            const p1 = nodePos(a), p2 = nodePos(b);
            const cx = (p1.x + p2.x) / 2;
            const cy = (p1.y + p2.y) / 2 - 18;
            return (
              <circle key={`d${i}`} r="2" fill="oklch(0.80 0.12 75)">
                <animateMotion dur={`${4 + i}s`} repeatCount="indefinite"
                  path={`M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`}
                  begin={`-${i * 0.7}s`} />
              </circle>
            );
          })}
        </svg>
        {ORCH_NODES.map(n => {
          const a = AGENT_BY_ID[n.agent];
          return (
            <div
              key={n.agent}
              className="orch-node"
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
              onClick={() => onOpenAgent(a.id)}
            >
              <AgentGlyph agent={a} size={18} />
              <span className="agent-name">{a.name}</span>
              <span className={"presence " + a.status} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Overview = ({ onOpenAgent }) => {
  return (
    <div className="page fade-in">
      <div className="page-head">
        <div className="page-title-block">
          <div className="eyebrow">Workforce · Tuesday, May 16</div>
          <h1 className="page-title">Good afternoon, Jordan.</h1>
          <div className="page-subtitle">
            6 of 8 AI employees are operating. 9 workflows in flight. 3 approvals queued.
          </div>
        </div>
        <div className="page-head-right">
          <button className="btn"><Icon name="filter" size={13} />Filter</button>
          <button className="btn"><Icon name="sparkles" size={13} />Briefing</button>
          <button className="btn primary"><Icon name="plus" size={13} />New operation</button>
        </div>
      </div>

      <Kpis />
      <NowOperating onOpenAgent={onOpenAgent} />

      <div className="split">
        <Workflows onOpenAgent={onOpenAgent} />
        <Reports onOpenAgent={onOpenAgent} />
      </div>

      <Orchestration onOpenAgent={onOpenAgent} />
    </div>
  );
};

window.Overview = Overview;
