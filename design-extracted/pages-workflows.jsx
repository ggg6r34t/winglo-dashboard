// Workflows — library list on left, selected workflow graph + runs on right.

const WORKFLOW_LIBRARY = [
  {
    id: "wf-content",
    title: "Weekly content publishing",
    agent: "social",
    state: "run",
    desc: "Generate, review, schedule, publish — IG / TikTok / LinkedIn",
    runs: 142, success: 0.987,
    nodes: [
      { id: "n1", type: "start", label: "Trigger", title: "Mon · 06:00 PT", x: 50,  y: 20 },
      { id: "n2", type: "step",  label: "Agent · Lyra", title: "Generate post candidates", x: 50, y: 38 },
      { id: "n3", type: "gate",  label: "Decision", title: "Tone check", x: 50, y: 56 },
      { id: "n4", type: "step",  label: "Operator", title: "Your approval", x: 25, y: 74 },
      { id: "n5", type: "step",  label: "Agent · Lyra", title: "Schedule across platforms", x: 75, y: 74 },
      { id: "n6", type: "end",   label: "Complete", title: "Publish + notify", x: 50, y: 92 },
    ],
    edges: [
      ["n1","n2"], ["n2","n3"], ["n3","n4"], ["n3","n5"], ["n4","n5"], ["n5","n6"],
    ],
    runs_recent: [
      { id: "rn-118", time: "Today 06:00",   dur: "4m 12s", state: "done" },
      { id: "rn-117", time: "Mon May 12",    dur: "4m 02s", state: "done" },
      { id: "rn-116", time: "Mon May 5",     dur: "5m 24s", state: "done" },
      { id: "rn-115", time: "Mon Apr 28",    dur: "3m 58s", state: "done" },
    ],
  },
  {
    id: "wf-outreach", title: "Partnership outreach — Series A SaaS", agent: "growth", state: "run",
    desc: "Source · enrich · personalize · send · track replies", runs: 84, success: 0.971,
  },
  {
    id: "wf-seo", title: "Daily SEO regression audit", agent: "seo", state: "done",
    desc: "Crawl · diff · flag · patch · summarize", runs: 318, success: 0.994,
  },
  {
    id: "wf-launch", title: "Q3 launch announcement — multi-channel", agent: "marketing", state: "wait",
    desc: "Draft · review · embargo · publish · monitor", runs: 1, success: 1.0,
  },
  {
    id: "wf-followup", title: "Patient follow-up — 48h post-visit", agent: "telehealth", state: "run",
    desc: "Schedule · personalize · send · escalate when needed", runs: 248, success: 0.998,
  },
  {
    id: "wf-velocity", title: "Pipeline velocity report — weekly", agent: "analytics", state: "done",
    desc: "Aggregate · diff · narrative · deliver", runs: 22, success: 1.0,
  },
  {
    id: "wf-research", title: "Competitor pricing scan", agent: "research", state: "run",
    desc: "Crawl sources · extract · cross-check · synthesize · brief", runs: 4, success: 1.0,
  },
];

const WorkflowGraph = ({ wf }) => {
  const ref = React.useRef(null);
  const [size, setSize] = React.useState({ w: 800, h: 480 });
  React.useEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(es => { for (const e of es) setSize({ w: e.contentRect.width, h: e.contentRect.height }); });
    ro.observe(el); return () => ro.disconnect();
  }, []);

  const pos = (id) => {
    const n = wf.nodes.find(n => n.id === id);
    return { x: (n.x / 100) * size.w, y: (n.y / 100) * size.h };
  };

  return (
    <div className="wf-graph" ref={ref}>
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--line-3)" />
          </marker>
        </defs>
        {wf.edges.map(([a, b], i) => {
          const p1 = pos(a), p2 = pos(b);
          const mx = (p1.x + p2.x) / 2;
          return (
            <path
              key={i}
              d={`M ${p1.x} ${p1.y + 16} C ${mx} ${p1.y + 16}, ${mx} ${p2.y - 16}, ${p2.x} ${p2.y - 16}`}
              fill="none"
              stroke="var(--line-2)"
              strokeWidth="1.5"
              markerEnd="url(#arrow)"
            />
          );
        })}
      </svg>
      {wf.nodes.map(n => (
        <div
          key={n.id}
          className={"wf-node " + (n.type === "start" ? "start" : n.type === "end" ? "end" : n.type === "gate" ? "gate" : "")}
          style={{ left: `${n.x}%`, top: `${n.y}%` }}
        >
          <div className="wf-node-label">{n.label}</div>
          <div>{n.title}</div>
        </div>
      ))}
    </div>
  );
};

