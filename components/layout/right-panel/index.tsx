"use client";

import Link from "next/link";
import { useState } from "react";
import { ApprovalCountBadge } from "@/components/workspace/approval-count-badge";
import { useOrchestrationStore } from "@/features/orchestration/hooks/use-orchestration-store";
import type { AgentType } from "@/types";

/* ── Static display data (enriches live store data) ────── */
const ACTIVITY_FEED = [
  { agentId: "growth",     verb: "enriched",   target: "312 leads",              detail: "from Apollo + Stripe sources",       time: "2m ago",  ref: "AC-4908" },
  { agentId: "growth",     verb: "sourced",     target: "8 new opportunities",    detail: "Series A SaaS partnerships",         time: "6m ago",  ref: "AC-4905" },
  { agentId: "growth",     verb: "scored",      target: "24 prospects",           detail: "avg score 72 — 6 approved",         time: "11m ago", ref: "AC-4901" },
  { agentId: "growth",     verb: "drafted",     target: "3 outreach emails",      detail: "personalized for Acme, Loop, Coil", time: "18m ago", ref: "AC-4898" },
  { agentId: "growth",     verb: "completed",   target: "discovery run",          detail: "142 pages crawled, 0 errors",        time: "22m ago", ref: "AC-4894" },
  { agentId: "growth",     verb: "flagged",     target: "ICP mismatch",           detail: "Northwind Capital — excluded",       time: "31m ago", ref: "AC-4891" },
  { agentId: "growth",     verb: "updated",     target: "memory record",          detail: "customer.icp refined post-W22",     time: "44m ago", ref: "AC-4885" },
];

const MEMORY_UPDATES = [
  { key: "GROWTH / customer.icp",   val: "Refined to exclude sub-15 headcount. Matches W18–W22 conversion data.",     by: "Growth",  time: "12m ago" },
  { key: "GROWTH / brand.voice",    val: "Avoid formal closings in cold outreach. Tested against last 30 sent.",       by: "Growth",  time: "1h ago"  },
  { key: "GROWTH / partner.coil",   val: "Coil expressed interest in Q3 integration. Founder DM received.",           by: "Growth",  time: "2h ago"  },
];

/* ── Glyph (mini agent identity) ────────────────────────── */
function AgentGlyph({ slug, size = 22 }: { slug: string; size?: number }) {
  const glyphs: Record<string, { mark: string; bg: string; fg: string }> = {
    "growth":           { mark: "AT", bg: "oklch(0.32 0.05 60)",  fg: "oklch(0.95 0.04 60)"  },
    "social-media":     { mark: "LY", bg: "oklch(0.30 0.06 320)", fg: "oklch(0.94 0.04 320)" },
    "seo":              { mark: "VG", bg: "oklch(0.30 0.06 200)", fg: "oklch(0.93 0.04 200)" },
    "marketing":        { mark: "OR", bg: "oklch(0.30 0.06 270)", fg: "oklch(0.93 0.04 270)" },
    "sales":            { mark: "HL", bg: "oklch(0.30 0.06 145)", fg: "oklch(0.93 0.04 145)" },
    "telehealth":       { mark: "MR", bg: "oklch(0.30 0.06 175)", fg: "oklch(0.93 0.04 175)" },
    "analytics-manager":{ mark: "CA", bg: "oklch(0.30 0.06 240)", fg: "oklch(0.93 0.04 240)" },
    "research":         { mark: "SB", bg: "oklch(0.30 0.06 30)",  fg: "oklch(0.94 0.04 30)"  },
    "outreach":         { mark: "OT", bg: "oklch(0.30 0.06 45)",  fg: "oklch(0.94 0.04 45)"  },
  };
  const g = glyphs[slug] ?? { mark: slug.slice(0, 2).toUpperCase(), bg: "var(--bg-3)", fg: "var(--fg-1)" };
  return (
    <span style={{
      width: size, height: size, flexShrink: 0,
      borderRadius: 6,
      background: g.bg,
      color: g.fg,
      display: "grid",
      placeItems: "center",
      fontFamily: "var(--font-mono)",
      fontSize: size * 0.42,
      fontWeight: 600,
      letterSpacing: "-0.02em",
      border: "1px solid transparent",
    }}>{g.mark}</span>
  );
}

/* ── Tab types ──────────────────────────────────────────── */
type RpTab = "activity" | "approvals" | "memory";

