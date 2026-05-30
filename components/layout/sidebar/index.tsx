'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useOrchestrationStore } from '@/features/orchestration/hooks/use-orchestration-store'
import { AGENT_REGISTRY } from '@/lib/agents/registry'
import { InboxCountBadge } from '@/components/workspace/inbox-count-badge'
import { ApprovalCountBadge } from '@/components/workspace/approval-count-badge'

/* ── Agent glyph tones ──────────────────────────────────── */
const GLYPH_TONES: Record<string, { mark: string; bg: string; fg: string }> = {
  'growth':            { mark: 'AT', bg: 'oklch(0.32 0.05 60)',  fg: 'oklch(0.95 0.04 60)'  },
  'social-media':      { mark: 'LY', bg: 'oklch(0.30 0.06 320)', fg: 'oklch(0.94 0.04 320)' },
  'seo':               { mark: 'VG', bg: 'oklch(0.30 0.06 200)', fg: 'oklch(0.93 0.04 200)' },
  'marketing':         { mark: 'OR', bg: 'oklch(0.30 0.06 270)', fg: 'oklch(0.93 0.04 270)' },
  'sales':             { mark: 'HL', bg: 'oklch(0.30 0.06 145)', fg: 'oklch(0.93 0.04 145)' },
  'telehealth':        { mark: 'MR', bg: 'oklch(0.30 0.06 175)', fg: 'oklch(0.93 0.04 175)' },
  'analytics-manager': { mark: 'CA', bg: 'oklch(0.30 0.06 240)', fg: 'oklch(0.93 0.04 240)' },
  'research':          { mark: 'SB', bg: 'oklch(0.30 0.06 30)',  fg: 'oklch(0.94 0.04 30)'  },
  'outreach':          { mark: 'OT', bg: 'oklch(0.30 0.06 45)',  fg: 'oklch(0.94 0.04 45)'  },
}

/* ── Presence state for agents ──────────────────────────── */
type PresenceState = 'live' | 'work' | 'wait' | 'idle'

const PRESENCE_STYLE: Record<PresenceState, React.CSSProperties> = {
  live: { background: 'var(--accent)', boxShadow: '0 0 8px var(--accent-line)' },
  work: { background: 'var(--ok)',     boxShadow: '0 0 6px oklch(0.78 0.12 158 / 0.35)' },
  wait: { background: 'var(--warn)' },
  idle: { background: 'oklch(0.45 0.01 250)' },
}

/* ── Nav icon set ────────────────────────────────────────── */
function NavIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    home:        <><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/></>,
    inbox:       <><path d="M3 13h5l2 3h4l2-3h5"/><path d="M3 13l3-8h12l3 8v7H3z"/></>,
    check:       <path d="M5 12l4 4 10-10"/>,
    report:      <><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M10 13h6"/><path d="M10 17h4"/></>,
    chart:       <><path d="M4 20V8"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/></>,
    workflow:    <><circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M8 6h8"/><path d="M7 8l4 8"/><path d="M17 8l-4 8"/></>,
    memory:      <><path d="M4 7c0-2 2-3 4-3s4 1 4 3v10c0 2-2 3-4 3s-4-1-4-3"/><path d="M12 7c0-2 2-3 4-3s4 1 4 3v10c0 2-2 3-4 3s-4-1-4-3"/><path d="M4 11h16"/><path d="M4 14h16"/></>,
    plug:        <><path d="M8 2v4"/><path d="M16 2v4"/><path d="M5 6h14v6a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5z"/><path d="M12 17v5"/></>,
    audit:       <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    settings:    <><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></>,
    search:      <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    chevronUD:   <><path d="m8 9 4-4 4 4"/><path d="m16 15-4 4-4-4"/></>,
  }
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      {paths[name] || null}
    </svg>
  )
}