const WorkflowsPage = () => {
  const { AGENT_BY_ID } = window.WingloData;
  const [activeId, setActiveId] = React.useState("wf-content");
  const wf = WORKFLOW_LIBRARY.find(w => w.id === activeId);
  const agent = AGENT_BY_ID[wf.agent];

  return (
    <div className="page fade-in">
      <div className="page-head">
        <div className="page-title-block">
          <div className="eyebrow">Workflows · 9 active · 23 today</div>
          <h1 className="page-title">How your AI employees operate.</h1>
          <div className="page-subtitle">
            Composable, observable, and rerunnable. Each workflow is a contract between agents.
          </div>
        </div>
        <div className="page-head-right">
          <button className="btn"><Icon name="search" size={13} />Search</button>
          <button className="btn primary"><Icon name="plus" size={13} />New workflow</button>
        </div>
      </div>

      <div className="workflows-layout">
        <div className="wf-list-card">
          {WORKFLOW_LIBRARY.map(w => {
            const a = AGENT_BY_ID[w.agent];
            return (
              <div
                key={w.id}
                className={"wf-list-row" + (w.id === activeId ? " active" : "")}
                onClick={() => setActiveId(w.id)}
              >
                <div className="wf-list-top">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className={"wf-state " + w.state}></div>
                    <div className="wf-list-title">{w.title}</div>
                  </div>
                </div>
                <div className="wf-list-meta">
                  {a.name} · {w.runs} runs · {(w.success * 100).toFixed(1)}% success
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <div style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)", borderRadius: "var(--r-lg)", padding: "16px 18px", marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                  {wf.id.toUpperCase()} · owned by {agent.name}
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 500, letterSpacing: "-0.015em", margin: "2px 0 6px" }}>{wf.title}</h2>
                <div style={{ fontSize: 12.5, color: "var(--fg-2)" }}>{wf.desc}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn">History</button>
                <button className="btn">Edit</button>
                <button className="btn primary">Run now</button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 22, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line-1)" }}>
              <div><div className="kpi-label">Total runs</div><div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--fg-0)" }}>{wf.runs}</div></div>
              <div><div className="kpi-label">Success</div><div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--ok)" }}>{(wf.success * 100).toFixed(1)}%</div></div>
              <div><div className="kpi-label">Avg duration</div><div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--fg-0)" }}>4m 18s</div></div>
              <div><div className="kpi-label">Last run</div><div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--fg-0)" }}>14m ago</div></div>
              <div><div className="kpi-label">Next run</div><div style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--fg-0)" }}>Mon 06:00</div></div>
            </div>
          </div>

          {wf.nodes ? <WorkflowGraph wf={wf} /> : (
            <div className="wf-graph" style={{ display: "grid", placeItems: "center", color: "var(--fg-3)", fontSize: 12 }}>
              Graph view preview — select a workflow with a designed graph
            </div>
          )}

          {wf.runs_recent && (
            <div style={{ marginTop: 14 }}>
              <div className="section-head">
                <div className="section-title">Recent runs<span className="lbl">last 4</span></div>
                <span className="section-link">All runs →</span>
              </div>
              <div className="workflow-list">
                {wf.runs_recent.map(r => (
                  <div className="wf-row" key={r.id}>
                    <div className={"wf-state " + r.state}></div>
                    <div className="wf-body">
                      <div className="wf-title">{wf.title}</div>
                      <div className="wf-meta">
                        <span>{r.id}</span><span className="dot-sep">·</span><span>{r.dur}</span>
                      </div>
                    </div>
                    <div className="wf-right"><span>{r.time}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

window.WorkflowsPage = WorkflowsPage;
