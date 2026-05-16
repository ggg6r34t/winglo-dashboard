import { OrchGraph } from "@/components/workspace/orch-graph";
import { getActiveAIRuns } from "@/server/dal/ai-runs";
import { MOCK_ORG_ID } from "@/lib/mock";

/* ── Static display data ─────────────────────────────────── */
const OPERATIONS = [
  { slug: "social-media", name: "Lyra", role: "Social Media",  task: "Drafting 4 Instagram reels for Q3 product launch — variant A/B/C/D with platform-tuned hooks.", progress: 0.68, barTone: "accent", eta: "ETA 4m",  ref: "OP-3104" },
  { slug: "growth",       name: "Atlas", role: "Head of Growth", task: "Enriching 312 inbound leads from last week's partnership webinar and routing to Hale.",               progress: 0.42, barTone: "info",   eta: "ETA 11m", ref: "OP-3098" },
  { slug: "seo",          name: "Vega",  role: "SEO Manager",    task: "Crawling sitemap for /docs cluster — surfacing duplicate canonicals and weak internal linking.",         progress: 0.91, barTone: "ok",    eta: "ETA 1m",  ref: "OP-3092" },
  { slug: "research",     name: "Sable", role: "Research",        task: "Synthesizing competitor pricing scan into executive brief — 14 sources, 3 segments.",                   progress: 0.55, barTone: "violet", eta: "ETA 7m",  ref: "OP-3088" },
  { slug: "telehealth",   name: "Mira",  role: "Telehealth",     task: "Triaging overnight patient intake — flagging 2 urgent and routing 6 to scheduled care.",                progress: 0.78, barTone: "accent", eta: "ETA 3m",  ref: "OP-3081" },
  { slug: "sales",        name: "Hale",  role: "Sales & CS",     task: "Following up with 28 trial accounts cooling on day 11 — personalized re-engagement.",                   progress: 0.34, barTone: "info",   eta: "ETA 18m", ref: "OP-3076" },
];

const WORKFLOWS = [
  { state: "run",  title: "Weekly content publishing — IG / TikTok / LinkedIn",  agent: "Lyra",  step: "Step 3 of 5 · scheduling",      time: "Started 14:02" },
  { state: "run",  title: "Partnership outreach — Series A SaaS list",            agent: "Atlas", step: "Step 2 of 4 · enrichment",        time: "Started 14:18" },
  { state: "done", title: "Daily SEO regression audit",                            agent: "Vega",  step: "Completed in 6m 24s",             time: "14:22" },
  { state: "wait", title: "Q3 launch announcement — multi-channel",               agent: "Orion", step: "Paused · awaiting your approval", time: "13:51" },
  { state: "run",  title: "Patient follow-up sequence — 48h post-visit",          agent: "Mira",  step: "Step 4 of 6 · sending",           time: "Started 13:40" },
  { state: "done", title: "Pipeline velocity report — week 22",                   agent: "Cael",  step: "Delivered to #leadership",        time: "13:12" },
];

const REPORTS = [
  { slug: "research",          name: "Sable", role: "Research",   title: "Competitor pricing landscape — H1 shifts",     excerpt: "Three of seven tracked competitors moved off seat-based pricing in the last 60 days, converging on usage hybrids. Recommended response inside.", tags: ["pricing", "competitive", "strategy"], time: "23m ago" },
  { slug: "analytics-manager", name: "Cael",  role: "Analytics",  title: "Weekly pipeline velocity — W22",               excerpt: "Stage-2 → stage-3 conversion lifted 11.4% week-over-week, primarily from inbound enriched by Atlas. Stage-4 stall persists in SMB segment.",     tags: ["pipeline", "weekly"],                   time: "1h ago" },
  { slug: "social-media",      name: "Lyra",  role: "Social Media", title: "Reel performance — last 14 days",            excerpt: "Hook-style A (question-led) outperforms B (claim-led) by 2.3× on saves. Recommending shift in next cycle's prompt scaffolding.",                  tags: ["social", "experiment"],                 time: "3h ago" },
];

const GLYPH_TONES: Record<string, { mark: string; bg: string; fg: string }> = {
  "growth":            { mark: "AT", bg: "oklch(0.32 0.05 60)",  fg: "oklch(0.95 0.04 60)"  },
  "social-media":      { mark: "LY", bg: "oklch(0.30 0.06 320)", fg: "oklch(0.94 0.04 320)" },
  "seo":               { mark: "VG", bg: "oklch(0.30 0.06 200)", fg: "oklch(0.93 0.04 200)" },
  "marketing":         { mark: "OR", bg: "oklch(0.30 0.06 270)", fg: "oklch(0.93 0.04 270)" },
  "sales":             { mark: "HL", bg: "oklch(0.30 0.06 145)", fg: "oklch(0.93 0.04 145)" },
  "telehealth":        { mark: "MR", bg: "oklch(0.30 0.06 175)", fg: "oklch(0.93 0.04 175)" },
  "analytics-manager": { mark: "CA", bg: "oklch(0.30 0.06 240)", fg: "oklch(0.93 0.04 240)" },
  "research":          { mark: "SB", bg: "oklch(0.30 0.06 30)",  fg: "oklch(0.94 0.04 30)"  },
};

