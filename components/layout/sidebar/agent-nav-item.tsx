'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { AgentIdentityIcon } from '@/components/agents/agent-identity-icon'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { AgentConfig } from '@/lib/agents/registry'
import type { AgentStatus } from '@/components/agents/agent-status-badge'

const STATUS_DOT: Record<AgentStatus, string> = {
  active:         'bg-green-400',
  queued:         'bg-amber-400',
  idle:           'bg-[var(--text-muted)]',
  'not-deployed': 'bg-[var(--border-strong)]',
}

interface AgentNavItemProps {
  agent: AgentConfig
  status: AgentStatus
  collapsed: boolean
}

export function AgentNavItem({ agent, status, collapsed }: AgentNavItemProps) {
  const pathname = usePathname()
  const href = `/agents/${agent.slug}`
  const isActive = pathname === href || pathname.startsWith(`${href}/`)

  const content = (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-2 py-1.5 rounded-md transition-colors relative group',
        isActive
          ? 'text-[var(--text-primary)] bg-[var(--surface-raised)]'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)]',
        !agent.deployed && 'opacity-50',
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[var(--accent)] rounded-r-full" />
      )}
      <span className="relative shrink-0">
        <AgentIdentityIcon slug={agent.slug} size={14} />
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-[var(--surface)]',
            STATUS_DOT[status],
          )}
        />
      </span>
      {!collapsed && (
        <span className="truncate text-xs font-medium leading-none">{agent.name}</span>
      )}
    </Link>
  )

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent
            side="right"
            className="bg-[var(--surface-raised)] border-[var(--border-color)] text-xs"
          >
            {agent.name}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return content
}
