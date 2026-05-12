import type { AIRun } from '@/types'
import { RunStatusBadge } from './run-status-badge'

interface ActivityFeedProps {
  runs: AIRun[]
}

function relativeTime(isoString: string): string {
  const rawDiff = Date.now() - new Date(isoString).getTime()
  if (isNaN(rawDiff)) return 'unknown'
  const diffMs = Math.max(0, rawDiff)
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return 'just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr} hr ago`
  const diffDays = Math.floor(diffHr / 24)
  return `${diffDays} days ago`
}

function agentLabel(agentType: AIRun['agent_type']): string {
  const labels: Record<AIRun['agent_type'], string> = {
    intake: 'Intake',
    research: 'Research',
    discovery: 'Discovery',
    scoring: 'Scoring',
    outreach: 'Outreach',
    memory: 'Memory',
    analytics: 'Analytics',
  }
  return labels[agentType]
}

export function ActivityFeed({ runs }: ActivityFeedProps) {
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
        Recent Activity
      </h2>

      {runs.length === 0 ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          No agent runs yet.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {runs.map((run, index) => (
            <div
              key={run.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '0.75rem 0',
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
                  gap: '0.75rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    minWidth: '4.5rem',
                  }}
                >
                  {agentLabel(run.agent_type)}
                </span>
                <RunStatusBadge status={run.status} />
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginLeft: 'auto',
                  }}
                >
                  {relativeTime(run.created_at)}
                </span>
              </div>
              {run.error && (
                <p
                  style={{
                    fontSize: '0.7rem',
                    color: '#ef4444',
                    marginTop: '0.25rem',
                    paddingLeft: '5.25rem',
                  }}
                >
                  {run.error.length > 60
                    ? run.error.slice(0, 60) + '…'
                    : run.error}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