/* ── Sub-components ──────────────────────────────────────── */
function AgentGlyph({ slug, size = 22 }: { slug: string; size?: number }) {
  const g = GLYPH_TONES[slug] ?? { mark: slug.slice(0, 2).toUpperCase(), bg: "var(--bg-3)", fg: "var(--fg-1)" };
  return (
    <span style={{
      width: size, height: size, flexShrink: 0,
      borderRadius: 6,
      background: g.bg, color: g.fg,
      display: "grid", placeItems: "center",
      fontFamily: "var(--font-mono)",
      fontSize: size * 0.44,
      fontWeight: 600,
      letterSpacing: "-0.02em",
    }}>{g.mark}</span>
  );
}

function Sparkline({ points, color = "var(--fg-2)" }: { points: number[]; color?: string }) {
  const w = 60, h = 22;
  const max = Math.max(...points), min = Math.min(...points);
  const range = max - min || 1;
  const d = points.map((p, i) => {
    const x = (i / (points.length - 1)) * w;
    const y = h - ((p - min) / range) * (h - 2) - 1;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", right: 14, top: 14 }}>
      <path d={d} fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    </svg>
  );
}

function SectionHead({ title, lbl, link }: { title: string; lbl: string; link: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500, color: "var(--fg-0)" }}>
        {title}
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-3)", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>{lbl}</span>
      </div>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-3)", textTransform: "uppercase" as const, letterSpacing: "0.06em", cursor: "pointer" }}>{link}</span>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────── */
