"use client"

import { useState } from "react"
import { PageAgentGlyph, AGENT_MAP, AGENTS_LIST } from "@/components/workspace/page-agent-glyph"

interface AuditRow {
  time: string
  agent: string
  verb: string
  target: string
  ref: string
  sev: "info" | "ok" | "warn" | "bad"
  dur: string
}

const AUDIT_LOG: AuditRow[] = [
  { time: "14:23:08", agent: "social",    verb: "scheduled",        target: "4 reels for Fri 09:00 PT",                     ref: "AC-4910", sev: "info", dur: "8.2s"   },
  { time: "14:22:41", agent: "growth",    verb: "enriched",         target: "312 leads from Apollo + Stripe sources",        ref: "AC-4908", sev: "info", dur: "41.4s"  },
  { time: "14:20:14", agent: "seo",       verb: "flagged",          target: "11 duplicate canonicals in /docs/api",          ref: "AC-4905", sev: "warn", dur: "2.1s"   },
  { time: "14:18:02", agent: "research",  verb: "wrote memory",     target: "competitor.acme.pricing",                       ref: "AC-4901", sev: "info", dur: "0.4s"   },
  { time: "14:16:55", agent: "sales",     verb: "sent message",     target: "Maya Chen · trial cooldown",                   ref: "AC-4898", sev: "info", dur: "1.8s"   },
  { time: "14:14:30", agent: "telehealth",verb: "escalated",        target: "2 intake cases to on-call queue",               ref: "AC-4894", sev: "warn", dur: "0.6s"   },
  { time: "14:11:09", agent: "analytics", verb: "delivered",        target: "pipeline report W22 to #leadership",            ref: "AC-4891", sev: "info", dur: "12.0s"  },
  { time: "14:03:22", agent: "marketing", verb: "drafted",          target: "Q3 launch announcement · 4 channel variants",  ref: "AC-4885", sev: "info", dur: "1m 24s" },
  { time: "14:01:48", agent: "growth",    verb: "started workflow", target: "wf-outreach (Series A SaaS · 280 contacts)",   ref: "AC-4881", sev: "info", dur: "—"       },
  { time: "13:58:11", agent: "social",    verb: "requested approval",target: "tone variant A vs B for outage reel",          ref: "AC-4877", sev: "info", dur: "—"       },
  { time: "13:54:02", agent: "telehealth",verb: "completed",        target: "morning intake batch (6 routed, 0 escal.)",     ref: "AC-4872", sev: "ok",   dur: "4m 18s" },
  { time: "13:51:30", agent: "marketing", verb: "paused workflow",  target: "wf-launch (awaiting your approval)",            ref: "AC-4866", sev: "info", dur: "—"       },
  { time: "13:48:14", agent: "sales",     verb: "merged record",    target: "maya@loop.app + maya.chen@loop.io",             ref: "AC-4861", sev: "info", dur: "0.3s"   },
  { time: "13:46:02", agent: "research",  verb: "fetched source",   target: "Acme investor brief · paywalled",               ref: "AC-4858", sev: "warn", dur: "2.4s"   },
  { time: "13:42:18", agent: "seo",       verb: "completed",        target: "daily regression audit (142 pages)",            ref: "AC-4854", sev: "ok",   dur: "6m 24s" },
  { time: "13:40:01", agent: "telehealth",verb: "started workflow", target: "wf-followup (48h post-visit · 18 patients)",   ref: "AC-4848", sev: "info", dur: "—"       },
  { time: "13:38:42", agent: "growth",    verb: "rejected lead",    target: "Northwind Capital · ICP mismatch",              ref: "AC-4844", sev: "info", dur: "0.1s"   },
  { time: "13:34:09", agent: "analytics", verb: "calibrated model", target: "forecast.accuracy.baseline (rolling 8w)",      ref: "AC-4839", sev: "info", dur: "22.0s"  },
  { time: "13:30:18", agent: "social",    verb: "published",        target: "IG carousel · '5 pricing patterns'",           ref: "AC-4833", sev: "ok",   dur: "4.2s"   },
  { time: "13:27:55", agent: "marketing", verb: "retrieved memory", target: "launch.q3.embargo (read by Orion)",             ref: "AC-4828", sev: "info", dur: "0.2s"   },
  { time: "13:24:11", agent: "sales",     verb: "scheduled meeting",target: "Maya Chen · Thu 11:00 PT",                     ref: "AC-4823", sev: "ok",   dur: "1.4s"   },
  { time: "13:18:32", agent: "research",  verb: "synthesized",      target: "competitor pricing brief · 14 sources",        ref: "AC-4818", sev: "info", dur: "2m 04s" },
  { time: "13:14:00", agent: "seo",       verb: "started workflow", target: "wf-seo (daily regression)",                    ref: "AC-4811", sev: "info", dur: "—"       },
  { time: "13:08:21", agent: "growth",    verb: "auth refresh",     target: "Apollo OAuth · token rotated",                  ref: "AC-4805", sev: "info", dur: "0.8s"   },
  { time: "13:02:14", agent: "telehealth",verb: "anomaly detected", target: "intake volume 2.4σ above baseline at 03:00",   ref: "AC-4798", sev: "bad",  dur: "—"       },
]

