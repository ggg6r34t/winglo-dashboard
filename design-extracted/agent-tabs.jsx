// Agent hub — tab components: Pipeline, Calendar, Memory, Workflows, Integrations

// =========================================================================
// Pipeline tab — full 4-column kanban with summary strip on top
// =========================================================================
const HubPipelineTab = ({ agent }) => {
  const { AGENT_PIPELINES } = window.AgentOps;
  const pipeline = AGENT_PIPELINES[agent.id];
  if (!pipeline) return null;

  const stageCounts = pipeline.stages.map(s => pipeline.items[s]?.length || 0);
  const total = stageCounts.reduce((a, b) => a + b, 0);

  return (
    <div className="hub-body fade-in">
      <div className="pipe-board-summary">
        <div>
          <div className="pipe-summary-stat">
            <div className="lbl">{pipeline.title}</div>
            <div className="val">{total} {pipeline.itemLabel}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 28 }}>
          {pipeline.stages.map((s, i) => (
            <div className="pipe-summary-stat" key={s}>
              <div className="lbl">{s}</div>
              <div className="val">{stageCounts[i]}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn"><Icon name="filter" size={13} />Filter</button>
          <button className="btn primary"><Icon name="plus" size={13} />Add to pipeline</button>
        </div>
      </div>

      <div className="pipe-board">
        {pipeline.stages.map(stage => (
          <div className="pipe-col" key={stage}>
            <div className="pipe-col-head">
              <div className="pipe-col-title">{stage}</div>
              <div className="pipe-col-count">{pipeline.items[stage]?.length || 0}</div>
            </div>
            {(pipeline.items[stage] || []).map((it, i) => (
              <div className="pipe-card" key={i}>
                <div className="pipe-card-meta">
                  <span className="pipe-tag">{it.tag}</span>
                  {it.time && <span>{it.time}</span>}
                </div>
                <div className="pipe-card-title">{it.title}</div>
                <div className="pipe-card-foot">
                  <span>{it.meta}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// =========================================================================
// Calendar tab — full month grid with day-detail sidebar
// =========================================================================
const HubCalendarTab = ({ agent }) => {
  const { AGENT_CALENDARS } = window.AgentOps;
  const events = AGENT_CALENDARS[agent.id] || {};
  const [selectedDay, setSelectedDay] = React.useState(16);

  // May 2026: 1 May is a Friday (column 5 if Mon=1)
  // We'll display Mon–Sun. May 1 2026 falls on Friday → offset 4.
  const firstDayOffset = 4; // 0=Mon, 4=Fri
  const daysInMonth = 31;
  const totalCells = Math.ceil((firstDayOffset + daysInMonth) / 7) * 7;
  const today = 16;

  const cells = [];
  for (let i = 0; i < totalCells; i++) {
    const day = i - firstDayOffset + 1;
    cells.push(day >= 1 && day <= daysInMonth ? day : null);
  }

  const selectedEvents = events[selectedDay] || [];
  const selectedDateLabel = (() => {
    const d = new Date(2026, 4, selectedDay);
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  })();

  const upcomingDays = Object.keys(events)
    .map(Number)
    .filter(d => d >= selectedDay)
    .sort((a, b) => a - b);

  return (
    <div className="hub-body fade-in">
      <div className="cal-layout">
        <div className="cal-full">
          <div className="cal-full-head">
            <div className="cal-month-nav">
              <button className="icon-btn"><Icon name="chevron" size={14} /></button>
              <div className="cal-month-title">May 2026</div>
              <button className="icon-btn"><Icon name="chevron" size={14} /></button>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="chip active">Month</button>
              <button className="chip">Week</button>
              <button className="chip">Agenda</button>
            </div>
          </div>
          <div className="cal-weekheader">
            {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="cal-full-grid">
            {cells.map((day, i) => {
              if (day === null) return <div className="cal-day outside" key={i}></div>;
              const dayEvents = events[day] || [];
              const visible = dayEvents.slice(0, 3);
              const more = dayEvents.length - visible.length;
              return (
                <div
                  key={i}
                  className={"cal-day" + (day === today ? " today" : "") + (day === selectedDay ? " selected" : "")}
                  onClick={() => setSelectedDay(day)}
                >
                  <div className="cal-day-num">{day}</div>
                  {visible.map((e, j) => (
                    <div className={"cal-event " + e.kind} key={j} title={`${e.time} · ${e.title}`}>
                      {e.title}
                    </div>
                  ))}
                  {more > 0 && <div className="cal-event-more">+{more} more</div>}
                </div>
              );
            })}
          </div>
        </div>

        <aside className="day-detail">
          <div className="day-detail-head">
            <div className="day-detail-date">
              {selectedDay === today ? "Today" : selectedDay > today ? "Upcoming" : "Past"}
            </div>
            <div className="day-detail-title">{selectedDateLabel}</div>
          </div>

          {selectedEvents.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--fg-3)", textAlign: "center", padding: "20px 0" }}>
              Nothing scheduled for {agent.name} on this day.
            </div>
          ) : (
            <div>
              {selectedEvents.map((e, i) => (
                <div className="day-event" key={i}>
                  <div className="day-event-time">{e.time}</div>
                  <div className="day-event-body">
                    <div className="day-event-title">{e.title}</div>
                    <span className="day-event-tag">{e.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--line-1)" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
              Upcoming this week
            </div>
            {upcomingDays.slice(0, 4).map(d => {
              const ev = events[d];
              const date = new Date(2026, 4, d);
              const dow = date.toLocaleDateString("en-US", { weekday: "short" });
              return (
                <div key={d} className="day-event" onClick={() => setSelectedDay(d)} style={{ cursor: "pointer", padding: "8px 0" }}>
                  <div className="day-event-time">{dow} {d}</div>
                  <div className="day-event-body">
                    <div className="day-event-title">{ev[0].title}</div>
                    {ev.length > 1 && <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-3)" }}>+{ev.length - 1} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
};

// =========================================================================
// Memory tab — scoped to this agent
// =========================================================================
// Reads MEMORY_RECORDS from pages-memory.jsx scope. To avoid scope coupling,
// we embed a small per-agent fixture set; if pages-memory globals are exposed,
// we filter from there. We define a per-agent memory bank here for richness.
const AGENT_MEMORY = {
  social: [
    { key: "brand.voice", val: "Avoid em-dashes in long-form social. Use periods for separation. Confirmed against last 30 published posts.", source: "Style audit · 30 posts", conf: 0.88, time: "1h" },
    { key: "hook.A.outperforms-B", val: "Question-led reel hooks outperform claim-led by 2.3× on saves. Apply to all new reel scaffolds.", source: "Experiment · 14d window", conf: 0.92, time: "3h" },
    { key: "platform.IG.optimal-cadence", val: "3 reels + 1 carousel + 1 story per week peaks engagement without saturation. Stable across last 8 weeks.", source: "Internal analytics", conf: 0.86, time: "2d" },
    { key: "audience.savers", val: "Saves correlate 4× more strongly with paid conversion than likes. Optimize hooks for save behavior.", source: "Cross-ref with GA4", conf: 0.91, time: "1w" },
    { key: "moratorium.tone", val: "No celebratory tone during active incident windows. Switch to maintenance voice until status page resolves.", source: "Operator policy", conf: 1.0, time: "2w" },
  ],
  growth: [
    { key: "customer.icp", val: "Refined ICP to exclude sub-15 headcount; matches conversion data from W18–W22.", source: "Pipeline analysis · 412 deals", conf: 0.94, time: "12m" },
    { key: "partner.coil.relationship", val: "Coil is now a paying customer (May 6) AND an active reseller (signed May 14). Treat as both.", source: "CRM merge + contract", conf: 0.99, time: "2d" },
    { key: "enrichment.apollo.daily-quota", val: "Apollo plan caps at 250 enrichments/day; batch outbound to fit window. Burst-mode reserved for operator-approved campaigns.", source: "Provider docs", conf: 1.0, time: "1w" },
    { key: "channel.email.optimal-time", val: "Outbound email reply rate peaks for sends 09:00–10:30 local recipient time. Use timezone-aware scheduling.", source: "Internal experiment", conf: 0.84, time: "2w" },
  ],
  seo: [
    { key: "docs.api.canonical-rule", val: "SDK page generator must emit unique canonicals per endpoint. Rule added to crawl regression.", source: "Postmortem · canonical incident May 15", conf: 0.99, time: "5h" },
    { key: "internal-links.density", val: "Pages with 3–7 contextual internal links rank 1.4 positions higher on average than fewer/more. Use as guidance, not strict rule.", source: "Internal ranking study", conf: 0.81, time: "3w" },
    { key: "schema.required-fields", val: "All product pages require Product + Organization + BreadcrumbList schema. Audit weekly.", source: "Postmortem · Q1 ranking drop", conf: 0.97, time: "2mo" },
  ],
  marketing: [
    { key: "launch.q3.embargo", val: "Q3 launch embargo: Thursday 09:00 PT. Press list approved by operator. No early reveals.", source: "Operator decision · AP-2241", conf: 1.0, time: "3h" },
    { key: "brand.color.usage", val: "Warm amber accent reserved for live/operational states only. Never use as primary CTA color.", source: "Design system v3", conf: 1.0, time: "1mo" },
    { key: "channel.sequencing", val: "For major launches: blog goes first (anchor), then email at +30m, social at +60m, paid at +24h.", source: "Last 4 launches", conf: 0.88, time: "2mo" },
  ],
  sales: [
    { key: "segment.smb.churn-signals", val: "SMB accounts that miss week-1 onboarding milestone churn 3.2× more often. Trigger personalized outreach at day 5.", source: "Churn analysis · 184 SMB accounts", conf: 0.86, time: "1d" },
    { key: "stage-4.stall.threshold", val: "Deals stalled in stage 4 for >21 days require operator review. Auto-flag with weekly digest.", source: "Pipeline analysis", conf: 0.95, time: "1w" },
    { key: "trial.day-11.signal", val: "Trial accounts that cool by day 11 recover at 18% with personalized outreach vs 4% with default sequence.", source: "Re-engagement experiment", conf: 0.83, time: "2w" },
  ],
  telehealth: [
    { key: "triage.chest-pain.criteria", val: "Updated escalation criteria 4-c. Now triggers when chest pain co-occurs with radiating arm pain OR shortness of breath.", source: "Operator-approved · AP-2237", conf: 1.0, time: "1d" },
    { key: "intake.volume.baseline", val: "Average overnight intake is 12 ± 4 cases. Spikes above 2σ should trigger on-call notification.", source: "Rolling 90d", conf: 0.92, time: "1w" },
    { key: "protocol.rx-refill", val: "90-day refill cycles can be auto-approved for stable medications when last labs are <180 days old.", source: "Clinical guideline", conf: 1.0, time: "3mo" },
  ],
  analytics: [
    { key: "forecast.accuracy.baseline", val: "Rolling 8-week forecast accuracy baseline is 92.4% ± 2.1pts. Current week sits at 94.1% — within band.", source: "Self-calibration · weekly", conf: 0.92, time: "2d" },
    { key: "anomaly.σ-threshold", val: "Flag any metric movement >2σ from rolling baseline. Below 1.5σ is noise; between is borderline (log only).", source: "Internal policy", conf: 0.95, time: "1mo" },
    { key: "leadership.digest.cadence", val: "#leadership channel receives daily ops digest at 18:00 and weekly pipeline at Mon 06:00. Never duplicate.", source: "Operator preference", conf: 1.0, time: "2mo" },
  ],
  research: [
    { key: "competitor.acme.pricing", val: "Acme moved to usage-based pricing on May 9, 2026. Tiered: $0–$25k base + $0.04 per call beyond.", source: "Acme changelog + investor brief", conf: 0.97, time: "2h" },
    { key: "source.paywall.policy", val: "Paywalled sources may be cited but never quoted verbatim. Always paraphrase and link to public summary if available.", source: "Operator policy", conf: 1.0, time: "1mo" },
    { key: "synthesis.minimum-sources", val: "No published brief with fewer than 5 independently sourced data points. Single-source claims must be marked as such.", source: "Editorial guideline", conf: 1.0, time: "3mo" },
  ],
};

const HubMemoryTab = ({ agent }) => {
  const records = AGENT_MEMORY[agent.id] || [];
  const tags = ["brand", "policy", "experiment", "guideline", "operator", "pricing", "audience", "process"];

  return (
    <div className="hub-body fade-in">
      <div className="memory-tab-layout">
        <div>
          <div className="hub-section-head">
            <div className="section-title">
              {agent.name}'s memory
              <span className="lbl">{records.length} records · last sync 12s ago</span>
            </div>
            <button className="btn"><Icon name="plus" size={13} />Add record</button>
          </div>
          {records.map((m, i) => (
            <div className="memory-record" key={i}>
              <div className="memory-record-head">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="agent-glyph" style={{ background: agent.tone.bg, color: agent.tone.fg, borderColor: "transparent", width: 20, height: 20, fontSize: 9 }}>
                    {agent.glyph}
                  </div>
                  <div>
                    <div className="memory-record-key">{agent.glyph}/ {m.key}</div>
                    <div style={{ fontSize: 11, color: "var(--fg-3)" }}>{m.source}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div className="confidence">
                    <div className="conf-bar"><div className="conf-bar-fill" style={{ width: `${m.conf * 100}%` }} /></div>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-2)" }}>{m.conf.toFixed(2)}</span>
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-3)" }}>{m.time} ago</div>
                </div>
              </div>
              <div className="memory-record-body">{m.val}</div>
              <div className="memory-record-foot">
                <span style={{ marginLeft: "auto", display: "inline-flex", gap: 12 }}>
                  <span style={{ cursor: "pointer", color: "var(--fg-2)" }}>Edit</span>
                  <span style={{ cursor: "pointer", color: "var(--fg-2)" }}>Retract</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        <aside>
          <div className="memory-side-card" style={{ marginBottom: 14 }}>
            <div className="rp-section-title" style={{ margin: 0, marginBottom: 10 }}>
              <span>Stats</span>
            </div>
            <div className="memory-stat-row"><span className="key">Records</span><span className="val">{records.length}</span></div>
            <div className="memory-stat-row"><span className="key">Avg confidence</span><span className="val">
              {records.length ? (records.reduce((s, r) => s + r.conf, 0) / records.length).toFixed(2) : "—"}
            </span></div>
            <div className="memory-stat-row"><span className="key">High-conf (≥0.9)</span><span className="val">{records.filter(r => r.conf >= 0.9).length}</span></div>
            <div className="memory-stat-row"><span className="key">Operator-set</span><span className="val">{records.filter(r => r.source.toLowerCase().includes("operator")).length}</span></div>
            <div className="memory-stat-row"><span className="key">Last write</span><span className="val">{records[0]?.time || "—"}</span></div>
          </div>

          <div className="memory-side-card" style={{ marginBottom: 14 }}>
            <div className="rp-section-title" style={{ margin: 0, marginBottom: 10 }}>
              <span>Knowledge tags</span>
            </div>
            <div className="knowledge-tags">
              {tags.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          </div>

          <div className="memory-side-card">
            <div className="rp-section-title" style={{ margin: 0, marginBottom: 10 }}>
              <span>Memory health</span>
            </div>
            <div style={{ fontSize: 11.5, color: "var(--fg-2)", lineHeight: 1.55 }}>
              No staleness alerts. All records have fresh provenance. Last conflict resolved 3d ago.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

// =========================================================================
// Workflows tab — per-agent workflow cards
// =========================================================================
const HubWorkflowsTab = ({ agent }) => {
  const { AGENT_WORKFLOWS } = window.AgentOps;
  const workflows = AGENT_WORKFLOWS[agent.id] || [];

  return (
    <div className="hub-body fade-in">
      <div className="tile-row" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <div className="tile">
          <div className="tile-label">Workflows</div>
          <div className="tile-value">{workflows.length}</div>
          <div className="tile-foot">owned by {agent.name}</div>
        </div>
        <div className="tile">
          <div className="tile-label">Running</div>
          <div className="tile-value" style={{ color: "var(--accent)" }}>{workflows.filter(w => w.state === "run").length}</div>
          <div className="tile-foot">in flight</div>
        </div>
        <div className="tile">
          <div className="tile-label">Waiting</div>
          <div className="tile-value" style={{ color: "var(--warn)" }}>{workflows.filter(w => w.state === "wait").length}</div>
          <div className="tile-foot">paused or blocked</div>
        </div>
        <div className="tile">
          <div className="tile-label">Avg success</div>
          <div className="tile-value" style={{ color: "var(--ok)" }}>
            {workflows.length ? (workflows.reduce((s, w) => s + w.success, 0) / workflows.length * 100).toFixed(1) : "—"}
            <span className="unit">%</span>
          </div>
          <div className="tile-foot">across all runs</div>
        </div>
      </div>

      <div className="hub-section-head">
        <div className="section-title">
          {agent.name}'s workflows
          <span className="lbl">composable, observable, rerunnable</span>
        </div>
        <button className="btn primary"><Icon name="plus" size={13} />New workflow</button>
      </div>

      <div className="wf-tab-grid">
        {workflows.map(w => (
          <div className="wf-tab-card" key={w.id}>
            <div className="wf-tab-head">
              <div className="wf-tab-state">
                <span className={"dot " + w.state}></span>
                <span>{w.state === "run" ? "Running" : w.state === "wait" ? "Waiting" : "Healthy"}</span>
              </div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-3)" }}>{w.id.toUpperCase()}</span>
            </div>
            <div className="wf-tab-title">{w.title}</div>
            <div className="wf-tab-stats">
              <div className="wf-tab-stat">
                <div className="lbl">Runs</div>
                <div className="val">{w.runs}</div>
              </div>
              <div className="wf-tab-stat">
                <div className="lbl">Success</div>
                <div className={"val " + (w.success >= 0.99 ? "ok" : w.success < 0.95 ? "warn" : "")}>
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
  );
};

// =========================================================================
// Integrations tab — agent-specific tools
// =========================================================================
const HubIntegrationsTab = ({ agent }) => {
  const { AGENT_INTEGRATIONS } = window.AgentOps;
  const items = AGENT_INTEGRATIONS[agent.id] || [];

  return (
    <div className="hub-body fade-in">
      <div className="tile-row">
        <div className="tile">
          <div className="tile-label">Connected</div>
          <div className="tile-value">{items.length}</div>
          <div className="tile-foot">tools {agent.name} can touch</div>
        </div>
        <div className="tile">
          <div className="tile-label">Healthy</div>
          <div className="tile-value" style={{ color: "var(--ok)" }}>{items.filter(i => i.status === "ok").length}</div>
          <div className="tile-foot">syncing on schedule</div>
        </div>
        <div className="tile">
          <div className="tile-label">Attention</div>
          <div className="tile-value" style={{ color: "var(--warn)" }}>{items.filter(i => i.status === "warn").length}</div>
          <div className="tile-foot">re-auth or stale</div>
        </div>
        <div className="tile">
          <div className="tile-label">Errors</div>
          <div className="tile-value" style={{ color: "var(--bad)" }}>{items.filter(i => i.status === "error").length}</div>
          <div className="tile-foot">action required</div>
        </div>
      </div>

      <div className="hub-section-head">
        <div className="section-title">
          {agent.name}'s integrations
          <span className="lbl">scoped permissions · least-privilege by default</span>
        </div>
        <button className="btn"><Icon name="plus" size={13} />Connect tool</button>
      </div>

      <div className="integ-tab-grid">
        {items.map((it, i) => (
          <div className="integ-card" key={i}>
            <div className="integ-card-head">
              <div className="integ-card-mark" style={{
                background: `color-mix(in oklch, ${it.accent} 18%, var(--bg-2))`,
                color: it.accent,
                borderColor: `color-mix(in oklch, ${it.accent} 30%, var(--line-2))`,
              }}>{it.mark}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="integ-card-name">{it.name}</div>
                <div className="integ-card-cat">{it.scope.split("·")[0].trim()}</div>
              </div>
              <div className={"integ-status " + (it.status === "error" ? "error" : it.status === "warn" ? "warn" : "")}>
                <span className="dot"></span>
                {it.status === "ok" ? "Synced" : it.status === "warn" ? "Attention" : "Error"}
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.5, marginBottom: 12 }}>
              {it.scope}
            </div>
            <div className="integ-card-foot">
              <span>Last sync · {it.lastSync}</span>
              <span style={{ color: "var(--fg-2)", cursor: "pointer" }}>Configure →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// =========================================================================
// AgentHub — composes Hero + Tabs + active tab body
// =========================================================================
const AgentHub = ({ agentId, onBack }) => {
  const { AGENT_BY_ID } = window.WingloData;
  const agent = AGENT_BY_ID[agentId];
  const [tab, setTab] = React.useState("operations");

  // Reset tab when switching agents
  React.useEffect(() => { setTab("operations"); }, [agentId]);

  if (!agent) return null;

  return (
    <div className="fade-in" key={agent.id}>
      <AgentHubHero agent={agent} onBack={onBack} />
      <AgentHubTabs tab={tab} setTab={setTab} agent={agent} />
      {tab === "operations" && <AgentOperationsTab agent={agent} />}
      {tab === "pipeline" && <HubPipelineTab agent={agent} />}
      {tab === "calendar" && <HubCalendarTab agent={agent} />}
      {tab === "memory" && <HubMemoryTab agent={agent} />}
      {tab === "workflows" && <HubWorkflowsTab agent={agent} />}
      {tab === "integrations" && <HubIntegrationsTab agent={agent} />}
    </div>
  );
};

window.AgentHub = AgentHub;
