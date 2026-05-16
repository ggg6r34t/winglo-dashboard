import type { AgentConfig } from '@/lib/agents/registry'

interface NotDeployedViewProps {
  agent: AgentConfig
}

export function NotDeployedView({ agent }: NotDeployedViewProps) {
  return (
    <div className="max-w-lg py-8">
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
        {agent.mission}
      </p>

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">
          Planned capabilities
        </p>
        <ul className="flex flex-col gap-2">
          {agent.capabilities.map(cap => (
            <li key={cap} className="flex items-start gap-2.5">
              <span className="mt-1 w-1 h-1 rounded-full bg-[var(--text-muted)] shrink-0" />
              <span className="text-sm text-[var(--text-secondary)]">{cap}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--border-strong)]" />
        Deployment pending
      </div>
    </div>
  )
}
