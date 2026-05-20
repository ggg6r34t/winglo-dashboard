// Agent hub — operational dashboard for a single AI employee.
// Refactored to route by tab; each tab renders agent-specific data.

const HubHero = ({ agent, onBack }) => (
  <div className="hub-hero">
    <div className="hub-id">
      <div
        className="hub-glyph"
        style={{ background: agent.tone.bg, color: agent.tone.fg, borderColor: "transparent" }}
      >
        {agent.glyph}
      </div>
      <div className="hub-meta">
        <h1 className="hub-name">
          {agent.name}
          <span className={"presence " + agent.status}></span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-2)", fontWeight: 400 }}>
            {agent.statusLabel}
          </span>
        </h1>
        <div className="hub-role">{agent.role}</div>
        <div className="hub-status-row">
          <div className="pair"><span>Runs</span><span className="val">{agent.runs.toLocaleString()}</span></div>
          <div className="pair"><span>Last action</span><span className="val">{agent.lastSeen}</span></div>
          <div className="pair"><span>Model</span><span className="val">claude · sonnet · 4.5</span></div>
          <div className="pair"><span>Memory</span><span className="val">142 records</span></div>
        </div>
      </div>
    </div>
    <div className="page-head-right">
      <button className="btn" onClick={onBack}>← Workforce</button>
      <button className="btn"><Icon name="sparkles" size={13} />Ask {agent.name}</button>
      <button className="btn primary"><Icon name="plus" size={13} />Assign task</button>
    </div>
  </div>
);

const HubTabs = ({ tab, setTab, agent }) => {
  const { AGENT_PIPELINES, AGENT_WORKFLOWS, AGENT_INTEGRATIONS } = window.AgentOps;
  const memoryCount = (window.MEMORY_RECORDS_BY_AGENT?.[agent.id] || 0);
  const pipeline = AGENT_PIPELINES[agent.id];
  const pipelineCount = pipeline ? Object.values(pipeline.items).reduce((s, arr) => s + arr.length, 0) : 0;
  const workflows = AGENT_WORKFLOWS[agent.id] || [];
  const integrations = AGENT_INTEGRATIONS[agent.id] || [];

  const tabs = [
    { id: "operations", label: "Operations" },
    { id: "pipeline", label: "Pipeline", count: pipelineCount },
    { id: "calendar", label: "Calendar" },
    { id: "memory", label: "Memory", count: memoryCount || 142 },
    { id: "workflows", label: "Workflows", count: workflows.length },
    { id: "integrations", label: "Integrations", count: integrations.length },
  ];
  return (
    <div className="hub-tabs">
      {tabs.map(t => (
        <div
          key={t.id}
          className={"hub-tab" + (tab === t.id ? " active" : "")}
          onClick={() => setTab(t.id)}
        >
          {t.label}{t.count != null && <span className="count">{t.count}</span>}
        </div>
      ))}
    </div>
  );
};