/* ── Nav item ────────────────────────────────────────────── */
function NavItem({ href, icon, label, badge, badgeNode, accentBadge }: { href: string; icon: string; label: string; badge?: string; badgeNode?: React.ReactNode; accentBadge?: boolean }) {
  const pathname = usePathname()
  const active = pathname === href || (href !== '/workspace' && pathname.startsWith(href))
  return (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '6px 8px',
        borderRadius: 'var(--r-sm)',
        fontSize: 12.5,
        color: active ? 'var(--fg-0)' : 'var(--fg-1)',
        background: active ? 'var(--bg-3)' : 'transparent',
        textDecoration: 'none',
        transition: 'background 120ms ease',
        position: 'relative',
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--bg-2)' }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
    >
      <span style={{ width: 14, height: 14, color: active ? 'var(--fg-0)' : 'var(--fg-2)', flexShrink: 0 }}>
        <NavIcon name={icon} />
      </span>
      <span>{label}</span>
      {(badge || badgeNode) && (
        <span style={{
          marginLeft: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: 10.5,
          color: accentBadge ? 'var(--accent)' : 'var(--fg-3)',
        }}>{badgeNode ?? badge}</span>
      )}
    </Link>
  )
}

/* ── Agent row ───────────────────────────────────────────── */
function AgentRow({ slug, name, role, presence }: { slug: string; name: string; role: string; presence: PresenceState }) {
  const pathname = usePathname()
  const href = `/agents/${slug}`
  const active = pathname.startsWith(href)
  const tone = GLYPH_TONES[slug] ?? { mark: slug.slice(0, 2).toUpperCase(), bg: 'var(--bg-3)', fg: 'var(--fg-1)' }

  return (
    <Link
      href={href}
      style={{
        display: 'grid',
        gridTemplateColumns: '24px 1fr auto',
        gap: 10,
        alignItems: 'center',
        padding: '6px 8px',
        borderRadius: 'var(--r-sm)',
        cursor: 'pointer',
        textDecoration: 'none',
        background: active ? 'var(--bg-3)' : 'transparent',
        transition: 'background 120ms ease',
        position: 'relative',
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--bg-2)' }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = active ? 'var(--bg-3)' : 'transparent' }}
    >
      {active && (
        <span style={{
          position: 'absolute',
          left: -1, top: '50%',
          transform: 'translateY(-50%)',
          height: 16, width: 2,
          background: 'var(--fg-0)',
          borderRadius: 2,
        }} />
      )}
      {/* Glyph */}
      <span style={{
        width: 24, height: 24,
        borderRadius: 6,
        background: tone.bg,
        color: tone.fg,
        display: 'grid',
        placeItems: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: 10.5,
        fontWeight: 600,
        letterSpacing: '-0.02em',
        border: '1px solid transparent',
        flexShrink: 0,
      }}>{tone.mark}</span>
      {/* Info */}
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 12.5, color: 'var(--fg-0)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
        <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)', letterSpacing: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{role}</span>
      </span>
      {/* Presence dot */}
      <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, ...PRESENCE_STYLE[presence] }} />
    </Link>
  )
}

/* ── Section label ───────────────────────────────────────── */
function SectionLabel({ children, trailing }: { children: React.ReactNode; trailing?: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '4px 8px 6px',
      fontFamily: 'var(--font-mono)',
      fontSize: 10.5,
      letterSpacing: '0.04em',
      color: 'var(--fg-3)',
      textTransform: 'uppercase',
    }}>
      {children}
      {trailing}
    </div>
  )
}

