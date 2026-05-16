'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/lib/stores/sidebar-store'
import { useOrchestrationStore } from '@/features/orchestration/hooks/use-orchestration-store'
import { AGENT_REGISTRY } from '@/lib/agents/registry'
import { WorkspaceNavItems } from './workspace-nav-items'
import { NavSection } from './nav-section'
import { AgentNavItem } from './agent-nav-item'
import { CollapseToggle } from './collapse-toggle'
import type { AgentStatus } from '@/components/agents/agent-status-badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function Sidebar() {
  const { collapsed, toggle } = useSidebarStore()
  const pathname = usePathname()
  const isSettingsActive = pathname === '/workspace/settings'
  const agentStates = useOrchestrationStore(s => s.agentStates)

  function getAgentStatus(slug: string): AgentStatus {
    if (slug !== 'growth') return 'not-deployed'
    const states = Object.values(agentStates)
    if (states.some(s => s === 'executing')) return 'active'
    if (states.some(s => s === 'queued')) return 'queued'
    return 'idle'
  }

  const settingsLink = (
    <Link
      href="/workspace/settings"
      className={cn(
        'flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors',
        isSettingsActive
          ? 'text-[var(--text-primary)] bg-[var(--surface-raised)]'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)]',
      )}
    >
      <Settings className="w-4 h-4 shrink-0" />
      {!collapsed && <span className="font-medium">Settings</span>}
    </Link>
  )

  return (
    <motion.aside
      layout
      animate={{ width: collapsed ? 52 : 220 }}
      transition={{ duration: 0.15, ease: 'easeInOut' }}
      className="fixed left-0 top-[52px] bottom-0 z-40 flex flex-col bg-[var(--surface)] border-r border-[var(--border-color)] overflow-hidden"
    >
      {/* Zone 1 — Workspace nav */}
      <div className="pt-3 pb-1">
        <NavSection label="Workspace" collapsed={collapsed}>
          <WorkspaceNavItems collapsed={collapsed} />
        </NavSection>
      </div>

      {/* Zone 2 — Agents (scrollable) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-1 min-h-0">
        <NavSection
          label="Agents"
          collapsed={collapsed}
          trailing={
            !collapsed ? (
              <Link
                href="/agents"
                className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              >
                View all
              </Link>
            ) : undefined
          }
        >
          {AGENT_REGISTRY.map(agent => (
            <AgentNavItem
              key={agent.slug}
              agent={agent}
              status={getAgentStatus(agent.slug)}
              collapsed={collapsed}
            />
          ))}
        </NavSection>
      </div>

      {/* Zone 3 — Sources (stub) */}
      <div className="py-1 border-t border-[var(--border-color)]">
        <NavSection label="Sources" collapsed={collapsed}>
          {!collapsed && (
            <p className="px-2 py-1.5 text-[11px] text-[var(--text-muted)]">
              Coming soon
            </p>
          )}
        </NavSection>
      </div>

      {/* Bottom — Settings + Collapse toggle */}
      <div className="border-t border-[var(--border-color)] p-2 flex flex-col gap-1">
        <TooltipProvider delayDuration={0}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>{settingsLink}</TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-[var(--surface-raised)] border-[var(--border-color)] text-xs"
              >
                Settings
              </TooltipContent>
            </Tooltip>
          ) : (
            settingsLink
          )}
        </TooltipProvider>
        <div className={cn('flex', collapsed ? 'justify-center' : 'justify-end')}>
          <CollapseToggle collapsed={collapsed} onToggle={toggle} />
        </div>
      </div>
    </motion.aside>
  )
}
