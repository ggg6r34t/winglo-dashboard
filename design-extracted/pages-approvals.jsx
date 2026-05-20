// Approvals — full queue with side filters + detail row layout.

const APPROVAL_ITEMS = [
  { id: "AP-2241", agent: "marketing", type: "publish",  title: "Q3 launch announcement — multi-channel", sub: "Blog · Email · X thread · LinkedIn — embargo Thu 09:00", urgency: "high", time: "14m" },
  { id: "AP-2240", agent: "growth",    type: "spend",    title: "Outbound campaign — 280 Series A SaaS contacts", sub: "Enrichment + send estimated $84 (above $50 threshold)", urgency: "med",  time: "22m" },
  { id: "AP-2239", agent: "social",    type: "tone",     title: "Reel hook — crisis-response variant A vs. B", sub: "Lyra wants you to pick between empathetic and informational", urgency: "med",  time: "31m" },
  { id: "AP-2238", agent: "sales",     type: "outreach", title: "Personalized re-engagement to 28 cooled trials", sub: "Pre-approved template, but Hale flagged 4 sensitive accounts", urgency: "low",  time: "48m" },
  { id: "AP-2237", agent: "telehealth",type: "policy",   title: "Update overnight triage escalation criteria", sub: "Mira proposes lowering threshold for chest-pain cluster", urgency: "high", time: "1h" },
  { id: "AP-2236", agent: "seo",       type: "publish",  title: "Canonical fix — /docs/api/v2 (11 files)", sub: "Patch is low-risk; needs your sign-off before deploy", urgency: "low",  time: "1h" },
  { id: "AP-2235", agent: "research",  type: "privacy",  title: "Cite Acme investor brief in Q3 strategic memo", sub: "Source is paywalled; Sable wants clearance to quote",      urgency: "med",  time: "2h" },
  { id: "AP-2234", agent: "growth",    type: "outreach", title: "Cold outreach to partner shortlist (12)",      sub: "First contact, founder-direct, ICP-matched",              urgency: "low",  time: "3h" },
  { id: "AP-2233", agent: "marketing", type: "spend",    title: "Refresh paid placements on 6 publications",     sub: "Monthly renewal — $4,200 total, unchanged from May",      urgency: "low",  time: "5h" },
];

const ApprovalsPage = () => {
  const { AGENT_BY_ID } = window.WingloData;
  const [tab, setTab] = React.useState("all");

  const categories = [
    { id: "all",      label: "All",       count: APPROVAL_ITEMS.length },
    { id: "publish",  label: "Publish",   count: APPROVAL_ITEMS.filter(a => a.type === "publish").length },
    { id: "spend",    label: "Spend",     count: APPROVAL_ITEMS.filter(a => a.type === "spend").length },
    { id: "tone",     label: "Tone",      count: APPROVAL_ITEMS.filter(a => a.type === "tone").length },
    { id: "outreach", label: "Outreach",  count: APPROVAL_ITEMS.filter(a => a.type === "outreach").length },
    { id: "policy",   label: "Policy",    count: APPROVAL_ITEMS.filter(a => a.type === "policy").length },
    { id: "privacy",  label: "Privacy",   count: APPROVAL_ITEMS.filter(a => a.type === "privacy").length },
  ];

  const urgencyOrder = { high: 0, med: 1, low: 2 };
  const filtered = APPROVAL_ITEMS
    .filter(a => tab === "all" || a.type === tab)
    .sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

  return (
    <div className="page fade-in">
      <div className="page-head">
        <div className="page-title-block">
          <div className="eyebrow">Approvals · {APPROVAL_ITEMS.length} pending</div>
          <h1 className="page-title">Decisions waiting on you.</h1>
          <div className="page-subtitle">
            Sorted by urgency. Approve, decline, or open the artifact to discuss.
          </div>
        </div>
        <div className="page-head-right">
          <button className="btn"><Icon name="filter" size={13} />Filter</button>
          <button className="btn primary">Approve all low-risk</button>
        </div>
      </div>

      <div className="approvals-grid">
        <aside className="approvals-side">
          <div className="side-title">Type</div>
          {categories.map(c => (
            <div
              key={c.id}
              className={"side-item" + (tab === c.id ? " active" : "")}
              onClick={() => setTab(c.id)}
            >
              <span>{c.label}</span>
              <span className="count">{c.count}</span>
            </div>
          ))}
          <div className="side-title">Urgency</div>
          <div className="side-item"><span>High</span><span className="count">{APPROVAL_ITEMS.filter(a => a.urgency === "high").length}</span></div>
          <div className="side-item"><span>Medium</span><span className="count">{APPROVAL_ITEMS.filter(a => a.urgency === "med").length}</span></div>
          <div className="side-item"><span>Low</span><span className="count">{APPROVAL_ITEMS.filter(a => a.urgency === "low").length}</span></div>
        </aside>

        <div>
          <div className="approval-row-list">
            <div className="approval-row-head">
              <div></div>
              <div>Request</div>
              <div>Type</div>
              <div>Urgency</div>
              <div style={{ textAlign: "right" }}>Waiting</div>
            </div>
            {filtered.map(a => {
              const agent = AGENT_BY_ID[a.agent];
              return (
                <div className="approval-row" key={a.id}>
                  <AgentGlyph agent={agent} size={26} />
                  <div>
                    <div className="approval-row-title">{a.title}</div>
                    <div className="approval-row-sub">
                      <span style={{ color: "var(--fg-0)" }}>{agent.name}</span>
                      <span style={{ color: "var(--fg-3)" }}> · {a.sub}</span>
                    </div>
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {a.type}
                  </div>
                  <div><span className={"urgency " + a.urgency}>{a.urgency}</span></div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-2)", textAlign: "right" }}>
                    {a.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

window.ApprovalsPage = ApprovalsPage;
