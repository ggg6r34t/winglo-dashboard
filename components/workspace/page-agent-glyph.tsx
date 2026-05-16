// Shared glyph badge for workspace page content areas.
// Maps design agent IDs (social, analytics, etc.) to our slugs and glyph data.

export const AGENT_MAP: Record<string, { name: string; role: string; mark: string; bg: string; fg: string }> = {
  growth:    { name: "Atlas",  role: "Head of Growth",        mark: "AT", bg: "oklch(0.32 0.05 60)",  fg: "oklch(0.95 0.04 60)"  },
  social:    { name: "Lyra",   role: "Social Media Manager",  mark: "LY", bg: "oklch(0.30 0.06 320)", fg: "oklch(0.94 0.04 320)" },
  seo:       { name: "Vega",   role: "SEO Manager",           mark: "VG", bg: "oklch(0.30 0.06 200)", fg: "oklch(0.93 0.04 200)" },
  marketing: { name: "Orion",  role: "Marketing Manager",     mark: "OR", bg: "oklch(0.30 0.06 270)", fg: "oklch(0.93 0.04 270)" },
  sales:     { name: "Hale",   role: "Sales & Customer Success", mark: "HL", bg: "oklch(0.30 0.06 145)", fg: "oklch(0.93 0.04 145)" },
  telehealth:{ name: "Mira",   role: "Telehealth Manager",    mark: "MR", bg: "oklch(0.30 0.06 175)", fg: "oklch(0.93 0.04 175)" },
  analytics: { name: "Cael",   role: "Analytics Manager",     mark: "CA", bg: "oklch(0.30 0.06 240)", fg: "oklch(0.93 0.04 240)" },
  research:  { name: "Sable",  role: "Research Analyst",      mark: "SB", bg: "oklch(0.30 0.06 30)",  fg: "oklch(0.94 0.04 30)"  },
}

export const AGENTS_LIST = [
  { id: "growth",    ...AGENT_MAP.growth,    runs: 1284, status: "work", statusLabel: "Sourcing leads",       lastSeen: "active now" },
  { id: "social",    ...AGENT_MAP.social,    runs: 2847, status: "live", statusLabel: "Drafting 4 posts",     lastSeen: "active now" },
  { id: "seo",       ...AGENT_MAP.seo,       runs:  612, status: "work", statusLabel: "Audit · 142 pages",    lastSeen: "active now" },
  { id: "marketing", ...AGENT_MAP.marketing, runs:  419, status: "wait", statusLabel: "Awaiting approval",    lastSeen: "12m ago"    },
  { id: "sales",     ...AGENT_MAP.sales,     runs: 1532, status: "live", statusLabel: "On 3 conversations",   lastSeen: "active now" },
  { id: "telehealth",...AGENT_MAP.telehealth,runs:  884, status: "work", statusLabel: "Triage queue · 8",     lastSeen: "active now" },
  { id: "analytics", ...AGENT_MAP.analytics, runs:  207, status: "idle", statusLabel: "Standing by",          lastSeen: "4m ago"     },
  { id: "research",  ...AGENT_MAP.research,  runs:  392, status: "work", statusLabel: "Synthesizing report",  lastSeen: "active now" },
]

interface PageAgentGlyphProps {
  agentId: string
  size?: number
}

export function PageAgentGlyph({ agentId, size = 24 }: PageAgentGlyphProps) {
  const a = AGENT_MAP[agentId]
  if (!a) return null
  const fontSize = size <= 16 ? 7 : size <= 20 ? 8.5 : size <= 24 ? 10.5 : size <= 28 ? 12 : 14
  return (
    <div
      className="agent-glyph"
      style={{
        width: size, height: size, background: a.bg, color: a.fg,
        fontSize, borderColor: "transparent",
      }}
    >
      {a.mark}
    </div>
  )
}