export default async function WorkspacePage() {
  let activeCount = 1;
  try {
    const runs = await getActiveAIRuns(MOCK_ORG_ID);
    activeCount = Math.max(runs.length, 1);
  } catch { /* fall back to static */ }

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const KPI_DATA = [
    { label: "Active AI employees", value: "6",     unit: "/ 8",      delta: "+1 since 9am",             spark: [3,4,4,5,5,6,5,6,6,6],          tone: "" },
    { label: "Operations / hr",     value: `${184 + activeCount}`, unit: "ops", delta: "+12.4% vs yesterday",      spark: [110,124,138,142,151,160,165,170,176,184], tone: "up" },
    { label: "Pending approvals",   value: "3",     unit: "queued",   delta: "Oldest 14m",               spark: [4,5,3,4,5,4,3,2,3,3],          tone: "" },
    { label: "Anomalies (24h)",     value: "2",     unit: "flagged",  delta: "1 resolved · 1 open",     spark: [1,2,2,3,2,3,2,4,3,2],          tone: "down" },
  ];

  return (
    <div style={{ padding: "22px 28px 60px", maxWidth: 1280, margin: "0 auto" }}>
      {/* Page header */}
      <div style={{
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        paddingBottom: 18, marginBottom: 22,
        borderBottom: "1px solid var(--line-1)",
      }}>
        <div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 11,
            color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6,
          }}>Workforce · {today}</div>
          <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", margin: 0, color: "var(--fg-0)" }}>
            Good morning.
          </h1>
          <div style={{ marginTop: 4, fontSize: 13, color: "var(--fg-2)" }}>
            6 of 8 AI employees are operating. 9 workflows in flight. 3 approvals queued.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {[
            { label: "Filter", icon: <FilterIcon /> },
            { label: "Briefing", icon: <SparklesIcon /> },
          ].map(btn => (
            <button key={btn.label} style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 10px", fontSize: 12,
              borderRadius: "var(--r-sm)",
              border: "1px solid var(--line-1)",
              background: "var(--bg-2)", color: "var(--fg-1)",
              cursor: "pointer", fontFamily: "inherit",
            }}>
              {btn.icon}{btn.label}
            </button>
          ))}
          <button style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 10px", fontSize: 12,
            borderRadius: "var(--r-sm)",
            border: "1px solid var(--fg-0)",
            background: "var(--fg-0)", color: "var(--bg-0)",
            cursor: "pointer", fontFamily: "inherit",
          }}>
            <PlusIcon />New operation
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
        border: "1px solid var(--line-1)", borderRadius: "var(--r-lg)",
        background: "var(--bg-1)", overflow: "hidden",
        marginBottom: 22,
      }}>
        {KPI_DATA.map((k, i) => (
          <div key={k.label} style={{
            padding: "14px 18px",
            borderRight: i < KPI_DATA.length - 1 ? "1px solid var(--line-1)" : "none",
            display: "flex", flexDirection: "column", gap: 4,
            position: "relative",
          }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "var(--fg-3)" }}>{k.label}</div>
            <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", color: "var(--fg-0)", fontFeatureSettings: '"tnum"', display: "flex", alignItems: "baseline", gap: 6 }}>
              {k.value}<span style={{ fontSize: 12, color: "var(--fg-3)", fontWeight: 400, letterSpacing: 0 }}>{k.unit}</span>
            </div>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 10.5,
              color: k.tone === "up" ? "var(--ok)" : k.tone === "down" ? "var(--bad)" : "var(--fg-2)",
            }}>{k.delta}</div>
            <Sparkline points={k.spark} color={k.tone === "up" ? "var(--ok)" : k.tone === "down" ? "var(--bad)" : "var(--fg-2)"} />
          </div>
        ))}
      </div>

      {/* Now operating */}
      <div style={{ marginBottom: 26 }}>
        <SectionHead title="Now operating" lbl={`live · ${OPERATIONS.length} agents in flight`} link="View all ops →" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {OPERATIONS.map(op => (
            <div key={op.ref} style={{
              background: "var(--bg-1)",
              border: "1px solid var(--line-1)",
              borderRadius: "var(--r-lg)",
              padding: 14,
              cursor: "pointer",
              transition: "all 160ms ease",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                <AgentGlyph slug={op.slug} size={22} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: "var(--fg-0)", fontWeight: 500 }}>{op.name}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-3)" }}>{op.role}</div>
                </div>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--fg-0)", lineHeight: 1.45, marginBottom: 14, letterSpacing: "-0.005em", minHeight: 36 }}>
                {op.task}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-2)" }}>
                <span>{op.ref}</span>
                <div style={{ flex: 1, height: 3, background: "var(--bg-3)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    width: `${Math.round(op.progress * 100)}%`, height: "100%",
                    background: op.barTone === "ok" ? "var(--ok)" : op.barTone === "info" ? "var(--info)" : op.barTone === "violet" ? "var(--violet)" : "var(--accent)",
                    borderRadius: 2, transition: "width 600ms ease",
                  }} />
                </div>
                <span>{op.eta}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workflows + Reports split */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 22, marginBottom: 26 }}>
        {/* Workflows */}
        <div>
          <SectionHead title="Workflows" lbl="9 active · 23 today" link="Compose →" />
          <div style={{ background: "var(--bg-1)", border: "1px solid var(--line-1)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
            {WORKFLOWS.map((w, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "18px 1fr auto",
                gap: 12, alignItems: "center",
                padding: "12px 14px",
                borderBottom: i < WORKFLOWS.length - 1 ? "1px solid var(--line-1)" : "none",
                cursor: "pointer",
              }}>
                {/* State dot */}
                <span style={{
                  width: 14, height: 14, borderRadius: "50%",
                  display: "grid", placeItems: "center",
                  position: "relative",
                  background: w.state === "run" ? "var(--accent-soft)" : w.state === "done" ? "var(--ok-soft)" : "var(--warn-soft)",
                  flexShrink: 0,
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: w.state === "run" ? "var(--accent)" : w.state === "done" ? "var(--ok)" : "var(--warn)",
                    animation: w.state === "run" ? "winglo-pulse-soft 1.6s ease-in-out infinite" : undefined,
                  }} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, color: "var(--fg-0)", marginBottom: 3, letterSpacing: "-0.005em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.title}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-3)", display: "flex", gap: 8 }}>
                    <span>{w.agent}</span>
                    <span style={{ color: "var(--fg-4)" }}>·</span>
                    <span>{w.step}</span>
                  </div>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-2)", whiteSpace: "nowrap" }}>{w.time}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Reports */}
        <div>
          <SectionHead title="Reports" lbl="latest from your analysts" link="Archive →" />
          {REPORTS.map((r, i) => (
            <div key={i} style={{
              background: "var(--bg-1)",
              border: "1px solid var(--line-1)",
              borderRadius: "var(--r-lg)",
              padding: 14,
              marginBottom: i < REPORTS.length - 1 ? 10 : 0,
              cursor: "pointer",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: "var(--fg-2)" }}>
                  <AgentGlyph slug={r.slug} size={18} />
                  <span>{r.name}</span>
                  <span style={{ color: "var(--fg-3)" }}>/ {r.role}</span>
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-3)" }}>{r.time}</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--fg-0)", fontWeight: 500, marginBottom: 4, letterSpacing: "-0.005em" }}>{r.title}</div>
              <div style={{ fontSize: 12, color: "var(--fg-2)", lineHeight: 1.5 }}>{r.excerpt}</div>
              <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                {r.tags.map(t => (
                  <span key={t} style={{
                    fontFamily: "var(--font-mono)", fontSize: 10,
                    padding: "2px 6px", borderRadius: 3,
                    background: "var(--bg-3)", color: "var(--fg-2)",
                    border: "1px solid var(--line-1)",
                  }}>{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Orchestration graph (client component) */}
      <OrchGraph />
    </div>
  );
}

/* ── Inline icons ────────────────────────────────────────── */
function FilterIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5h18l-7 8v6l-4-2v-4z" />
    </svg>
  );
}
function SparklesIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 4l1.5 4.5L18 10l-4.5 1.5L12 16l-1.5-4.5L6 10l4.5-1.5z" />
      <path d="M19 4l.7 2L22 7l-2.3.8L19 10l-.7-2.2L16 7l2.3-1z" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
