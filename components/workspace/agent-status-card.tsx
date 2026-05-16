import Link from 'next/link'
import { cn } from '@/lib/utils'
import { AgentIdentityIcon } from '@/components/agents/agent-identity-icon'
import { AgentStatusBadge } from '@/components/agents/agent-status-badge'
import type { AgentConfig } from '@/lib/agents/registry'
import type { AgentStatus } from '@/components/agents/agent-status-badge'

interface AgentStatusCardProps {
  agent: AgentConfig
  status: AgentStatus
  currentTask?: string
}

export function AgentStatusCard({ agent, status, currentTask }: AgentStatusCardProps) {
  const isDeployed = agent.deployed

  return (
    <Link
      href={`/agents/${agent.slug}`}
      className={cn(
        'flex flex-col gap-2 p-3 rounded-lg border border-[var(--border-color)] bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-raised)] transition-colors min-w-[150px]',
        !isDeployed && 'opacity-50 pointer-events-none',
      )}
    >
      <div className="flex items-center gap-2">
        <AgentIdentityIcon slug={agent.slug} size={20} />
        <AgentStatusBadge status={status} />
      </div>
      <p className="text-xs font-medium text-[var(--text-primary)] truncate">{agent.name}</p>
      <p className="text-[11px] text-[var(--text-muted)] truncate">
        {currentTask ?? (isDeployed ? agent.standbyText : 'Pending deployment')}
      </p>
    </Link>
  )
}
