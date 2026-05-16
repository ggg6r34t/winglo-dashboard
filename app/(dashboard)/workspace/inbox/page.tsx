"use client"

import { useState } from "react"
import { PageAgentGlyph, AGENT_MAP } from "@/components/workspace/page-agent-glyph"

interface Artifact { name: string; meta: string; icon: string }

interface InboxMsg {
  id: string
  from: string
  subject: string
  preview: string
  time: string
  unread: boolean
  tags: string[]
  body: string[]
  artifacts: Artifact[]
}

const INBOX: InboxMsg[] = [
  {
    id: "m-1", from: "social",
    subject: "Tone check on crisis-response reel — need your read",
    preview: "I drafted two variants for the reel announcing the service outage. A is empathetic, B is informational. I'm 60/40 leaning A but it's your call — both attached.",
    time: "2m", unread: true, tags: ["decision", "tone"],
    body: [
      "I drafted two variants for the reel announcing this morning's brief service outage. Both are 22s, both lead with the resolution and route to the status page.",
      "Variant A opens with a personal note from you and apologizes for the disruption. Variant B opens with the timeline and links to the post-mortem.",
      "My read: A performs better historically for outages under 30 minutes — saves/shares are 1.8× higher when the founder is on camera and tone is empathetic. B is the safer choice for repeat incidents.",
      "I haven't scheduled either. Just need you to pick.",
    ],
    artifacts: [
      { name: "outage-reel-A_empathetic.mp4", meta: "22s · 14MB · draft", icon: "MP4" },
      { name: "outage-reel-B_informational.mp4", meta: "22s · 12MB · draft", icon: "MP4" },
    ],
  },
  {
    id: "m-2", from: "research",
    subject: "Q3 competitive brief is ready",
    preview: "Synthesized 14 sources covering Acme, Coil, Northwind, and four smaller players. Headline: pricing is converging on usage. Full brief and one-page exec summary attached.",
    time: "23m", unread: true, tags: ["report", "strategic"],
    body: [
      "Brief is done. I covered the seven competitors on our watchlist plus three you flagged last sprint.",
      "Headline finding: three of seven are off seat-based pricing in the last 60 days, converging on usage hybrids. Acme moved on May 9, Northwind on May 2, Coil announced today.",
      "Recommendation: we should run the pricing experiment we discussed in April. I've left a hook in the brief for Orion to take this into the launch narrative.",
    ],
    artifacts: [
      { name: "q3-competitive-brief.pdf", meta: "18 pages · 1.4MB", icon: "PDF" },
      { name: "exec-summary.md", meta: "1 page · markdown", icon: "MD" },
    ],
  },
  {
    id: "m-3", from: "growth",
    subject: "Flagging a duplicate lead — Maya Chen at Loop",
    preview: "Hale opened a thread with Maya yesterday. I just enriched her contact via Apollo and found a match in our existing pipeline under a different email. Routing back to Hale.",
    time: "1h", unread: false, tags: ["routing"],
    body: [
      "Quick heads-up. Hale started a re-engagement thread yesterday with maya.chen@loop.io. My enrichment shows she's already in the pipeline as maya@loop.app — a trial signup from March that cooled in week 2.",
      "I've merged the records and notified Hale to pick up the existing thread instead of starting fresh. No action needed from you.",
    ],
    artifacts: [],
  },
  {
    id: "m-4", from: "marketing",
    subject: "Launch announcement — final review before scheduling",
    preview: "Blog, email, X thread, LinkedIn variants are all drafted and ready for embargo Thursday 09:00. Approval is in your queue. Sharing here for visibility.",
    time: "2h", unread: false, tags: ["approval", "launch"],
    body: [
      "All four channels are drafted: blog (1,420 words), email (lead + body, 3 variants for A/B), X thread (11 posts), LinkedIn (long-form + short).",
      "I held the embargo at Thursday 09:00 PT. Lyra has the reels queued behind this. Sable's brief informed the positioning.",
      "Approval is in your queue (Approvals tab, top item). Sending this so you have context before you open it.",
    ],
    artifacts: [{ name: "launch-package-v4.zip", meta: "4 files · 240KB", icon: "ZIP" }],
  },
  {
    id: "m-5", from: "telehealth",
    subject: "Two intake cases escalated overnight",
    preview: "Both routed to on-call. Patient A: chest pain symptom cluster, escalated to Dr. Park at 03:14. Patient B: medication reconciliation, scheduled for morning call.",
    time: "5h", unread: false, tags: ["escalation", "telehealth"],
    body: [
      "Overnight intake summary: 8 cases, 2 escalated, 6 routed to scheduled care.",
      "Patient A: presented chest pain + radiating arm pain at 02:51. Symptom cluster matched escalation criteria 4-c. Routed to Dr. Park at 03:14. Confirmed received at 03:16. Status: in care.",
      "Patient B: medication reconciliation needed before refill — non-urgent. Booked for Dr. Reyes at 09:30 today.",
    ],
    artifacts: [],
  },
  {
    id: "m-6", from: "seo",
    subject: "11 duplicate canonicals in /docs/api",
    preview: "Crawl finished. Found 11 duplicate canonical URLs concentrated in /docs/api/v2/*. Recommending the fixes in the attached diff. Low risk to ship.",
    time: "1d", unread: false, tags: ["seo", "fix"],
    body: [
      "Daily audit caught 11 duplicate canonical tags in the /docs/api/v2 cluster. Most are caused by the SDK page generator using the same canonical for paginated endpoints.",
      "Patch is attached as a diff. Low risk — affects 11 files, no traffic change expected on the canonical pages themselves, but should consolidate signal to the right URLs.",
    ],
    artifacts: [{ name: "canonical-fix.diff", meta: "11 files · +24 / −24", icon: "DIFF" }],
  },
  {
    id: "m-7", from: "analytics",
    subject: "Weekly pipeline report delivered",
    preview: "Pipeline velocity report for W22 is in #leadership. Highlights: stage-2 conversion +11.4% wow, SMB segment stalling at stage-4.",
    time: "1d", unread: false, tags: ["report", "weekly"],
    body: [
      "Standard weekly is in #leadership channel. Three things to know:",
      "1. Stage-2 → stage-3 conversion is up 11.4% wow, driven primarily by Atlas-enriched inbound.",
      "2. Stage-4 stall in SMB — 18% of deals are sitting 21+ days. I've flagged this to Hale.",
      "3. Forecast accuracy is at 94% for the rolling quarter, in line with my baseline.",
    ],
    artifacts: [],
  },
]

