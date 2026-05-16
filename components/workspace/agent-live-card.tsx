import Link from 'next/link'
import { cn } from '@/lib/utils'
import { AgentIdentityIcon } from '@/components/agents/agent-identity-icon'
import { AgentStatusBadge } from '@/components/agents/agent-status-badge'
import type { AgentConfig } from '@/lib/agents/registry'
import type { AgentStatus } from '@/components/agents/agent-status-badge'

interface AgentLiveCardProps {
  agent: AgentConfig
  status: AgentStatus
  currentTask?: string
  lastRunAt?: string | null
  tokensUsed?: number | null
}

export function AgentLiveCard({
  agent,
  status,
  currentTask,
  lastRunAt,
  tokensUsed,
}: AgentLiveCardProps) {
  return (
    <Link
      href={`/agents/${agent.slug}`}
      className={cn(
        'flex flex-col gap-3 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-raised)] transition-colors',
        !agent.deployed && 'opacity-40 pointer-events-none',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="w-10 h-10 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-color)] flex items-center justify-center shrink-0">
          <AgentIdentityIcon slug={agent.slug} size={20} />
        </div>
        <AgentStatusBadge status={status} />
      </div>

      <div>
        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{agent.name}</p>
        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{agent.department}</p>
      </div>

      <p className="text-xs text-[var(--text-secondary)] line-clamp-2 min-h-[2rem]">
        {currentTask ?? (agent.deployed ? agent.standbyText : 'Pending deployment')}
      </p>

      {agent.deployed && (
        <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-1 border-t border-[var(--border-color)]">
          <span>{tokensUsed != null ? `${tokensUsed.toLocaleString()} tokens` : '—'}</span>
          <span>{lastRunAt ? new Date(lastRunAt).toLocaleDateString() : 'No runs yet'}</span>
        </div>
      )}
    </Link>
  )
}