/* ── Main Sidebar ────────────────────────────────────────── */
export function Sidebar() {
  const agentStates = useOrchestrationStore(s => s.agentStates)

  function getPresence(slug: string): PresenceState {
    if (slug !== 'growth') return 'idle'
    const states = Object.values(agentStates)
    if (states.some(s => s === 'executing')) return 'live'
    if (states.some(s => s === 'queued')) return 'work'
    return 'idle'
  }

  return (
    <aside style={{
      background: 'var(--bg-1)',
      borderRight: '1px solid var(--line-1)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      overflow: 'hidden',
    }}>
      {/* Workspace switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 14px',
        borderBottom: '1px solid var(--line-1)',
        cursor: 'pointer',
        flexShrink: 0,
      }}>
        <span style={{
          width: 26, height: 26,
          borderRadius: 6,
          background: 'linear-gradient(135deg, oklch(0.35 0.02 250), oklch(0.22 0.01 250))',
          border: '1px solid var(--line-2)',
          display: 'grid',
          placeItems: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--fg-0)',
          flexShrink: 0,
        }}>W</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 12.5, fontWeight: 500, color: 'var(--fg-0)' }}>Winglo HQ</span>
          <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)', letterSpacing: 0 }}>acme.co · production</span>
        </span>
        <span style={{ color: 'var(--fg-3)', width: 13, height: 13 }}>
          <NavIcon name="chevronUD" />
        </span>
      </div>

      {/* Command palette */}
      <div style={{ padding: '10px 12px 4px', flexShrink: 0 }}>
        <button style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '7px 10px',
          background: 'var(--bg-2)',
          border: '1px solid var(--line-1)',
          borderRadius: 'var(--r-sm)',
          color: 'var(--fg-2)',
          fontSize: 12,
          cursor: 'pointer',
          transition: 'all 120ms ease',
          fontFamily: 'inherit',
        }}>
          <NavIcon name="search" />
          <span>Search or run a command</span>
          <span style={{
            marginLeft: 'auto',
            fontFamily: 'var(--font-mono)',
            fontSize: 10.5,
            color: 'var(--fg-3)',
            background: 'var(--bg-1)',
            border: '1px solid var(--line-1)',
            borderRadius: 3,
            padding: '1px 5px',
          }}>⌘K</span>
        </button>
      </div>

      {/* Zone 1 — Workspace nav */}
      <div style={{ padding: '12px 8px 4px', flexShrink: 0 }}>
        <SectionLabel>Workspace</SectionLabel>
        <NavItem href="/workspace" icon="home" label="Overview" />
        <NavItem href="/workspace/inbox" icon="inbox" label="Inbox" badgeNode={<InboxCountBadge />} />
        <NavItem href="/workspace/approvals" icon="check" label="Approvals" badgeNode={<ApprovalCountBadge />} accentBadge />
        <NavItem href="/workspace/reports" icon="report" label="Reports" />
        <NavItem href="/workspace/analytics" icon="chart" label="Analytics" />
      </div>

      {/* Zone 2 — AI Employees (scrollable) */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '14px 8px 4px' }}>
        <SectionLabel trailing={
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--fg-3)',
            background: 'var(--bg-2)',
            border: '1px solid var(--line-1)',
            borderRadius: 3,
            padding: '0 5px',
            height: 16,
            display: 'inline-flex',
            alignItems: 'center',
          }}>{AGENT_REGISTRY.length}</span>
        }>AI Employees</SectionLabel>
        {AGENT_REGISTRY.map(agent => (
          <AgentRow
            key={agent.slug}
            slug={agent.slug}
            name={agent.name}
            role={agent.department}
            presence={getPresence(agent.slug)}
          />
        ))}
      </div>

      {/* Zone 3 — Operations */}
      <div style={{ padding: '14px 8px 4px', borderTop: '1px solid var(--line-1)', flexShrink: 0 }}>
        <SectionLabel>Operations</SectionLabel>
        <NavItem href="/workspace/workflows" icon="workflow" label="Workflows" badge="9" />
        <NavItem href="/workspace/memory" icon="memory" label="Memory" />
        <NavItem href="/workspace/integrations" icon="plug" label="Integrations" badge="24" />
        <NavItem href="/workspace/audit" icon="audit" label="Audit log" />
      </div>

      {/* Footer — user */}
      <div style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--line-1)',
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
      }}>
        <span style={{
          width: 26, height: 26,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, oklch(0.55 0.04 60), oklch(0.35 0.03 60))',
          display: 'grid',
          placeItems: 'center',
          fontSize: 11,
          fontWeight: 500,
          color: 'var(--fg-0)',
          border: '1px solid var(--line-2)',
          flexShrink: 0,
        }}>JL</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: 12, color: 'var(--fg-0)' }}>Jordan Liu</span>
          <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)' }}>operator</span>
        </span>
        <Link href="/workspace/settings" style={{ color: 'var(--fg-3)', lineHeight: 0 }}>
          <NavIcon name="settings" />
        </Link>
      </div>
    </aside>
  )
}