// =========================================================================
// Operations tab — KPIs, current operation, recent activity, quick actions
// =========================================================================
const OperationsTab = ({ agent }) => {
  const { ACTIVITY, OPERATIONS, AGENT_BY_ID } = window.WingloData;
  const { AGENT_WORKFLOWS } = window.AgentOps;
  const ownActivity = ACTIVITY.filter(a => a.agent === agent.id);
  const currentOp = OPERATIONS.find(o => o.agent === agent.id);
  const workflows = AGENT_WORKFLOWS[agent.id] || [];

  // Per-agent KPI sets — tuned to the role.
  const kpisByAgent = {
    social: [
      { label: "Posts last 7d", value: "23", foot: "+4 vs prev week", footTone: "up" },
      { label: "Reach", value: "284", unit: "k", foot: "+18.2% wow", footTone: "up" },
      { label: "Engagement", value: "4.7", unit: "%", foot: "above category median", footTone: "up" },
      { label: "Pending approval", value: "3", unit: "drafts", foot: "oldest 12m" },
    ],
    growth: [
      { label: "Leads sourced · 7d", value: "1,284", foot: "+12% wow", footTone: "up" },
      { label: "ICP match rate", value: "62", unit: "%", foot: "+4pts after refinement", footTone: "up" },
      { label: "Reply rate", value: "11.4", unit: "%", foot: "rolling 30d" },
      { label: "Meetings booked · 7d", value: "18", foot: "→ Hale" },
    ],
    seo: [
      { label: "Pages audited · 24h", value: "142", foot: "all routes" },
      { label: "Issues flagged", value: "16", foot: "11 high · 5 med" },
      { label: "Patches shipped · 7d", value: "32", foot: "0 reverts", footTone: "up" },
      { label: "Rank impact", value: "+2.1", unit: "pos", foot: "median across cluster", footTone: "up" },
    ],
    marketing: [
      { label: "Campaigns live", value: "8", foot: "across 4 channels" },
      { label: "Avg open rate", value: "32.4", unit: "%", foot: "+1.2 pts wow", footTone: "up" },
      { label: "Pending approval", value: "2", unit: "drafts", foot: "oldest 14m" },
      { label: "Q3 launch readiness", value: "94", unit: "%", foot: "embargo Thu 09:00" },
    ],
    sales: [
      { label: "Open deals", value: "42", foot: "8 stage-3, 4 stage-4" },
      { label: "Stage conversion", value: "11.4", unit: "%", foot: "+wow", footTone: "up" },
      { label: "Avg time to close", value: "32", unit: "d", foot: "−4d vs Q1", footTone: "up" },
      { label: "Stage-4 stall · SMB", value: "18", unit: "%", foot: "watch", footTone: "down" },
    ],
    telehealth: [
      { label: "Cases handled · 24h", value: "184", foot: "8 escalated" },
      { label: "Avg triage time", value: "4.2", unit: "min", foot: "target 8m", footTone: "up" },
      { label: "Escalation rate", value: "4.3", unit: "%", foot: "stable" },
      { label: "Patient satisfaction", value: "4.8", unit: "/5", foot: "rolling 7d" },
    ],
    analytics: [
      { label: "Reports · 7d", value: "14", foot: "12 auto · 2 ad-hoc" },
      { label: "Forecast accuracy", value: "94.1", unit: "%", foot: "within band", footTone: "up" },
      { label: "Anomalies caught", value: "2", foot: "1 resolved · 1 open" },
      { label: "Avg synthesis time", value: "1.4", unit: "min", foot: "−18% vs baseline", footTone: "up" },
    ],
    research: [
      { label: "Sources scanned · 24h", value: "318", foot: "across 12 feeds" },
      { label: "Briefs in flight", value: "4", foot: "2 drafted" },
      { label: "Citation freshness", value: "92", unit: "%", foot: "sources < 30d old" },
      { label: "Avg brief depth", value: "14", unit: "src", foot: "per published" },
    ],
  };
  const kpis = kpisByAgent[agent.id] || kpisByAgent.social;

  // Quick actions, agent-specific
  const actionsByAgent = {
    social: [
      { title: "Generate post candidates", meta: "→ for review" },
      { title: "Refresh trend listening", meta: "→ surface viral hooks" },
      { title: "Schedule weekly batch", meta: "Mon 09:00" },
      { title: "Pause publishing queue", meta: "crisis-response" },
    ],
    growth: [
      { title: "Source new ICP-matched leads", meta: "→ Apollo enrichment" },
      { title: "Recalibrate ICP scoring", meta: "→ from last 90d" },
      { title: "Send sequence batch", meta: "queued · 142" },
      { title: "Hand off to Hale", meta: "engaged leads · 12" },
    ],
    seo: [
      { title: "Run regression audit now", meta: "≈ 6m" },
      { title: "Propose patch · canonical fix", meta: "PR draft" },
      { title: "Re-crawl /docs/api", meta: "scoped" },
      { title: "Generate keyword brief", meta: "next cluster" },
    ],
    marketing: [
      { title: "Compose campaign · multi-channel", meta: "blog + email + social" },
      { title: "Brand consistency check", meta: "cross-surface" },
      { title: "Publish embargoed package", meta: "Q3 launch · Thu 09:00" },
      { title: "Refresh paid placements", meta: "monthly · $4.2k" },
    ],
    sales: [
      { title: "Follow up cooled trials", meta: "day-11 sequence · 28" },
      { title: "Draft proposal", meta: "Northwind v3" },
      { title: "Book demo", meta: "Maya Chen · Loop" },
      { title: "Review stage-4 stalls", meta: "weekly · 4 deals" },
    ],
    telehealth: [
      { title: "Open triage queue", meta: "8 waiting" },
      { title: "Escalate to on-call", meta: "Dr. Park" },
      { title: "Schedule follow-ups", meta: "48h post-visit" },
      { title: "Run protocol review", meta: "chest-pain cluster" },
    ],
    analytics: [
      { title: "Run weekly velocity report", meta: "auto · Mon 06:00" },
      { title: "Investigate anomaly", meta: "intake 2.4σ" },
      { title: "Recalibrate forecast model", meta: "weekly self-check" },
      { title: "Commission ad-hoc report", meta: "by topic" },
    ],
    research: [
      { title: "Commission new brief", meta: "by topic" },
      { title: "Re-scan competitor set", meta: "biweekly" },
      { title: "Synthesize interview batch", meta: "14 transcripts" },
      { title: "Publish daily signal scan", meta: "→ Slack" },
    ],
  };
  const actions = actionsByAgent[agent.id] || actionsByAgent.social;

  return (
    <div className="hub-body fade-in">
      <div className="tile-row">
        {kpis.map(t => (
          <div className="tile" key={t.label}>
            <div className="tile-label">{t.label}</div>
            <div className="tile-value">{t.value}{t.unit && <span className="unit">{t.unit}</span>}</div>
            <div className={"tile-foot " + (t.footTone || "")}>{t.foot}</div>
          </div>
        ))}
      </div>

      {currentOp && (
        <div className="section">
          <div className="hub-section-head">
            <div className="section-title">
              Now operating
              <span className="lbl">live · {currentOp.ref}</span>
            </div>
            <span className="section-link">View workflow →</span>
          </div>
          <div className="ops-current">
            <div className="ops-current-task">{currentOp.task}</div>
            <div className="op-card-progress">
              <span>progress</span>
              <div className="bar">
                <div className={"bar-fill " + currentOp.barTone} style={{ width: `${Math.round(currentOp.progress * 100)}%` }} />
              </div>
              <span>{Math.round(currentOp.progress * 100)}% · {currentOp.eta}</span>
            </div>
            <div className="ops-progress-detail">
              <div><div className="pd-label">Started</div><div className="pd-val">14:02 PT</div></div>
              <div><div className="pd-label">Tokens used</div><div className="pd-val">128k · in / 4.2k out</div></div>
              <div><div className="pd-label">Memory touched</div><div className="pd-val">8 records</div></div>
              <div><div className="pd-label">Cost</div><div className="pd-val">$0.42</div></div>
            </div>
          </div>
        </div>
      )}

      <div className="ops-layout" style={{ marginTop: 0 }}>
        <div className="section" style={{ marginBottom: 0 }}>
          <div className="hub-section-head">
            <div className="section-title">
              Recent activity
              <span className="lbl">{agent.name}'s stream · last 24h</span>
            </div>
            <span className="section-link">Full audit →</span>
          </div>
          <div className="activity-stream">
            {(ownActivity.length ? ownActivity : [{ verb: "is standing by", target: "for next task", time: agent.lastSeen, detail: "—" }]).map((a, i) => (
              <div key={i} className="activity-item">
                <div className="activity-glyph" style={{ background: agent.tone.bg, color: agent.tone.fg, borderColor: "transparent" }}>
                  {agent.glyph}
                </div>
                <div className="activity-body">
                  <div className="activity-line">
                    <span className="who">{agent.name}</span>{" "}
                    <span className="verb">{a.verb}</span>{" "}
                    <span className="target">{a.target}</span>
                    {a.detail && <span style={{ color: "var(--fg-3)" }}> — {a.detail}</span>}
                  </div>
                  <div className="activity-meta">
                    <span>{a.time}</span>
                    {a.ref && <><span>·</span><span>{a.ref}</span></>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="section" style={{ marginBottom: 22 }}>
            <div className="hub-section-head">
              <div className="section-title">Quick actions</div>
            </div>
            <div className="quick-actions">
              {actions.map((qa, i) => (
                <button className="quick-action" key={i}>
                  <div className="qa-title">{qa.title}</div>
                  <div className="qa-meta">{qa.meta}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="section" style={{ marginBottom: 0 }}>
            <div className="hub-section-head">
              <div className="section-title">Active workflows<span className="lbl">{workflows.filter(w => w.state === "run").length} running</span></div>
            </div>
            <div className="workflow-list">
              {workflows.slice(0, 4).map(w => (
                <div className="wf-row" key={w.id}>
                  <div className={"wf-state " + w.state}></div>
                  <div className="wf-body">
                    <div className="wf-title">{w.title}</div>
                    <div className="wf-meta">
                      <span>{w.runs} runs</span>
                      <span className="dot-sep">·</span>
                      <span>{(w.success * 100).toFixed(1)}% success</span>
                    </div>
                  </div>
                  <div className="wf-right"><span>{w.lastRun}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.AgentHubHero = HubHero;
window.AgentHubTabs = HubTabs;
window.AgentOperationsTab = OperationsTab;
