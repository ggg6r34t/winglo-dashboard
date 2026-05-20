// Per-agent operational data — pipelines, integrations, workflows, calendar events.
// Each agent has its own domain language; this file encodes it.

const ago = (t) => t;

// =========================================================================
// PIPELINES — 4 stages per agent, ~3-4 items per stage. Agent-specific terms.
// =========================================================================
const AGENT_PIPELINES = {
  social: {
    title: "Content pipeline", itemLabel: "posts",
    stages: ["Drafts", "In review", "Scheduled", "Live"],
    items: {
      Drafts: [
        { tag: "IG", title: "Reel — 'How Atlas sources 300 leads/week' (variant A)", meta: "draft", time: "2m" },
        { tag: "IG", title: "Carousel — 5 pricing patterns we tested in 2025", meta: "draft", time: "14m" },
        { tag: "TT", title: "Short — Behind the scenes of an AI workforce", meta: "draft", time: "1h" },
        { tag: "X",  title: "Thread — Lessons from shipping 4 agents in 30 days", meta: "draft", time: "2h" },
      ],
      "In review": [
        { tag: "IG", title: "Reel — 'Why we replaced our SDR team with Atlas'", meta: "your review", time: "8m" },
        { tag: "LI", title: "Post — Long-form Q3 retro from Jordan", meta: "your review", time: "32m" },
        { tag: "TT", title: "Short — 30 seconds with Mira (telehealth)", meta: "revising", time: "1h" },
      ],
      Scheduled: [
        { tag: "IG", title: "Reel — Q3 product launch teaser #1", meta: "Thu · 09:00", time: "" },
        { tag: "IG", title: "Reel — Q3 launch teaser #2 (variant B)", meta: "Thu · 13:00", time: "" },
        { tag: "LI", title: "Post — partnership announcement w/ Coil", meta: "Fri · 10:00", time: "" },
        { tag: "X",  title: "Thread — launch day playbook", meta: "Mon · 09:00", time: "" },
      ],
      Live: [
        { tag: "IG", title: "Reel — 'Welcome to Winglo' (refresh)", meta: "12.4k reach", time: "today" },
        { tag: "TT", title: "Short — meet the team (Mira)", meta: "48.2k views", time: "yest." },
        { tag: "LI", title: "Post — engineering deep-dive", meta: "892 reactions", time: "2d" },
      ],
    },
  },
  growth: {
    title: "Lead pipeline", itemLabel: "leads",
    stages: ["Sourced", "Enriched", "Outreach", "Engaged"],
    items: {
      Sourced: [
        { tag: "API", title: "Series A SaaS list · 280 contacts from Apollo", meta: "raw · needs enrichment", time: "6m" },
        { tag: "WEB", title: "Q3 webinar attendees · 142 sign-ups", meta: "warm", time: "1h" },
        { tag: "REF", title: "Coil partnership intros · 8 contacts", meta: "high-intent", time: "3h" },
      ],
      Enriched: [
        { tag: "🇺🇸", title: "Maya Chen · Loop · VP Eng · 240 employees", meta: "ICP match", time: "12m" },
        { tag: "🇨🇦", title: "Aiden Park · Stride · CTO · 92 employees", meta: "ICP match", time: "18m" },
        { tag: "🇬🇧", title: "Lena Whitford · Mercer · Head of Ops", meta: "verify size", time: "1h" },
        { tag: "🇩🇪", title: "Hans Berger · Klar · Founder · 14 employees", meta: "below ICP", time: "2h" },
      ],
      Outreach: [
        { tag: "EM", title: "Maya Chen · sequence step 2 sent", meta: "opened", time: "2m" },
        { tag: "EM", title: "Aiden Park · sequence step 1 sent", meta: "delivered", time: "32m" },
        { tag: "LI", title: "Lena Whitford · LinkedIn intro request", meta: "queued", time: "1h" },
      ],
      Engaged: [
        { tag: "EM", title: "Maya Chen · replied · wants demo", meta: "→ routed to Hale", time: "12m" },
        { tag: "MTG", title: "Coil · Fri 11:00 PT · partnership exec", meta: "booked", time: "1h" },
        { tag: "EM", title: "Stride · technical questions", meta: "→ Hale draft", time: "3h" },
      ],
    },
  },
  seo: {
    title: "Site pipeline", itemLabel: "pages",
    stages: ["Crawled", "Flagged", "Patched", "Shipped"],
    items: {
      Crawled: [
        { tag: "API", title: "/docs/api/v2/* · 142 endpoint pages", meta: "scan complete", time: "8m" },
        { tag: "BLOG", title: "Blog archive · 218 posts re-indexed", meta: "scan complete", time: "1h" },
        { tag: "PROD", title: "/product/* · 24 marketing pages", meta: "scan complete", time: "2h" },
      ],
      Flagged: [
        { tag: "API", title: "11 duplicate canonicals in /docs/api/v2/*", meta: "high · ranking risk", time: "2m" },
        { tag: "BLOG", title: "4 missing H1s in legacy archive", meta: "med", time: "1h" },
        { tag: "PROD", title: "Pricing page · weak internal linking", meta: "low", time: "2h" },
        { tag: "API", title: "Schema.org missing on 18 endpoint pages", meta: "med", time: "3h" },
      ],
      Patched: [
        { tag: "PR", title: "PR #1284 · canonical fixes · 11 files", meta: "your approval", time: "14m" },
        { tag: "PR", title: "PR #1283 · H1 backfill · 4 posts", meta: "your approval", time: "1h" },
      ],
      Shipped: [
        { tag: "✓",  title: "Internal links audit · 32 pages improved", meta: "merged", time: "yest." },
        { tag: "✓",  title: "Sitemap regeneration · all routes", meta: "merged", time: "2d" },
        { tag: "✓",  title: "Robots.txt · staging exclusion", meta: "merged", time: "3d" },
      ],
    },
  },
  marketing: {
    title: "Campaign pipeline", itemLabel: "campaigns",
    stages: ["Concept", "Draft", "Approval", "Live"],
    items: {
      Concept: [
        { tag: "Q3", title: "Q4 product roadmap teaser", meta: "ideation", time: "1d" },
        { tag: "EVT", title: "Annual customer summit · save the date", meta: "ideation", time: "2d" },
      ],
      Draft: [
        { tag: "LCH", title: "Q3 launch — blog · email · social · PR", meta: "4 variants ready", time: "2h" },
        { tag: "PR", title: "Coil partnership press release", meta: "v3", time: "1d" },
        { tag: "EM", title: "Customer monthly · May edition", meta: "v2", time: "1d" },
      ],
      Approval: [
        { tag: "LCH", title: "Q3 launch announcement · multi-channel", meta: "embargo Thu 09:00", time: "14m" },
        { tag: "AD", title: "Refresh paid placements · 6 publications", meta: "monthly · $4.2k", time: "5h" },
      ],
      Live: [
        { tag: "EM", title: "Customer monthly · April edition", meta: "32% open rate", time: "2w" },
        { tag: "PR", title: "Acme partnership · press release", meta: "12 pickups", time: "3w" },
        { tag: "BLOG", title: "How we built the workforce OS", meta: "8.4k reads", time: "4w" },
      ],
    },
  },
  sales: {
    title: "Conversation pipeline", itemLabel: "deals",
    stages: ["Intro", "Qualified", "Proposal", "Closed"],
    items: {
      Intro: [
        { tag: "$$", title: "Maya Chen · Loop · 240 emp", meta: "demo Fri 11:00", time: "12m" },
        { tag: "$$", title: "Aiden Park · Stride · 92 emp", meta: "first call booked", time: "1h" },
        { tag: "$$", title: "Lena Whitford · Mercer", meta: "needs identifying", time: "2h" },
      ],
      Qualified: [
        { tag: "$$$", title: "Northwind · 1,200 emp · trial active", meta: "stage 2", time: "1d" },
        { tag: "$$$", title: "Coil · 80 emp · partner + customer", meta: "stage 2", time: "1d" },
        { tag: "$$",  title: "Beam · 110 emp · evaluating", meta: "stage 2", time: "2d" },
      ],
      Proposal: [
        { tag: "$$$$", title: "Northwind · annual proposal v2", meta: "stage 3 · 21d open", meta2: "stalled", time: "5d" },
        { tag: "$$$",  title: "Coil · partner + customer bundle", meta: "stage 3", time: "3d" },
      ],
      Closed: [
        { tag: "✓", title: "Plym · annual · $48k ARR", meta: "won", time: "1w" },
        { tag: "✓", title: "Forge · annual · $32k ARR", meta: "won", time: "1w" },
        { tag: "✕", title: "Glint · no decision · churn risk", meta: "lost", time: "2w" },
      ],
    },
  },
  telehealth: {
    title: "Patient pipeline", itemLabel: "cases",
    stages: ["Intake", "Triaged", "Routed", "Resolved"],
    items: {
      Intake: [
        { tag: "🟡", title: "P-1842 · medication reconciliation question", meta: "non-urgent", time: "4m" },
        { tag: "🟡", title: "P-1841 · follow-up symptom check", meta: "non-urgent", time: "12m" },
        { tag: "🟡", title: "P-1840 · new patient intake", meta: "scheduling", time: "22m" },
      ],
      Triaged: [
        { tag: "🟠", title: "P-1839 · post-procedure pain assessment", meta: "matched 2-b", time: "32m" },
        { tag: "🟡", title: "P-1838 · refill request · annual", meta: "matched 1-a", time: "1h" },
        { tag: "🟠", title: "P-1837 · skin lesion · photo attached", meta: "matched 3-c", time: "1h" },
      ],
      Routed: [
        { tag: "Dr", title: "P-1836 → Dr. Reyes · 09:30 today", meta: "scheduled", time: "1h" },
        { tag: "Dr", title: "P-1835 → Dr. Park · async msg", meta: "delivered", time: "2h" },
        { tag: "RN", title: "P-1834 → Nurse triage queue", meta: "queued", time: "3h" },
      ],
      Resolved: [
        { tag: "✓",  title: "P-1832 · chest pain → on-call (cleared)", meta: "in care", time: "5h" },
        { tag: "✓",  title: "P-1831 · medication issue resolved", meta: "closed", time: "6h" },
        { tag: "✓",  title: "P-1830 · annual refill approved", meta: "closed", time: "8h" },
      ],
    },
  },
  analytics: {
    title: "Report pipeline", itemLabel: "reports",
    stages: ["Queued", "Analyzing", "Drafted", "Delivered"],
    items: {
      Queued: [
        { tag: "WK", title: "Weekly pipeline velocity · W23", meta: "auto · Mon 06:00", time: "Mon" },
        { tag: "ADH", title: "ICP conversion deep-dive · ad-hoc", meta: "operator request", time: "" },
      ],
      Analyzing: [
        { tag: "RT", title: "Real-time anomaly · intake volume 2.4σ", meta: "investigating", time: "8m" },
        { tag: "WK", title: "CS digest · NPS movement", meta: "compiling", time: "1h" },
      ],
      Drafted: [
        { tag: "WK", title: "Pipeline velocity · W22 (final draft)", meta: "review", time: "20m" },
      ],
      Delivered: [
        { tag: "✓", title: "Pipeline velocity · W22 · #leadership", meta: "12 readers", time: "14m" },
        { tag: "✓", title: "Forecast calibration · weekly self-check", meta: "auto-archived", time: "2h" },
        { tag: "✓", title: "Daily ops digest · May 15", meta: "auto-archived", time: "yest." },
      ],
    },
  },
  research: {
    title: "Brief pipeline", itemLabel: "briefs",
    stages: ["Sourcing", "Synthesizing", "Drafted", "Published"],
    items: {
      Sourcing: [
        { tag: "📰", title: "Q3 macro brief · pulling 22 sources", meta: "auto", time: "30m" },
        { tag: "📰", title: "AI workforce category · investor reports", meta: "auto", time: "2h" },
      ],
      Synthesizing: [
        { tag: "🧠", title: "Acme + Northwind + Coil pricing convergence", meta: "cross-checking", time: "12m" },
        { tag: "🧠", title: "Customer interview themes · 14 transcripts", meta: "tagging", time: "1h" },
      ],
      Drafted: [
        { tag: "📄", title: "Competitor pricing landscape · H1 shifts", meta: "ready for review", time: "23m" },
        { tag: "📄", title: "Q3 strategic memo · scenarios A/B/C", meta: "internal draft", time: "1d" },
      ],
      Published: [
        { tag: "✓", title: "Q2 retrospective brief · #leadership", meta: "4 referrals", time: "1w" },
        { tag: "✓", title: "Pricing experiment recap · April", meta: "8 readers", time: "2w" },
      ],
    },
  },
};

