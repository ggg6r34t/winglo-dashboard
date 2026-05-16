'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { AgentIdentityIcon } from './agent-identity-icon'
import { AgentStatusBadge } from './agent-status-badge'
import { useOrchestrationStore } from '@/features/orchestration/hooks/use-orchestration-store'
import type { AgentConfig } from '@/lib/agents/registry'
import type { AgentStatus } from './agent-status-badge'

export interface HubTab {
  label: string
  href: string
}

interface AgentHubLayoutProps {
  agent: AgentConfig
  tabs: HubTab[]
  children: React.ReactNode
}

export function AgentHubLayout({ agent, tabs, children }: AgentHubLayoutProps) {
  const pathname = usePathname()
  const agentStates = useOrchestrationStore(s => s.agentStates)

  const status: AgentStatus = !agent.deployed
    ? 'not-deployed'
    : Object.values(agentStates).some(s => s === 'executing')
      ? 'active'
      : Object.values(agentStates).some(s => s === 'queued')
        ? 'queued'
        : 'idle'

  return (
    <div className="flex flex-col">
      {/* Identity header */}
      <div className="flex items-start gap-4 pb-5">
        <div className="w-12 h-12 rounded-xl bg-[var(--surface-raised)] border border-[var(--border-color)] flex items-center justify-center shrink-0">
          <AgentIdentityIcon slug={agent.slug} size={24} />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-base font-semibold text-[var(--text-primary)] leading-none">
              {agent.name}
            </h1>
            <AgentStatusBadge status={status} />
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1.5">{agent.department}</p>
        </div>
      </div>

      {/* Tab navigation */}
      {tabs.length > 0 && (
        <nav
          className="flex items-center gap-0.5 border-b border-[var(--border-color)] overflow-x-auto"
        >
          {tabs.map(tab => {
            const isBaseTab = tab.href === `/agents/${agent.slug}`
            const isActive = isBaseTab
              ? pathname === tab.href
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors',
                  isActive
                    ? 'border-[var(--accent)] text-[var(--text-primary)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
                )}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      )}

      {/* Tab content */}
      <div className="pt-6">{children}</div>
    </div>
  )
}
