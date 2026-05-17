'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useOrchestrationStore } from '@/features/orchestration/hooks/use-orchestration-store'
import { AGENT_MAP, AGENTS_LIST } from '@/components/workspace/page-agent-glyph'
import type { AgentConfig, AgentSlug } from '@/lib/agents/registry'

export interface HubTab {
  label: string
  href: string
  count?: number
}

interface AgentHubLayoutProps {
  agent: AgentConfig
  tabs: HubTab[]
  children: React.ReactNode
}

const SLUG_TO_SHORT: Partial<Record<AgentSlug, string>> = {
  'growth':            'growth',
  'social-media':      'social',
  'seo':               'seo',
  'marketing':         'marketing',
  'telehealth':        'telehealth',
  'sales':             'sales',
  'research':          'research',
  'analytics-manager': 'analytics',
}

const PRESENCE_CLASS: Record<string, string> = {
  active:        'live',
  queued:        'wait',
  idle:          'idle',
  'not-deployed':'idle',
}

const STATUS_LABEL: Record<string, string> = {
  active:        'running',
  queued:        'queued',
  idle:          'standing by',
  'not-deployed':'not deployed',
}

export function AgentHubLayout({ agent, tabs, children }: AgentHubLayoutProps) {
  const pathname = usePathname()
  const agentStates = useOrchestrationStore(s => s.agentStates)

  const liveStatus: string = !agent.deployed
    ? 'not-deployed'
    : Object.values(agentStates).some(s => s === 'executing')
      ? 'active'
      : Object.values(agentStates).some(s => s === 'queued')
        ? 'queued'
        : 'idle'

  const shortId = SLUG_TO_SHORT[agent.slug]
  const glyphData = shortId ? AGENT_MAP[shortId] : null
  const agentEntry = shortId ? AGENTS_LIST.find(a => a.id === shortId) : null

  const glyphMark = glyphData?.mark ?? agent.name.slice(0, 2).toUpperCase()
  const glyphBg   = glyphData?.bg   ?? 'var(--bg-2)'
  const glyphFg   = glyphData?.fg   ?? 'var(--fg-0)'
  const agentName = glyphData?.name ?? agent.name
  const agentRole = glyphData?.role ?? agent.department
  const runs      = agentEntry?.runs ?? 0
  const lastSeen  = agentEntry?.lastSeen ?? '—'

  return (
    <div className="fade-in">
      <div className="hub-hero">
        <div className="hub-id">
          <div
            className="hub-glyph"
            style={{ background: glyphBg, color: glyphFg, borderColor: 'transparent' }}
          >
            {glyphMark}
          </div>
          <div className="hub-meta">
            <h1 className="hub-name">
              {agentName}
              <span className={"presence " + PRESENCE_CLASS[liveStatus]} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-2)', fontWeight: 400 }}>
                {STATUS_LABEL[liveStatus]}
              </span>
            </h1>
            <div className="hub-role">{agentRole}</div>
            <div className="hub-status-row">
              <div className="pair">
                <span>Runs</span>
                <span className="val">{runs.toLocaleString()}</span>
              </div>
              <div className="pair">
                <span>Last action</span>
                <span className="val">{lastSeen}</span>
              </div>
              <div className="pair">
                <span>Model</span>
                <span className="val">claude · sonnet · 4.5</span>
              </div>
              <div className="pair">
                <span>Memory</span>
                <span className="val">142 records</span>
              </div>
            </div>
          </div>
        </div>
        <div className="page-head-right">
          <Link href="/workspace" className="btn">← Workforce</Link>
          <button className="btn">Ask {agentName}</button>
          <button className="btn primary">Assign task</button>
        </div>
      </div>

      {tabs.length > 0 && (
        <div className="hub-tabs">
          {(() => {
            const seenActive = new Set<string>()
            return tabs.map(tab => {
              const isBaseTab = tab.href === `/agents/${agent.slug}`
              const wouldBeActive = isBaseTab
                ? pathname === tab.href
                : pathname === tab.href || pathname.startsWith(`${tab.href}/`)
              const isActive = wouldBeActive && !seenActive.has(tab.href)
              if (isActive) seenActive.add(tab.href)
              return (
                <Link
                  key={tab.label}
                  href={tab.href}
                  className={"hub-tab" + (isActive ? " active" : "")}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="count">{tab.count}</span>
                  )}
                </Link>
              )
            })
          })()}
        </div>
      )}

      <div>{children}</div>
    </div>
  )
}
