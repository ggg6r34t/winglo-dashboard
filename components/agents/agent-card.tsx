import Link from 'next/link'
import { cn } from '@/lib/utils'
import { AgentIdentityIcon } from './agent-identity-icon'
import { AgentStatusBadge } from './agent-status-badge'
import type { AgentConfig } from '@/lib/agents/registry'
import type { AgentStatus } from './agent-status-badge'

interface AgentCardProps {
  agent: AgentConfig
  status: AgentStatus
  currentTask?: string
  runsThisWeek?: number
  lastActiveAt?: string | null
}

export function AgentCard({
  agent,
  status,
  currentTask,
  runsThisWeek,
  lastActiveAt,
}: AgentCardProps) {
  const isDeployed = agent.deployed

  const card = (
    <div
      className={cn(
        'flex flex-col gap-4 p-5 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] transition-colors h-full',
        isDeployed
          ? 'hover:border-[var(--border-strong)] hover:bg-[var(--surface-raised)] cursor-pointer'
          : 'opacity-50',
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className={cn('w-10 h-10 rounded-lg bg-[var(--surface-raised)] border border-[var(--border-color)] flex items-center justify-center shrink-0', !isDeployed && 'opacity-60')}>
          <AgentIdentityIcon slug={agent.slug} size={20} />
        </div>
        <AgentStatusBadge status={status} />
      </div>

      {/* Identity */}
      <div className="flex-1">
        <p className="text-sm font-semibold text-[var(--text-primary)] leading-snug">{agent.name}</p>
        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{agent.department}</p>
        <p className="text-xs text-[var(--text-secondary)] mt-2 line-clamp-2">
          {currentTask ?? (isDeployed ? agent.standbyText : 'Pending deployment')}
        </p>
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-3 border-t border-[var(--border-color)]">
        <span>{runsThisWeek != null ? `${runsThisWeek} runs this week` : '—'}</span>
        <span>
          {lastActiveAt
            ? `Active ${new Date(lastActiveAt).toLocaleDateString()}`
            : isDeployed
              ? 'No runs yet'
              : 'Coming soon'}
        </span>
      </div>
    </div>
  )

  if (!isDeployed) return card

  return <Link href={`/agents/${agent.slug}`} className="block h-full">{card}</Link>
}