const SEV_FILTERS = [
  { id: "all",  label: "All severities" },
  { id: "info", label: "Info"  },
  { id: "ok",   label: "OK"    },
  { id: "warn", label: "Warn"  },
  { id: "bad",  label: "Error" },
]

export default function AuditPage() {
  const [agentFilter, setAgentFilter] = useState("all")
  const [sevFilter, setSevFilter] = useState("all")

  const filtered = AUDIT_LOG.filter(row => {
    if (agentFilter !== "all" && row.agent !== agentFilter) return false
    if (sevFilter !== "all" && row.sev !== sevFilter) return false
    return true
  })

  return (
    <div className="page fade-in">
      <div className="page-head">
        <div className="page-title-block">
          <div className="eyebrow">Audit log · {AUDIT_LOG.length} events shown · last hour</div>
          <h1 className="page-title">Every action, traced.</h1>
          <div className="page-subtitle">
            A complete, append-only record of what your AI workforce did, when, and why.
          </div>
        </div>
        <div className="page-head-right">
          <button className="btn">Search</button>
          <button className="btn">Export CSV</button>
          <button className="btn primary">Live tail</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <button
          className={"chip" + (agentFilter === "all" ? " active" : "")}
          onClick={() => setAgentFilter("all")}
        >
          All agents <span className="count">{AUDIT_LOG.length}</span>
        </button>
        {AGENTS_LIST.map(a => {
          const count = AUDIT_LOG.filter(r => r.agent === a.id).length
          if (count === 0) return null
          return (
            <button
              key={a.id}
              className={"chip" + (agentFilter === a.id ? " active" : "")}
              onClick={() => setAgentFilter(a.id)}
            >
              {a.name} <span className="count">{count}</span>
            </button>
          )
        })}
        <span style={{ width: 1, background: "var(--line-1)", margin: "0 4px", alignSelf: "stretch" }} />
        {SEV_FILTERS.map(s => (
          <button
            key={s.id}
            className={"chip" + (sevFilter === s.id ? " active" : "")}
            onClick={() => setSevFilter(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="audit-list">
        <div className="audit-row audit-row-head">
          <div>Timestamp</div>
          <div />
          <div>Action</div>
          <div>Ref</div>
          <div>Severity</div>
          <div style={{ textAlign: "right" }}>Duration</div>
        </div>
        {filtered.map((row, i) => {
          const a = AGENT_MAP[row.agent]
          return (
            <div className="audit-row" key={i}>
              <div className="audit-time">{row.time}</div>
              <div className="audit-glyph-cell"><PageAgentGlyph agentId={row.agent} size={20} /></div>
              <div className="audit-action">
                <span style={{ color: "var(--fg-0)" }}>{a?.name}</span>{" "}
                <span className="verb">{row.verb}</span>{" "}
                <span style={{ color: "var(--fg-1)" }}>{row.target}</span>
              </div>
              <div className="audit-ref">{row.ref}</div>
              <div>
                <span className={"audit-sev " + row.sev}>
                  <span className="dot" />
                  {row.sev}
                </span>
              </div>
              <div className="audit-duration">{row.dur}</div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-3)" }}>
        <span>Showing {filtered.length} of {AUDIT_LOG.length} · streaming live</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />
          tail live
        </span>
      </div>
    </div>
  )
}