const FILTERS = [
  { id: "all",      label: "All",       countFn: (msgs: InboxMsg[]) => msgs.length },
  { id: "unread",   label: "Unread",    countFn: (msgs: InboxMsg[]) => msgs.filter(m => m.unread).length },
  { id: "decision", label: "Decisions", countFn: (msgs: InboxMsg[]) => msgs.filter(m => m.tags.includes("decision") || m.tags.includes("approval")).length },
  { id: "reports",  label: "Reports",   countFn: (msgs: InboxMsg[]) => msgs.filter(m => m.tags.includes("report")).length },
  { id: "ops",      label: "Operational", countFn: () => undefined },
]

export default function InboxPage() {
  const [filter, setFilter] = useState("all")
  const [activeId, setActiveId] = useState(INBOX[0].id)

  const filtered = INBOX.filter(m => {
    if (filter === "unread") return m.unread
    if (filter === "decision") return m.tags.includes("decision") || m.tags.includes("approval")
    if (filter === "reports") return m.tags.includes("report")
    return true
  })

  const active = INBOX.find(m => m.id === activeId)

  return (
    <div className="inbox fade-in">
      {/* Left: message list */}
      <div className="inbox-list">
        <div className="inbox-filters">
          {FILTERS.map(f => {
            const count = f.countFn(INBOX)
            return (
              <button
                key={f.id}
                className={"chip" + (filter === f.id ? " active" : "")}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
                {count != null && <span className="count">{count}</span>}
              </button>
            )
          })}
        </div>
        {filtered.map(m => {
          const agent = AGENT_MAP[m.from]
          return (
            <div
              key={m.id}
              className={"inbox-item" + (m.id === activeId ? " active" : "") + (m.unread ? " unread" : "")}
              onClick={() => setActiveId(m.id)}
            >
              <PageAgentGlyph agentId={m.from} size={26} />
              <div style={{ minWidth: 0 }}>
                <div className="inbox-meta-row">
                  <div className="inbox-from">{agent?.name}</div>
                  <div className="inbox-time">{m.time}</div>
                </div>
                <div className="inbox-subject">{m.subject}</div>
                <div className="inbox-preview">{m.preview}</div>
                <div className="inbox-tags">
                  {m.tags.map(t => <span key={t} className="tag">{t}</span>)}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Right: message detail */}
      {active && (() => {
        const agent = AGENT_MAP[active.from]
        return (
          <div className="inbox-detail fade-in" key={active.id}>
            <div className="detail-head">
              <div className="detail-from">
                <PageAgentGlyph agentId={active.from} size={34} />
                <div>
                  <div style={{ fontSize: 13, color: "var(--fg-0)", fontWeight: 500 }}>{agent?.name}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {agent?.role}
                  </div>
                </div>
              </div>
              <div style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-3)" }}>
                {active.time} ago · {active.id.toUpperCase()}
              </div>
            </div>
            <h1 className="detail-subject">{active.subject}</h1>
            <div className="detail-body">
              {active.body.map((p, i) => <p key={i}>{p}</p>)}
              {active.artifacts.length > 0 && (
                <div style={{ marginTop: 22 }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--fg-3)", marginBottom: 8 }}>
                    Attached artifacts
                  </div>
                  {active.artifacts.map((a, i) => (
                    <div className="artifact" key={i}>
                      <div className="artifact-icon">{a.icon}</div>
                      <div>
                        <div className="artifact-name">{a.name}</div>
                        <div className="artifact-meta">{a.meta}</div>
                      </div>
                      <button className="btn">Open</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="detail-actions">
              <button className="btn primary">Approve &amp; continue</button>
              <button className="btn">Reply with note</button>
              <button className="btn">Mark resolved</button>
              <button className="btn" style={{ marginLeft: "auto", color: "var(--fg-3)" }}>Archive</button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
