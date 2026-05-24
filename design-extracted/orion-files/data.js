// Winglo — AI workforce data
// Operational profiles for AI employees, ops, workflows, activity.

const AGENTS = [
  {
    id: "growth",
    name: "Atlas",
    role: "Head of Growth & Partnerships",
    glyph: "AT",
    tone: { bg: "oklch(0.32 0.05 60)", fg: "oklch(0.95 0.04 60)" },
    status: "work",
    statusLabel: "Sourcing leads",
    runs: 1284,
    lastSeen: "active now",
  },
  {
    id: "social",
    name: "Lyra",
    role: "Social Media Manager",
    glyph: "LY",
    tone: { bg: "oklch(0.30 0.06 320)", fg: "oklch(0.94 0.04 320)" },
    status: "live",
    statusLabel: "Drafting 4 posts",
    runs: 2847,
    lastSeen: "active now",
  },
  {
    id: "seo",
    name: "Vega",
    role: "SEO Manager",
    glyph: "VG",
    tone: { bg: "oklch(0.30 0.06 200)", fg: "oklch(0.93 0.04 200)" },
    status: "work",
    statusLabel: "Audit · 142 pages",
    runs: 612,
    lastSeen: "active now",
  },
  {
    id: "marketing",
    name: "Orion",
    role: "Marketing Manager",
    glyph: "OR",
    tone: { bg: "oklch(0.30 0.06 270)", fg: "oklch(0.93 0.04 270)" },
    status: "wait",
    statusLabel: "Awaiting approval",
    runs: 419,
    lastSeen: "12m ago",
  },
  {
    id: "sales",
    name: "Hale",
    role: "Sales & Customer Success",
    glyph: "HL",
    tone: { bg: "oklch(0.30 0.06 145)", fg: "oklch(0.93 0.04 145)" },
    status: "live",
    statusLabel: "On 3 conversations",
    runs: 1532,
    lastSeen: "active now",
  },
  {
    id: "telehealth",
    name: "Mira",
    role: "Telehealth Manager",
    glyph: "MR",
    tone: { bg: "oklch(0.30 0.06 175)", fg: "oklch(0.93 0.04 175)" },
    status: "work",
    statusLabel: "Triage queue · 8",
    runs: 884,
    lastSeen: "active now",
  },
  {
    id: "analytics",
    name: "Cael",
    role: "Analytics Manager",
    glyph: "CA",
    tone: { bg: "oklch(0.30 0.06 240)", fg: "oklch(0.93 0.04 240)" },
    status: "idle",
    statusLabel: "Standing by",
    runs: 207,
    lastSeen: "4m ago",
  },
  {
    id: "research",
    name: "Sable",
    role: "Research Analyst",
    glyph: "SB",
    tone: { bg: "oklch(0.30 0.06 30)", fg: "oklch(0.94 0.04 30)" },
    status: "work",
    statusLabel: "Synthesizing report",
    runs: 392,
    lastSeen: "active now",
  },
];

const AGENT_BY_ID = Object.fromEntries(AGENTS.map(a => [a.id, a]));

// Currently running operations (shown on overview)
const OPERATIONS = [
  {
    agent: "social",
    task: "Drafting 4 Instagram reels for Q3 product launch — variant A/B/C/D with platform-tuned hooks.",
    progress: 0.68,
    barTone: "accent",
    eta: "ETA 4m",
    ref: "OP-3104",
  },
  {
    agent: "growth",
    task: "Enriching 312 inbound leads from last week's partnership webinar and routing to Hale.",
    progress: 0.42,
    barTone: "info",
    eta: "ETA 11m",
    ref: "OP-3098",
  },
  {
    agent: "seo",
    task: "Crawling sitemap for /docs cluster — surfacing duplicate canonicals and weak internal linking.",
    progress: 0.91,
    barTone: "ok",
    eta: "ETA 1m",
    ref: "OP-3092",
  },
  {
    agent: "research",
    task: "Synthesizing competitor pricing scan into executive brief — 14 sources, 3 segments.",
    progress: 0.55,
    barTone: "violet",
    eta: "ETA 7m",
    ref: "OP-3088",
  },
  {
    agent: "telehealth",
    task: "Triaging overnight patient intake — flagging 2 urgent and routing 6 to scheduled care.",
    progress: 0.78,
    barTone: "accent",
    eta: "ETA 3m",
    ref: "OP-3081",
  },
  {
    agent: "sales",
    task: "Following up with 28 trial accounts cooling on day 11 — personalized re-engagement.",
    progress: 0.34,
    barTone: "info",
    eta: "ETA 18m",
    ref: "OP-3076",
  },
];

// Workflows in flight
const WORKFLOWS = [
  { state: "run", title: "Weekly content publishing — IG / TikTok / LinkedIn", agent: "social", step: "Step 3 of 5 · scheduling", time: "Started 14:02" },
  { state: "run", title: "Partnership outreach — Series A SaaS list", agent: "growth", step: "Step 2 of 4 · enrichment", time: "Started 14:18" },
  { state: "done", title: "Daily SEO regression audit", agent: "seo", step: "Completed in 6m 24s", time: "14:22" },
  { state: "wait", title: "Q3 launch announcement — multi-channel", agent: "marketing", step: "Paused · awaiting your approval", time: "13:51" },
  { state: "run", title: "Patient follow-up sequence — 48h post-visit", agent: "telehealth", step: "Step 4 of 6 · sending", time: "Started 13:40" },
  { state: "done", title: "Pipeline velocity report — week 22", agent: "analytics", step: "Delivered to #leadership", time: "13:12" },
];