// =========================================================================
// PER-AGENT INTEGRATIONS — tools each agent is authorized to use.
// =========================================================================
const AGENT_INTEGRATIONS = {
  social: [
    { mark: "IG", name: "Instagram",  scope: "2 accounts · post + read", status: "ok",   accent: "oklch(0.62 0.14 320)", lastSync: "2m" },
    { mark: "TT", name: "TikTok",     scope: "1 account · post + read", status: "ok",   accent: "oklch(0.62 0.005 250)",lastSync: "5m" },
    { mark: "LI", name: "LinkedIn",   scope: "Company + 3 voices",     status: "ok",   accent: "oklch(0.62 0.12 240)", lastSync: "1m" },
    { mark: "X",  name: "X / Twitter",scope: "1 account · synced",     status: "ok",   accent: "oklch(0.62 0.005 250)",lastSync: "4m" },
    { mark: "YT", name: "YouTube",    scope: "Channel · synced",       status: "ok",   accent: "oklch(0.62 0.14 28)",  lastSync: "30m" },
    { mark: "DR", name: "Drive",      scope: "Brand assets",           status: "ok",   accent: "oklch(0.62 0.10 145)", lastSync: "now" },
  ],
  growth: [
    { mark: "AP", name: "Apollo",     scope: "Enrichment · 250 credits/day", status: "ok", accent: "oklch(0.62 0.12 200)", lastSync: "3m" },
    { mark: "HS", name: "HubSpot",    scope: "Read/write · 12k contacts",    status: "ok", accent: "oklch(0.62 0.14 28)",  lastSync: "1m" },
    { mark: "LI", name: "LinkedIn",   scope: "Outreach · founder voice",     status: "ok", accent: "oklch(0.62 0.12 240)", lastSync: "5m" },
    { mark: "GM", name: "Gmail",      scope: "Send · founder mailbox",       status: "ok", accent: "oklch(0.62 0.16 28)",  lastSync: "12s" },
    { mark: "CL", name: "Clearbit",   scope: "Company enrichment",           status: "ok", accent: "oklch(0.62 0.12 145)", lastSync: "8m" },
  ],
  seo: [
    { mark: "GS", name: "Search Console", scope: "Read · all properties", status: "ok",  accent: "oklch(0.62 0.14 60)",  lastSync: "1h" },
    { mark: "GA", name: "GA4",        scope: "Site · 3 properties",       status: "ok",  accent: "oklch(0.62 0.14 60)",  lastSync: "8m" },
    { mark: "AH", name: "Ahrefs",     scope: "Ranking · 8k keywords",     status: "ok",  accent: "oklch(0.62 0.12 200)", lastSync: "30m" },
    { mark: "GH", name: "GitHub",     scope: "Open PRs · docs repo",      status: "ok",  accent: "oklch(0.62 0.005 250)",lastSync: "now" },
    { mark: "CR", name: "Crawler",    scope: "Internal · 24h cycle",      status: "ok",  accent: "oklch(0.62 0.10 145)", lastSync: "8m" },
  ],
  marketing: [
    { mark: "HS", name: "HubSpot",    scope: "Campaigns + email",         status: "ok",   accent: "oklch(0.62 0.14 28)",  lastSync: "1m" },
    { mark: "WP", name: "WordPress",  scope: "Blog · publish + draft",    status: "ok",   accent: "oklch(0.62 0.005 250)",lastSync: "12m" },
    { mark: "FG", name: "Figma",      scope: "Brand kit + creative",      status: "warn", accent: "oklch(0.62 0.16 28)",  lastSync: "2d" },
    { mark: "MA", name: "Meta Ads",   scope: "Read-only · ad spend",      status: "ok",   accent: "oklch(0.62 0.14 240)", lastSync: "1h" },
    { mark: "GA", name: "GA4",        scope: "Attribution · all sites",   status: "ok",   accent: "oklch(0.62 0.14 60)",  lastSync: "8m" },
  ],
  sales: [
    { mark: "HS", name: "HubSpot",    scope: "Deals · pipeline owner",    status: "ok",   accent: "oklch(0.62 0.14 28)",  lastSync: "1m" },
    { mark: "GM", name: "Gmail",      scope: "Send + read · sales@",      status: "ok",   accent: "oklch(0.62 0.16 28)",  lastSync: "12s" },
    { mark: "GG", name: "Google Cal", scope: "Booking · operator + agent",status: "ok",   accent: "oklch(0.62 0.10 145)", lastSync: "now" },
    { mark: "ST", name: "Stripe",     scope: "Read-only · revenue",       status: "ok",   accent: "oklch(0.62 0.12 270)", lastSync: "now" },
    { mark: "GR", name: "Grain",      scope: "Call notes + transcripts",  status: "ok",   accent: "oklch(0.62 0.12 200)", lastSync: "4m" },
    { mark: "ZM", name: "Zoom",       scope: "Read · meeting records",    status: "ok",   accent: "oklch(0.62 0.14 240)", lastSync: "1h" },
  ],
  telehealth: [
    { mark: "EHR",name: "Athena EHR", scope: "Read/write · patient records",status: "ok", accent: "oklch(0.62 0.12 175)", lastSync: "30s" },
    { mark: "RX", name: "Rx Pharmacy",scope: "Refills · 4 partner pharmacies",status: "ok",accent: "oklch(0.62 0.10 145)", lastSync: "1m" },
    { mark: "TX", name: "Twilio",     scope: "SMS · patient comms",       status: "ok",   accent: "oklch(0.62 0.16 28)",  lastSync: "now" },
    { mark: "ZM", name: "Zoom Health",scope: "HIPAA video · scheduled visits",status: "ok",accent: "oklch(0.62 0.14 240)", lastSync: "10m" },
    { mark: "ID", name: "ID.me",      scope: "Identity verification",     status: "ok",   accent: "oklch(0.62 0.12 175)", lastSync: "1h" },
  ],
  analytics: [
    { mark: "SQ", name: "Snowflake",  scope: "Warehouse · read",          status: "ok",   accent: "oklch(0.62 0.12 200)", lastSync: "5m" },
    { mark: "MP", name: "Mixpanel",   scope: "Product events",            status: "ok",   accent: "oklch(0.62 0.12 270)", lastSync: "4m" },
    { mark: "GA", name: "GA4",        scope: "All properties",            status: "ok",   accent: "oklch(0.62 0.14 60)",  lastSync: "8m" },
    { mark: "SE", name: "Segment",    scope: "CDP · 6 sources",           status: "ok",   accent: "oklch(0.62 0.12 145)", lastSync: "now" },
    { mark: "ST", name: "Stripe",     scope: "Revenue · subs",            status: "ok",   accent: "oklch(0.62 0.12 270)", lastSync: "now" },
    { mark: "SL", name: "Slack",      scope: "Post · #leadership",        status: "ok",   accent: "oklch(0.62 0.14 320)", lastSync: "now" },
  ],
  research: [
    { mark: "PX", name: "Perplexity Pro", scope: "Web research",          status: "ok",   accent: "oklch(0.62 0.12 200)", lastSync: "now" },
    { mark: "CR", name: "Crunchbase", scope: "Company + funding data",    status: "ok",   accent: "oklch(0.62 0.12 240)", lastSync: "30m" },
    { mark: "AR", name: "arXiv",      scope: "Research papers",           status: "ok",   accent: "oklch(0.62 0.10 30)",  lastSync: "1h" },
    { mark: "NT", name: "Notion",     scope: "Workspace · publish briefs",status: "ok",   accent: "oklch(0.62 0.005 250)",lastSync: "30s" },
    { mark: "DR", name: "Drive",      scope: "Source archive",            status: "ok",   accent: "oklch(0.62 0.10 145)", lastSync: "now" },
  ],
};

