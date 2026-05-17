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
      <p style={{ fontSize: 13, color: 'var(--fg-3)', paddingTop: 8 }}>
        No outreach data yet.
      </p>
    )
  }

  const maxSent = Math.max(...last30.map(s => s.metrics.outreach_sent), 1)

  const BAR_WIDTH = 6
  const BAR_GAP = 2
  const GROUP_GAP = 8
  const CHART_HEIGHT = 120
  const LABEL_HEIGHT = 24

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: `${GROUP_GAP}px`,
          minWidth: 'max-content',
          paddingBottom: `${LABEL_HEIGHT}px`,
          position: 'relative',
        }}>
          {last30.map((snapshot, idx) => {
            const sentPct = snapshot.metrics.outreach_sent / maxSent
            const approvedPct = snapshot.metrics.outreach_approved / maxSent
            const sentHeight = Math.max(Math.round(sentPct * CHART_HEIGHT), 2)
            const approvedHeight = Math.min(Math.max(Math.round(approvedPct * CHART_HEIGHT), 2), CHART_HEIGHT)
            const showLabel = idx % 5 === 0

            return (
              <div key={snapshot.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}
                title={`${formatDate(snapshot.snapshot_date)}: sent=${snapshot.metrics.outreach_sent}, approved=${snapshot.metrics.outreach_approved}`}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: `${BAR_GAP}px`, height: `${CHART_HEIGHT}px` }}>
                  <div style={{ width: BAR_WIDTH, height: sentHeight, background: 'var(--accent)', borderRadius: '2px 2px 0 0', flexShrink: 0 }} />
                  <div style={{ width: BAR_WIDTH, height: approvedHeight, background: 'var(--ok)', borderRadius: '2px 2px 0 0', flexShrink: 0 }} />
                </div>
                <div style={{
                  position: 'absolute', bottom: -LABEL_HEIGHT,
                  fontSize: 10, color: showLabel ? 'var(--fg-3)' : 'transparent',
                  whiteSpace: 'nowrap', transform: 'rotate(-30deg)',
                  transformOrigin: 'top left', left: '50%', userSelect: 'none',
                }} aria-hidden={!showLabel}>
                  {formatDate(snapshot.snapshot_date)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, marginTop: 28, paddingTop: 10, borderTop: '1px solid var(--line-1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)' }}>Sent</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--ok)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)' }}>Approved</span>
        </div>
      </div>
    </div>
  )
}