export function RightPanel() {
  const [tab, setTab] = useState<RpTab>("activity");
  const feedEvents = useOrchestrationStore(s => s.feedEvents);

  const tabStyle = (id: RpTab): React.CSSProperties => ({
    padding: "4px 8px",
    fontSize: 11.5,
    color: tab === id ? "var(--fg-0)" : "var(--fg-2)",
    background: tab === id ? "var(--bg-3)" : "transparent",
    borderRadius: "var(--r-sm)",
    cursor: "pointer",
    border: "none",
    fontFamily: "inherit",
    transition: "all 120ms ease",
    display: "flex",
    alignItems: "center",
    gap: 4,
  });

  return (
    <aside style={{
      background: "var(--bg-1)",
      borderLeft: "1px solid var(--line-1)",
      display: "flex",
      flexDirection: "column",
      minHeight: 0,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        height: "var(--header-h)",
        borderBottom: "1px solid var(--line-1)",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 4,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", gap: 2 }}>
          {(["activity", "approvals", "memory"] as RpTab[]).map(t => {
            const counts: Record<RpTab, number> = {
              activity: feedEvents.length || ACTIVITY_FEED.length,
              approvals: 0,
              memory: MEMORY_UPDATES.length,
            };
            const labels: Record<RpTab, string> = { activity: "Activity", approvals: "Approvals", memory: "Memory" };
            return (
              <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>
                {labels[t]}
                <span style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: tab === t ? "var(--fg-1)" : "var(--fg-3)",
                  marginLeft: 2,
                }}>{t === "approvals" ? <ApprovalCountBadge /> : counts[t]}</span>
              </button>
            );
          })}
        </div>
        <div style={{ marginLeft: "auto" }}>
          <PulseDot />
        </div>
      </div>

      {/* Scroll body */}
      <div style={{ overflowY: "auto", flex: 1 }}>
        {tab === "activity" && <ActivityTab feedEvents={feedEvents} />}
        {tab === "approvals" && <ApprovalsTab />}
        {tab === "memory" && <MemoryTab />}
      </div>
    </aside>
  );
}

function PulseDot() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-2)" }}>
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: "var(--accent)",
        animation: "winglo-pulse 2.4s ease-out infinite",
      }} />
      live
    </span>
  );
}

function Section({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "var(--font-mono)",
      fontSize: 10.5,
      textTransform: "uppercase" as const,
      letterSpacing: "0.06em",
      color: "var(--fg-3)",
      marginBottom: 10,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      <span>{title}</span>
      {right}
    </div>
  );
}

function ActivityTab({ feedEvents }: { feedEvents: Array<{ agentType: AgentType; level: string; message: string; createdAt: string; id: string }> }) {
  const items = feedEvents.length > 0
    ? feedEvents.slice(0, 12).map(e => ({
        agentId: e.agentType as string,
        verb: e.level === "error" ? "errored" : "logged",
        target: e.message.slice(0, 40),
        detail: e.message,
        time: new Date(e.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        ref: e.id.slice(-6),
      }))
    : ACTIVITY_FEED;

  return (
    <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line-1)" }}>
      <Section title="Live stream" right={<PulseDot />} />
      {items.map((a, i) => (
        <div key={i} style={{
          display: "grid",
          gridTemplateColumns: "22px 1fr",
          gap: 10,
          padding: "10px 0",
          borderBottom: i < items.length - 1 ? "1px dashed var(--line-1)" : "none",
        }}>
          <AgentGlyph slug={a.agentId} size={22} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, color: "var(--fg-1)", lineHeight: 1.5, letterSpacing: "-0.005em" }}>
              <span style={{ color: "var(--fg-0)", fontWeight: 500 }}>Growth</span>{" "}
              <span style={{ color: "var(--fg-2)" }}>{a.verb}</span>{" "}
              <span style={{ color: "var(--fg-0)" }}>{a.target}</span>
              {a.detail !== a.target && <span style={{ color: "var(--fg-3)" }}> — {a.detail}</span>}
            </div>
            <div style={{ marginTop: 4, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-3)", display: "flex", gap: 8 }}>
              <span>{a.time}</span>
              <span>·</span>
              <span>{a.ref}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ApprovalsTab() {
  return (
    <div style={{ padding: "14px 16px" }}>
      <Section title="Awaiting your decision" right={<ApprovalCountBadge />} />
      <div style={{
        background: "var(--bg-2)",
        border: "1px solid var(--line-2)",
        borderRadius: "var(--r-md)",
        padding: 12,
        marginBottom: 8,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, color: "var(--fg-1)" }}>
            <AgentGlyph slug="growth" size={16} />
            <span>Workspace</span>
          </div>
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9.5,
            color: "var(--fg-3)",
            background: "var(--bg-3)",
            padding: "1px 5px",
            borderRadius: 3,
            textTransform: "uppercase" as const,
            letterSpacing: "0.04em",
          }}>live</span>
        </div>
        <div style={{ fontSize: 12.5, color: "var(--fg-0)", marginBottom: 4, letterSpacing: "-0.005em" }}>Production approval queue</div>
        <div style={{ fontSize: 11.5, color: "var(--fg-2)", lineHeight: 1.5, marginBottom: 10 }}>
          Review artifacts, add decision notes, and approve or reject with a durable audit trail.
        </div>
        <Link className="btn" href="/workspace/approvals">
          Open approvals
        </Link>
      </div>
    </div>
  );
}

function MemoryTab() {
  return (
    <div style={{ padding: "14px 16px" }}>
      <Section title="Recent mutations" right={<span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-3)" }}>last 6h</span>} />
      {MEMORY_UPDATES.map((m, i) => (
        <div key={i} style={{
          padding: "10px 0",
          borderBottom: i < MEMORY_UPDATES.length - 1 ? "1px dashed var(--line-1)" : "none",
        }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--fg-3)", marginBottom: 4 }}>{m.key}</div>
          <div style={{ fontSize: 12.5, color: "var(--fg-0)", lineHeight: 1.5, marginBottom: 6 }}>{m.val}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-3)" }}>{m.by} · {m.time}</div>
        </div>
      ))}
    </div>
  );
}
