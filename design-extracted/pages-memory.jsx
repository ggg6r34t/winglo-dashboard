// Memory — knowledge records with provenance, confidence, and per-agent organization.

const MEMORY_RECORDS = [
  { key: "ATLAS / customer.icp",            agent: "growth", val: "Refined ICP to exclude sub-15 headcount; matches conversion data from W18–W22.", source: "Pipeline analysis · 412 deals", conf: 0.94, time: "12m", linkedAgents: ["sales", "marketing"] },
  { key: "LYRA / brand.voice",              agent: "social", val: "Avoid em-dashes in long-form social. Use periods for separation. Confirmed against last 30 published posts.", source: "Style audit · 30 posts", conf: 0.88, time: "1h", linkedAgents: ["marketing"] },
  { key: "SABLE / competitor.acme.pricing", agent: "research", val: "Acme moved to usage-based pricing on May 9, 2026. Tiered: $0–$25k base + $0.04 per call beyond.", source: "Acme changelog + investor brief", conf: 0.97, time: "2h", linkedAgents: ["marketing", "analytics"] },
  { key: "ORION / launch.q3.embargo",       agent: "marketing", val: "Q3 launch embargo: Thursday 09:00 PT. Press list approved by operator. No early reveals.", source: "Operator decision · AP-2241", conf: 1.0, time: "3h", linkedAgents: ["social", "growth"] },
  { key: "VEGA / docs.api.canonical-rule",  agent: "seo", val: "SDK page generator must emit unique canonicals per endpoint. Rule added to crawl regression.", source: "Postmortem · canonical incident May 15", conf: 0.99, time: "5h", linkedAgents: [] },
  { key: "HALE / segment.smb.churn-signals",agent: "sales", val: "SMB accounts that miss week-1 onboarding milestone churn 3.2× more often. Trigger personalized outreach at day 5.", source: "Churn analysis · 184 SMB accounts", conf: 0.86, time: "1d", linkedAgents: ["analytics"] },
  { key: "MIRA / triage.chest-pain.criteria", agent: "telehealth", val: "Updated escalation criteria 4-c. Now triggers when chest pain co-occurs with radiating arm pain OR shortness of breath.", source: "Operator-approved · AP-2237", conf: 1.0, time: "1d", linkedAgents: [] },
  { key: "CAEL / forecast.accuracy.baseline", agent: "analytics", val: "Rolling 8-week forecast accuracy baseline is 92.4% ± 2.1pts. Current week sits at 94.1% — within band.", source: "Self-calibration · weekly", conf: 0.92, time: "2d", linkedAgents: [] },
  { key: "ATLAS / partner.coil.relationship", agent: "growth", val: "Coil is now a paying customer (May 6) AND an active reseller (signed May 14). Treat as both — dual context required.", source: "CRM merge + partner contract", conf: 0.99, time: "2d", linkedAgents: ["sales", "marketing"] },
];

const MemoryPage = () => {
  const { AGENTS, AGENT_BY_ID } = window.WingloData;
  const [filter, setFilter] = React.useState("all");

  const filtered = filter === "all"
    ? MEMORY_RECORDS
    : MEMORY_RECORDS.filter(m => m.agent === filter);

  return (
    <div className="page fade-in">
      <div className="page-head">
        <div className="page-title-block">
          <div className="eyebrow">Memory · 1,284 records · last sync 12s ago</div>
          <h1 className="page-title">What your workforce knows.</h1>
          <div className="page-subtitle">
            Persistent facts each AI employee carries between runs. Edit, retract, or merge.
          </div>
        </div>
        <div className="page-head-right">
          <button className="btn"><Icon name="search" size={13} />Search records</button>
          <button className="btn"><Icon name="filter" size={13} />Filter</button>
          <button className="btn primary"><Icon name="plus" size={13} />Add record</button>
        </div>
      </div>

      <div className="memory-layout">
        <aside className="approvals-side">
          <div className="side-title">By agent</div>
          <div className={"side-item" + (filter === "all" ? " active" : "")} onClick={() => setFilter("all")}>
            <span>All employees</span><span className="count">{MEMORY_RECORDS.length}</span>
          </div>
          {AGENTS.map(a => {
            const c = MEMORY_RECORDS.filter(m => m.agent === a.id).length;
            return (
              <div
                key={a.id}
                className={"side-item" + (filter === a.id ? " active" : "")}
                onClick={() => setFilter(a.id)}
              >
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <AgentGlyph agent={a} size={16} />
                  {a.name}
                </span>
                <span className="count">{c}</span>
              </div>
            );
          })}
          <div className="side-title">Confidence</div>
          <div className="side-item"><span>High (≥0.9)</span><span className="count">{MEMORY_RECORDS.filter(m => m.conf >= 0.9).length}</span></div>
          <div className="side-item"><span>Medium (0.7–0.9)</span><span className="count">{MEMORY_RECORDS.filter(m => m.conf >= 0.7 && m.conf < 0.9).length}</span></div>
          <div className="side-item"><span>Low (&lt;0.7)</span><span className="count">{MEMORY_RECORDS.filter(m => m.conf < 0.7).length}</span></div>
        </aside>

        <div>
          {filtered.map((m, i) => {
            const agent = AGENT_BY_ID[m.agent];
            return (
              <div className="memory-record" key={i}>
                <div className="memory-record-head">
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <AgentGlyph agent={agent} size={20} />
                    <div>
                      <div className="memory-record-key">{m.key}</div>
                      <div style={{ fontSize: 11, color: "var(--fg-3)" }}>{m.source}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div className="confidence" title="Confidence">
                      <div className="conf-bar"><div className="conf-bar-fill" style={{ width: `${m.conf * 100}%` }} /></div>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-2)" }}>{m.conf.toFixed(2)}</span>
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-3)" }}>{m.time} ago</div>
                  </div>
                </div>
                <div className="memory-record-body">{m.val}</div>
                <div className="memory-record-foot">
                  <span>Linked to:</span>
                  {m.linkedAgents.length === 0 ? (
                    <span style={{ color: "var(--fg-4)" }}>none</span>
                  ) : (
                    <span style={{ display: "inline-flex", gap: 6 }}>
                      {m.linkedAgents.map(id => {
                        const a = AGENT_BY_ID[id];
                        return (
                          <span key={id} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <AgentGlyph agent={a} size={14} />
                            <span style={{ color: "var(--fg-1)" }}>{a.name}</span>
                          </span>
                        );
                      })}
                    </span>
                  )}
                  <span style={{ marginLeft: "auto", display: "inline-flex", gap: 12 }}>
                    <span style={{ cursor: "pointer", color: "var(--fg-2)" }}>Edit</span>
                    <span style={{ cursor: "pointer", color: "var(--fg-2)" }}>Retract</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

window.MemoryPage = MemoryPage;
