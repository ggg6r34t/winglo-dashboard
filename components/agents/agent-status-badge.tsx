import { cn } from '@/lib/utils'

export type AgentStatus = 'active' | 'queued' | 'idle' | 'not-deployed'

interface AgentStatusBadgeProps {
  status: AgentStatus
  className?: string
}

const CONFIG: Record<AgentStatus, { label: string; cls: string }> = {
  active: {
    label: 'Active',
    cls: 'bg-green-500/10 text-green-400 border border-green-500/20',
  },
  queued: {
    label: 'Queued',
    cls: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  },
  idle: {
    label: 'Idle',
    cls: 'bg-[var(--surface-raised)] text-[var(--text-muted)] border border-[var(--border-color)]',
  },
  'not-deployed': {
    label: 'Not Deployed',
    cls: 'bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border-color)] opacity-60',
  },
}

export function AgentStatusBadge({ status, className }: AgentStatusBadgeProps) {
  const { label, cls } = CONFIG[status]
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        cls,
        className,
      )}
    >
      {label}
    </span>
  )
}