// =========================================================================
// PER-AGENT WORKFLOWS
// =========================================================================
const AGENT_WORKFLOWS = {
  social: [
    { id: "wf-s1", title: "Weekly content publishing — IG / TT / LI",     state: "run", runs: 142, success: 0.987, schedule: "Mon · 06:00 PT", lastRun: "14m ago" },
    { id: "wf-s2", title: "Daily engagement triage",                       state: "run", runs: 318, success: 0.994, schedule: "Daily · 09:00", lastRun: "5h ago" },
    { id: "wf-s3", title: "Trend listening — surface viral hooks",         state: "run", runs: 84,  success: 0.962, schedule: "Hourly",        lastRun: "12m ago" },
    { id: "wf-s4", title: "Crisis response · auto-pause queue",            state: "wait",runs: 4,   success: 1.0,   schedule: "On-trigger",    lastRun: "31m ago" },
  ],
  growth: [
    { id: "wf-g1", title: "Partnership outreach — Series A SaaS list",     state: "run", runs: 84,  success: 0.971, schedule: "Daily · 07:00", lastRun: "1h ago" },
    { id: "wf-g2", title: "Inbound lead enrichment + routing",             state: "run", runs: 412, success: 0.996, schedule: "On-trigger",    lastRun: "2m ago" },
    { id: "wf-g3", title: "Re-engage cooled trials at day 11",             state: "run", runs: 28,  success: 0.928, schedule: "Daily · 11:00", lastRun: "3h ago" },
    { id: "wf-g4", title: "ICP scoring · weekly recalibration",            state: "done",runs: 22,  success: 1.0,   schedule: "Sun · 22:00",   lastRun: "2d ago" },
  ],
  seo: [
    { id: "wf-v1", title: "Daily regression audit",                        state: "done",runs: 318, success: 0.994, schedule: "Daily · 02:00", lastRun: "12h ago" },
    { id: "wf-v2", title: "Canonical fix · proposal + PR",                 state: "run", runs: 42,  success: 0.952, schedule: "On-trigger",    lastRun: "1h ago" },
    { id: "wf-v3", title: "Keyword cluster · monthly opportunity scan",    state: "done",runs: 6,   success: 1.0,   schedule: "1st of month",  lastRun: "16d ago" },
  ],
  marketing: [
    { id: "wf-o1", title: "Q3 launch announcement — multi-channel",        state: "wait",runs: 1,   success: 1.0,   schedule: "On-trigger",    lastRun: "13:51" },
    { id: "wf-o2", title: "Monthly newsletter · compose + send",           state: "done",runs: 12,  success: 1.0,   schedule: "1st of month",  lastRun: "16d ago" },
    { id: "wf-o3", title: "Brand consistency · cross-channel check",       state: "done",runs: 22,  success: 0.989, schedule: "Weekly",        lastRun: "3d ago" },
  ],
  sales: [
    { id: "wf-h1", title: "Inbound demo follow-up · within 4 hours",       state: "run", runs: 204, success: 0.984, schedule: "On-trigger",    lastRun: "12m ago" },
    { id: "wf-h2", title: "Cooled trial re-engagement · day 11",           state: "run", runs: 28,  success: 0.928, schedule: "Daily · 11:00", lastRun: "3h ago" },
    { id: "wf-h3", title: "Stage-4 stall · weekly review prompt",          state: "done",runs: 22,  success: 1.0,   schedule: "Mon · 09:00",   lastRun: "1w ago" },
    { id: "wf-h4", title: "Customer health · monthly check-in",            state: "done",runs: 6,   success: 0.998, schedule: "1st of month",  lastRun: "16d ago" },
  ],
  telehealth: [
    { id: "wf-m1", title: "Overnight triage · intake → routing",           state: "run", runs: 248, success: 0.998, schedule: "Daily · 22:00–06:00", lastRun: "this morning" },
    { id: "wf-m2", title: "48h post-visit follow-up",                      state: "run", runs: 184, success: 0.996, schedule: "On-trigger",    lastRun: "40m ago" },
    { id: "wf-m3", title: "Prescription refill · 90-day cycle",            state: "run", runs: 92,  success: 1.0,   schedule: "On-trigger",    lastRun: "1h ago" },
    { id: "wf-m4", title: "Anomaly detection · intake volume",             state: "run", runs: 31,  success: 1.0,   schedule: "Hourly",        lastRun: "8m ago" },
  ],
  analytics: [
    { id: "wf-c1", title: "Pipeline velocity report — weekly",             state: "done",runs: 22,  success: 1.0,   schedule: "Mon · 06:00",   lastRun: "1d ago" },
    { id: "wf-c2", title: "Real-time anomaly detection",                   state: "run", runs: 31,  success: 1.0,   schedule: "Continuous",    lastRun: "now" },
    { id: "wf-c3", title: "Daily ops digest · #leadership",                state: "done",runs: 142, success: 0.998, schedule: "Daily · 18:00", lastRun: "yest." },
    { id: "wf-c4", title: "Forecast calibration · self-check",             state: "done",runs: 8,   success: 1.0,   schedule: "Weekly",        lastRun: "2d ago" },
  ],
  research: [
    { id: "wf-r1", title: "Competitor pricing scan · biweekly",            state: "run", runs: 4,   success: 1.0,   schedule: "Biweekly",      lastRun: "12m ago" },
    { id: "wf-r2", title: "Q3 strategic memo · ongoing",                   state: "run", runs: 1,   success: 1.0,   schedule: "On-trigger",    lastRun: "1d ago" },
    { id: "wf-r3", title: "Daily news + signal scan",                      state: "done",runs: 142, success: 0.987, schedule: "Daily · 05:00", lastRun: "11h ago" },
  ],
};

