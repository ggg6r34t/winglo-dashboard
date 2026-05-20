// Reports — library of AI-generated reports, with pinned + categorized sections.

const REPORTS_FULL = [
  {
    id: "R-228", agent: "research", category: "Strategic", pinned: true,
    title: "Competitor pricing landscape — H1 shifts",
    excerpt: "Three of seven tracked competitors moved off seat-based pricing in the last 60 days, converging on usage hybrids. Recommended response inside, including a one-page exec summary suitable for the board.",
    tags: ["pricing", "competitive", "strategy"], time: "23m ago", pages: 18,
  },
  {
    id: "R-227", agent: "analytics", category: "Weekly", pinned: true,
    title: "Pipeline velocity — Week 22",
    excerpt: "Stage-2 → stage-3 conversion lifted 11.4% week-over-week, primarily from inbound enriched by Atlas. Stage-4 stall persists in the SMB segment — 18% of deals sitting 21+ days. Forecast accuracy holding at 94%.",
    tags: ["pipeline", "weekly"], time: "1h ago", pages: 6,
  },
  {
    id: "R-226", agent: "social", category: "Experiment",
    title: "Reel hook performance — last 14 days",
    excerpt: "Hook-style A (question-led) outperforms B (claim-led) by 2.3× on saves and 1.7× on shares. Recommending shift in next cycle's prompt scaffolding and a follow-up test on duration (under 18s vs. 22–30s).",
    tags: ["social", "experiment"], time: "3h ago", pages: 4,
  },
  {
    id: "R-225", agent: "growth", category: "Weekly",
    title: "Partnership pipeline — Week 22",
    excerpt: "32 partners contacted, 11 replied, 4 advanced to discovery. Conversion to discovery is 12.5% vs. 8% baseline, attributed to ICP refinement shipped on May 9.",
    tags: ["partnerships", "weekly"], time: "5h ago", pages: 3,
  },
  {
    id: "R-224", agent: "seo", category: "Daily",
    title: "Daily SEO regression — May 16",
    excerpt: "11 duplicate canonicals in /docs/api/v2, all caused by the SDK page generator. No traffic impact yet. Patch attached; recommend shipping today.",
    tags: ["seo", "daily"], time: "6h ago", pages: 2,
  },
  {
    id: "R-223", agent: "sales", category: "Weekly",
    title: "Customer success digest — Week 22",
    excerpt: "NPS holding at 62 (n=148). Top theme in detractor comments: documentation depth on multi-agent orchestration. Top theme in promoters: time-to-first-value under 20 minutes.",
    tags: ["cs", "weekly"], time: "1d ago", pages: 5,
  },
  {
    id: "R-222", agent: "telehealth", category: "Daily",
    title: "Overnight triage summary — May 15→16",
    excerpt: "8 cases handled, 2 escalated to on-call. Average triage-to-decision time 4.2 minutes, well within the 8-minute target. One protocol revision proposed for chest-pain cluster.",
    tags: ["telehealth", "daily"], time: "1d ago", pages: 2,
  },
  {
    id: "R-221", agent: "marketing", category: "Strategic",
    title: "Launch narrative — Q3 product line",
    excerpt: "Positioning, messaging hierarchy, and channel sequencing for the Q3 launch. Aligned with Sable's competitive read and Lyra's social pacing. Embargo Thu 09:00 PT.",
    tags: ["launch", "narrative"], time: "1d ago", pages: 12,
  },
];

const ReportsPage = () => {
  const { AGENT_BY_ID } = window.WingloData;
  const [filter, setFilter] = React.useState("all");

  const categories = ["Strategic", "Weekly", "Daily", "Experiment"];
  const pinned = REPORTS_FULL.filter(r => r.pinned);
  const rest = REPORTS_FULL.filter(r => !r.pinned);
  const filteredRest = filter === "all" ? rest : rest.filter(r => r.category === filter);

  const renderCard = (r) => {
    const agent = AGENT_BY_ID[r.agent];
    return (
      <div className={"report-full" + (r.pinned ? " pinned" : "")} key={r.id}>
        <div className="report-cat">{r.category} · {r.pages} pages</div>
        <div className="report-full-title">{r.title}</div>
        <div className="report-full-excerpt">{r.excerpt}</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {r.tags.map(t => <span className="tag" key={t}>{t}</span>)}
        </div>
        <div className="report-full-foot">
          <div className="report-author">
            <AgentGlyph agent={agent} size={20} />
            <span style={{ fontSize: 12, color: "var(--fg-0)" }}>{agent.name}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-3)" }}>/ {agent.role}</span>
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-3)" }}>
            {r.id} · {r.time}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page fade-in">
      <div className="page-head">
        <div className="page-title-block">
          <div className="eyebrow">Reports · {REPORTS_FULL.length} this week</div>
          <h1 className="page-title">What your AI analysts are saying.</h1>
          <div className="page-subtitle">
            Synthesized findings from across the workforce. Pinned reports stay at the top until you archive them.
          </div>
        </div>
        <div className="page-head-right">
          <button className="btn"><Icon name="search" size={13} />Search</button>
          <button className="btn"><Icon name="filter" size={13} />Filter</button>
          <button className="btn primary"><Icon name="sparkles" size={13} />Commission report</button>
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div className="section-title">
            Pinned
            <span className="lbl">decisions you're tracking</span>
          </div>
        </div>
        <div className="reports-grid">
          {pinned.map(renderCard)}
        </div>
      </div>

      <div className="section">
        <div className="section-head">
          <div className="section-title">
            All reports
            <span className="lbl">latest from the team</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button className={"chip" + (filter === "all" ? " active" : "")} onClick={() => setFilter("all")}>All</button>
            {categories.map(c => (
              <button
                key={c}
                className={"chip" + (filter === c ? " active" : "")}
                onClick={() => setFilter(c)}
              >
                {c} <span className="count">{REPORTS_FULL.filter(r => r.category === c && !r.pinned).length}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="reports-grid">
          {filteredRest.map(renderCard)}
        </div>
      </div>
    </div>
  );
};

window.ReportsPage = ReportsPage;
