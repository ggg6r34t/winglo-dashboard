import type { AIRun } from '@/types'
import { RunStatusBadge } from './run-status-badge'

interface RecentRunsListProps {
  runs: AIRun[]
}

function formatDuration(ms: number | null): string {
  if (ms === null) return '—'
  return `${(ms / 1000).toFixed(1)}s`
}

function formatTokens(tokens: number | null): string {
  if (tokens === null) return '—'
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}k`
  return String(tokens)
}

function capitalizeAgentType(agentType: AIRun['agent_type']): string {
  return agentType.charAt(0).toUpperCase() + agentType.slice(1)
}

export function RecentRunsList({ runs }: RecentRunsListProps) {
  return (
    <div>
      <h2
        style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '1rem',
        }}
      >
        Agent Runs
      </h2>

      {runs.length === 0 ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          No runs yet.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {runs.map((run, index) => (
            <div
              key={run.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                padding: '0.625rem 0',
                borderBottom:
                  index < runs.length - 1
                    ? '1px solid var(--border-color)'
                    : 'none',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                  }}
                >
                  {capitalizeAgentType(run.agent_type)}
                </span>
                <RunStatusBadge status={run.status} />
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                }}
              >
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {formatDuration(run.duration_ms)}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {run.tokens_used != null ? `${formatTokens(run.tokens_used)} tokens` : '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
