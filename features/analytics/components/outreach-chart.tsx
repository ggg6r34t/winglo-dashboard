import type { AnalyticsSnapshot } from '@/types'

interface OutreachChartProps {
  snapshots: AnalyticsSnapshot[]
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function OutreachChart({ snapshots }: OutreachChartProps) {
  const last30 = snapshots.slice(-30)

  if (last30.length === 0) {
    return (
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-color)',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
        }}
      >
        No outreach data available.
      </div>
    )
  }

  const maxSent = Math.max(...last30.map(s => s.metrics.outreach_sent), 1)

  const BAR_WIDTH = 6
  const BAR_GAP = 2
  const GROUP_GAP = 8
  const CHART_HEIGHT = 120
  const LABEL_HEIGHT = 24

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '1.5rem',
      }}
    >
      <h2
        style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: '1.25rem',
        }}
      >
        Daily Outreach — Last 30 Days
      </h2>

      <div style={{ overflowX: 'auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: `${GROUP_GAP}px`,
            minWidth: 'max-content',
            paddingBottom: `${LABEL_HEIGHT}px`,
            position: 'relative',
          }}
        >
          {last30.map((snapshot, idx) => {
            const sentPct = snapshot.metrics.outreach_sent / maxSent
            const approvedPct = snapshot.metrics.outreach_approved / maxSent
            const sentHeight = Math.max(Math.round(sentPct * CHART_HEIGHT), 2)
            const approvedHeight = Math.min(Math.max(Math.round(approvedPct * CHART_HEIGHT), 2), CHART_HEIGHT)
            const showLabel = idx % 5 === 0

            return (
              <div
                key={snapshot.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                }}
                title={`${formatDate(snapshot.snapshot_date)}: sent=${snapshot.metrics.outreach_sent}, approved=${snapshot.metrics.outreach_approved}`}
              >
                {/* Bar group */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: `${BAR_GAP}px`,
                    height: `${CHART_HEIGHT}px`,
                  }}
                >
                  <div
                    style={{
                      width: `${BAR_WIDTH}px`,
                      height: `${sentHeight}px`,
                      background: 'var(--accent, #6366f1)',
                      borderRadius: '2px 2px 0 0',
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      width: `${BAR_WIDTH}px`,
                      height: `${approvedHeight}px`,
                      background: 'var(--color-success, #22c55e)',
                      borderRadius: '2px 2px 0 0',
                      flexShrink: 0,
                    }}
                  />
                </div>

                {/* x-axis label */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: `-${LABEL_HEIGHT}px`,
                    fontSize: '0.625rem',
                    color: showLabel ? 'var(--text-muted)' : 'transparent',
                    whiteSpace: 'nowrap',
                    transform: 'rotate(-30deg)',
                    transformOrigin: 'top left',
                    left: '50%',
                    userSelect: 'none',
                  }}
                  aria-hidden={!showLabel}
                >
                  {formatDate(snapshot.snapshot_date)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          marginTop: '2rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span
            style={{
              display: 'inline-block',
              width: '0.625rem',
              height: '0.625rem',
              borderRadius: '50%',
              background: 'var(--accent, #6366f1)',
            }}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Outreach Sent</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span
            style={{
              display: 'inline-block',
              width: '0.625rem',
              height: '0.625rem',
              borderRadius: '50%',
              background: 'var(--color-success, #22c55e)',
            }}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Outreach Approved</span>
        </div>
      </div>
    </div>
  )
}