// =========================================================================
// PER-AGENT CALENDAR EVENTS — for the current month (May 2026).
// Day index → list of events. Today is May 16.
// =========================================================================
const AGENT_CALENDARS = {
  social: {
    16: [{ time: "09:00", title: "IG reel — Welcome to Winglo (refresh)", kind: "post", tag: "IG" },
         { time: "13:00", title: "TT short — meet the team", kind: "post", tag: "TT" },
         { time: "16:30", title: "LI post — engineering deep-dive", kind: "post", tag: "LI" }],
    17: [{ time: "10:00", title: "IG reel — Q3 teaser planning", kind: "draft", tag: "IG" }],
    18: [{ time: "09:00", title: "IG reel — Q3 teaser #1", kind: "scheduled", tag: "IG" },
         { time: "11:00", title: "LI post — partnership w/ Coil", kind: "scheduled", tag: "LI" }],
    19: [{ time: "09:00", title: "X thread — launch day playbook", kind: "scheduled", tag: "X" }],
    20: [{ time: "13:00", title: "IG reel — Q3 teaser #2 (variant B)", kind: "scheduled", tag: "IG" }],
    22: [{ time: "09:00", title: "Weekly content review", kind: "ops", tag: "OPS" }],
  },
  growth: {
    16: [{ time: "07:00", title: "Outbound batch · 280 contacts", kind: "ops", tag: "OUT" },
         { time: "11:00", title: "Maya Chen · demo follow-up", kind: "task", tag: "EM" }],
    17: [{ time: "11:00", title: "Coil · partnership exec call", kind: "meeting", tag: "MTG" }],
    18: [{ time: "07:00", title: "Outbound batch · post-launch", kind: "ops", tag: "OUT" }],
    20: [{ time: "10:00", title: "Stride · technical Q&A response", kind: "task", tag: "EM" }],
    22: [{ time: "09:00", title: "Weekly ICP recalibration", kind: "ops", tag: "OPS" }],
  },
  seo: {
    16: [{ time: "02:00", title: "Daily regression audit", kind: "ops", tag: "CRW" },
         { time: "14:00", title: "PR #1284 · canonical fixes", kind: "task", tag: "PR" }],
    17: [{ time: "02:00", title: "Daily regression audit", kind: "ops", tag: "CRW" }],
    18: [{ time: "02:00", title: "Daily regression audit", kind: "ops", tag: "CRW" }],
    19: [{ time: "02:00", title: "Daily regression audit", kind: "ops", tag: "CRW" }],
    20: [{ time: "02:00", title: "Daily regression audit", kind: "ops", tag: "CRW" }],
  },
  marketing: {
    18: [{ time: "09:00", title: "Q3 launch — embargo lifts", kind: "launch", tag: "LCH" }],
    16: [{ time: "14:00", title: "Q3 launch approval review", kind: "task", tag: "APR" }],
    17: [{ time: "10:00", title: "PR press list final-check", kind: "task", tag: "PR" }],
    20: [{ time: "10:00", title: "Coil partnership press release", kind: "task", tag: "PR" }],
    22: [{ time: "16:00", title: "Brand consistency review", kind: "ops", tag: "BR" }],
  },
  sales: {
    16: [{ time: "10:00", title: "Stage-4 stall review · weekly", kind: "ops", tag: "OPS" }],
    17: [{ time: "14:00", title: "Northwind · proposal v3 send", kind: "task", tag: "$$" }],
    19: [{ time: "11:00", title: "Maya Chen · demo", kind: "meeting", tag: "$$" }],
    20: [{ time: "15:00", title: "Coil · partnership close", kind: "meeting", tag: "$$$" }],
    22: [{ time: "09:00", title: "Pipeline review · weekly", kind: "ops", tag: "OPS" }],
  },
  telehealth: {
    16: [{ time: "06:00", title: "Overnight triage handoff", kind: "ops", tag: "TRI" },
         { time: "09:30", title: "P-1836 → Dr. Reyes", kind: "task", tag: "Dr" }],
    17: [{ time: "22:00", title: "Overnight triage shift", kind: "ops", tag: "TRI" }],
    18: [{ time: "22:00", title: "Overnight triage shift", kind: "ops", tag: "TRI" }],
    19: [{ time: "10:00", title: "Protocol review · chest-pain cluster", kind: "ops", tag: "POL" }],
  },
  analytics: {
    16: [{ time: "13:12", title: "Pipeline velocity · W22 delivered", kind: "task", tag: "RPT" }],
    18: [{ time: "06:00", title: "Pipeline velocity · W23 auto-run", kind: "ops", tag: "WK" }],
    19: [{ time: "18:00", title: "Daily ops digest · #leadership", kind: "ops", tag: "RPT" }],
    20: [{ time: "10:00", title: "ICP conversion deep-dive · ad-hoc", kind: "task", tag: "ADH" }],
  },
  research: {
    16: [{ time: "05:00", title: "Daily news + signal scan", kind: "ops", tag: "SCN" },
         { time: "13:18", title: "Competitor pricing brief · drafted", kind: "task", tag: "BR" }],
    17: [{ time: "10:00", title: "Q3 strategic memo · v2 review", kind: "task", tag: "MEM" }],
    19: [{ time: "10:00", title: "Customer interview synthesis · 14 transcripts", kind: "ops", tag: "SYN" }],
    22: [{ time: "10:00", title: "Biweekly competitor scan", kind: "ops", tag: "SCN" }],
  },
};

window.AgentOps = { AGENT_PIPELINES, AGENT_INTEGRATIONS, AGENT_WORKFLOWS, AGENT_CALENDARS };