// Latest reports
const REPORTS = [
  {
    agent: "research",
    title: "Competitor pricing landscape — H1 shifts",
    excerpt: "Three of seven tracked competitors moved off seat-based pricing in the last 60 days, converging on usage hybrids. Recommended response inside.",
    tags: ["pricing", "competitive", "strategy"],
    time: "23m ago",
  },
  {
    agent: "analytics",
    title: "Weekly pipeline velocity — W22",
    excerpt: "Stage-2 → stage-3 conversion lifted 11.4% week-over-week, primarily from inbound enriched by Atlas. Stage-4 stall persists in the SMB segment.",
    tags: ["pipeline", "weekly"],
    time: "1h ago",
  },
  {
    agent: "social",
    title: "Reel performance — last 14 days",
    excerpt: "Hook-style A (question-led) outperforms B (claim-led) by 2.3× on saves. Recommending shift in next cycle's prompt scaffolding.",
    tags: ["social", "experiment"],
    time: "3h ago",
  },
];

// Right-panel activity stream
const ACTIVITY = [
  { agent: "social", verb: "scheduled", target: "4 reels", detail: "for Friday 09:00 across IG, TikTok", time: "just now", ref: "AC-4910" },
  { agent: "growth", verb: "enriched", target: "312 leads", detail: "from Stripe + Apollo sources", time: "2m ago", ref: "AC-4908" },
  { agent: "seo", verb: "flagged", target: "11 duplicate canonicals", detail: "in /docs/api cluster", time: "4m ago", ref: "AC-4905" },
  { agent: "research", verb: "added memory", target: "Acme pricing change", detail: "linked to 3 ongoing briefs", time: "6m ago", ref: "AC-4901" },
  { agent: "sales", verb: "replied to", target: "Maya Chen", detail: "trial cooldown — meeting offered", time: "8m ago", ref: "AC-4898" },
  { agent: "telehealth", verb: "escalated", target: "2 intake cases", detail: "to on-call physician queue", time: "11m ago", ref: "AC-4894" },
  { agent: "analytics", verb: "delivered", target: "pipeline report W22", detail: "to #leadership channel", time: "14m ago", ref: "AC-4891" },
  { agent: "marketing", verb: "drafted", target: "launch announcement", detail: "3 channel variants, awaiting review", time: "22m ago", ref: "AC-4885" },
];

// Approvals queue
const APPROVALS = [
  {
    agent: "marketing",
    type: "publish",
    title: "Q3 launch announcement — multi-channel",
    detail: "Orion drafted blog, email, social, and PR variants. Embargo set to Thu 09:00.",
  },
  {
    agent: "growth",
    type: "spend",
    title: "Outbound to 280 Series A SaaS contacts",
    detail: "Estimated enrichment + send cost $84. Requires your sign-off above $50.",
  },
  {
    agent: "social",
    type: "tone",
    title: "Reel hook for crisis-response campaign",
    detail: "Lyra is unsure of tone — wants you to choose between empathetic and informational draft.",
  },
];

// Memory / context updates
const MEMORY = [
  {
    key: "ATLAS / customer.icp",
    val: "Refined ICP to exclude sub-15 headcount; matches conversion data from W18–W22.",
    by: "Atlas",
    time: "12m ago",
  },
  {
    key: "LYRA / brand.voice",
    val: "Added rule: avoid em-dashes in long-form social. Confirmed against last 30 published posts.",
    by: "Lyra",
    time: "1h ago",
  },
  {
    key: "SABLE / competitor.acme",
    val: "Acme moved to usage-based pricing on May 9. Source: changelog + investor brief.",
    by: "Sable",
    time: "2h ago",
  },
];

// Orchestration nodes (positions are %)
const ORCH_NODES = [
  { agent: "growth", x: 14, y: 30 },
  { agent: "marketing", x: 38, y: 18 },
  { agent: "social", x: 62, y: 32 },
  { agent: "seo", x: 22, y: 75 },
  { agent: "research", x: 48, y: 62 },
  { agent: "sales", x: 86, y: 50 },
  { agent: "analytics", x: 76, y: 84 },
  { agent: "telehealth", x: 12, y: 92 },
];

const ORCH_EDGES = [
  ["growth", "marketing"],
  ["marketing", "social"],
  ["growth", "sales"],
  ["research", "marketing"],
  ["research", "analytics"],
  ["seo", "research"],
  ["sales", "analytics"],
  ["social", "research"],
];

window.WingloData = {
  AGENTS, AGENT_BY_ID, OPERATIONS, WORKFLOWS, REPORTS, ACTIVITY, APPROVALS, MEMORY,
  ORCH_NODES, ORCH_EDGES,
};
