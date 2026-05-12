interface MetricCardProps {
  label: string
  value: string | number
  sub?: string
  trend?: 'up' | 'down' | 'flat' | null
}

function TrendArrow({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  if (trend === 'up') {
    return (
      <span
        style={{ color: 'var(--accent)', fontSize: '1rem', lineHeight: 1 }}
        aria-label="trending up"
      >
        ↑
      </span>
    )
  }
  if (trend === 'down') {
    return (
      <span
        style={{ color: 'var(--color-error, #ef4444)', fontSize: '1rem', lineHeight: 1 }}
        aria-label="trending down"
      >
        ↓
      </span>
    )
  }
  return (
    <span
      style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1 }}
      aria-label="flat trend"
    >
      →
    </span>
  )
}

export function MetricCard({ label, value, sub, trend }: MetricCardProps) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '0.5rem',
        padding: '1.25rem',
      }}
    >
      <p
        style={{
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.5rem',
        }}
      >
        {label}
      </p>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
        }}
      >
        <span
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        {trend != null && <TrendArrow trend={trend} />}
      </div>
      {sub && (
        <p
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginTop: '0.375rem',
          }}
        >
          {sub}
        </p>
      )}
    </div>
  )
}
