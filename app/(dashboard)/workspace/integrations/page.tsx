"use client"

interface Integration {
  mark: string
  name: string
  category: string
  status: "ok" | "warn" | "error"
  accent: string
  lastSync: string
  scope: string
}

const INTEGRATIONS: Integration[] = [
  { mark: "SL", name: "Slack",         category: "Comms",    status: "ok",    accent: "oklch(0.62 0.14 320)", lastSync: "now", scope: "4 channels · DMs read-only" },
  { mark: "GM", name: "Gmail",         category: "Comms",    status: "ok",    accent: "oklch(0.62 0.16 28)",  lastSync: "12s", scope: "Send · 2 mailboxes" },
  { mark: "MS", name: "Microsoft 365", category: "Comms",    status: "warn",  accent: "oklch(0.62 0.12 240)", lastSync: "8m",  scope: "Re-auth required" },
  { mark: "HS", name: "HubSpot",       category: "CRM",      status: "ok",    accent: "oklch(0.62 0.14 28)",  lastSync: "1m",  scope: "Read/write · 12k contacts" },
  { mark: "AP", name: "Apollo",        category: "CRM",      status: "ok",    accent: "oklch(0.62 0.12 200)", lastSync: "3m",  scope: "Enrichment · 250 credits/day" },
  { mark: "SF", name: "Salesforce",    category: "CRM",      status: "ok",    accent: "oklch(0.62 0.14 240)", lastSync: "1m",  scope: "Read-only · opportunities" },
  { mark: "GA", name: "GA4",           category: "Analytics",status: "ok",    accent: "oklch(0.62 0.14 60)",  lastSync: "8m",  scope: "Site · 3 properties" },
  { mark: "MP", name: "Mixpanel",      category: "Analytics",status: "ok",    accent: "oklch(0.62 0.12 270)", lastSync: "4m",  scope: "Product events" },
  { mark: "SE", name: "Segment",       category: "Analytics",status: "ok",    accent: "oklch(0.62 0.12 145)", lastSync: "now", scope: "CDP · 6 sources" },
  { mark: "IG", name: "Instagram",     category: "Social",   status: "ok",    accent: "oklch(0.62 0.14 320)", lastSync: "2m",  scope: "2 accounts · post + read" },
  { mark: "TT", name: "TikTok",        category: "Social",   status: "ok",    accent: "oklch(0.62 0.005 250)",lastSync: "5m",  scope: "1 account · post + read" },
  { mark: "LI", name: "LinkedIn",      category: "Social",   status: "ok",    accent: "oklch(0.62 0.12 240)", lastSync: "1m",  scope: "Company + 3 voices" },
  { mark: "DR", name: "Google Drive",  category: "Storage",  status: "ok",    accent: "oklch(0.62 0.10 145)", lastSync: "now", scope: "Shared drive · brand assets" },
  { mark: "NT", name: "Notion",        category: "Storage",  status: "ok",    accent: "oklch(0.62 0.005 250)",lastSync: "30s", scope: "Workspace · read + write" },
  { mark: "FG", name: "Figma",         category: "Storage",  status: "warn",  accent: "oklch(0.62 0.16 28)",  lastSync: "2d",  scope: "Re-auth on May 18" },
  { mark: "ST", name: "Stripe",        category: "Payments", status: "ok",    accent: "oklch(0.62 0.12 270)", lastSync: "now", scope: "Read-only · revenue + subs" },
  { mark: "QB", name: "QuickBooks",    category: "Payments", status: "ok",    accent: "oklch(0.62 0.12 145)", lastSync: "1h",  scope: "Read · finance" },
  { mark: "ZP", name: "Zapier",        category: "Other",    status: "error", accent: "oklch(0.62 0.16 60)",  lastSync: "—",   scope: "Disconnected · auth failed" },
]

const CATEGORIES = [...new Set(INTEGRATIONS.map(i => i.category))]

function statusLabel(s: Integration["status"]) {
  if (s === "ok") return "Synced"
  if (s === "warn") return "Attention"
  return "Error"
}

export default function IntegrationsPage() {
  const stats = {
    total:     INTEGRATIONS.length,
    healthy:   INTEGRATIONS.filter(i => i.status === "ok").length,
    attention: INTEGRATIONS.filter(i => i.status === "warn").length,
    errors:    INTEGRATIONS.filter(i => i.status === "error").length,
  }

  return (
    <div className="page fade-in">
      <div className="page-head">
        <div className="page-title-block">
          <div className="eyebrow">Integrations · {stats.total} connected</div>
          <h1 className="page-title">Where your AI workforce reads and writes.</h1>
          <div className="page-subtitle">
            Sources, destinations, and tools your agents are authorized to touch.
          </div>
        </div>
        <div className="page-head-right">
          <button className="btn">Browse catalog</button>
          <button className="btn primary">Connect source</button>
        </div>
      </div>

      <div className="kpi-strip" style={{ marginBottom: 22 }}>
        <div className="kpi">
          <div className="kpi-label">Connected</div>
          <div className="kpi-value">{stats.total}</div>
          <div className="kpi-delta">across {CATEGORIES.length} categories</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Healthy</div>
          <div className="kpi-value" style={{ color: "var(--ok)" }}>{stats.healthy}</div>
          <div className="kpi-delta">syncing on schedule</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Needs attention</div>
          <div className="kpi-value" style={{ color: "var(--warn)" }}>{stats.attention}</div>
          <div className="kpi-delta">re-auth or stale</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Errors</div>
          <div className="kpi-value" style={{ color: "var(--bad)" }}>{stats.errors}</div>
          <div className="kpi-delta">action required</div>
        </div>
      </div>

      {CATEGORIES.map(cat => {
        const items = INTEGRATIONS.filter(i => i.category === cat)
        return (
          <div className="section" key={cat}>
            <div className="section-head">
              <div className="section-title">
                {cat}
                <span className="lbl">{items.length} source{items.length === 1 ? "" : "s"}</span>
              </div>
            </div>
            <div className="integ-grid-large">
              {items.map(it => (
                <div className="integ-card" key={it.name}>
                  <div className="integ-card-head">
                    <div
                      className="integ-card-mark"
                      style={{
                        background: `color-mix(in oklch, ${it.accent} 18%, var(--bg-2))`,
                        color: it.accent,
                        borderColor: `color-mix(in oklch, ${it.accent} 30%, var(--line-2))`,
                      }}
                    >
                      {it.mark}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="integ-card-name">{it.name}</div>
                      <div className="integ-card-cat">{it.category}</div>
                    </div>
                    <div className={"integ-status" + (it.status === "error" ? " error" : it.status === "warn" ? " warn" : "")}>
                      <span className="dot" />
                      {statusLabel(it.status)}
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
        )
      })}
    </div>
  )
}
