'use client'

import { useState, useTransition } from 'react'
import type { AnalyticsOutput } from '@/lib/ai/prompts/analytics-agent'
import { generateAnalyticsInsights } from '@/features/analytics/server/actions'

interface InsightsPanelProps {
  initial: AnalyticsOutput | null
}

function TrendArrow({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  if (trend === 'up') return <span style={{ color: 'var(--ok)' }}>↑</span>
  if (trend === 'down') return <span style={{ color: 'var(--bad)' }}>↓</span>
  return <span style={{ color: 'var(--fg-3)' }}>→</span>
}

export function InsightsPanel({ initial }: InsightsPanelProps) {
  const [data, setData] = useState<AnalyticsOutput | null>(initial)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleRegenerate() {
    startTransition(async () => {
      try {
        const result = await generateAnalyticsInsights()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate insights.')
      }
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button
          onClick={handleRegenerate}
          disabled={isPending}
          className="btn"
          style={{ opacity: isPending ? 0.6 : 1 }}
        >
          {isPending ? (
            <>
              <svg style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Generating…
            </>
          ) : (
            'Regenerate Insights'
          )}
        </button>
      </div>

      {error && (
        <p style={{ fontSize: 12, color: 'var(--bad)', marginBottom: 14, padding: '8px 10px', background: 'var(--bad-soft)', borderRadius: 'var(--r-sm)' }}>
          {error}
        </p>
      )}

      {data ? (
        <>
          <p style={{ fontSize: 13, color: 'var(--fg-2)', marginBottom: 16, lineHeight: 1.6 }}>
            {data.summary}
          </p>

          {data.highlight_metric && (
            <div style={{
              display: 'inline-flex', flexDirection: 'column',
              background: 'var(--bg-3)', border: '1px solid var(--line-1)',
              borderRadius: 'var(--r-sm)', padding: '10px 16px', marginBottom: 16,
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)', marginBottom: 4 }}>
                {data.highlight_metric.label}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--fg-0)', letterSpacing: '-0.02em' }}>
                  {data.highlight_metric.value}
                </span>
                <TrendArrow trend={data.highlight_metric.trend} />
              </span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                Insights
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.insights.map((insight, i) => (
                  <li key={i} style={{ fontSize: 12, color: 'var(--fg-2)', paddingLeft: 14, position: 'relative', lineHeight: 1.5 }}>
                    <span style={{ position: 'absolute', left: 0, top: '0.4em', width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                Recommendations
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.recommendations.map((rec, i) => (
                  <li key={i} style={{ fontSize: 12, color: 'var(--fg-2)', paddingLeft: 14, position: 'relative', lineHeight: 1.5 }}>
                    <span style={{ position: 'absolute', left: 0, top: '0.4em', width: 5, height: 5, borderRadius: '50%', background: 'var(--ok)', display: 'inline-block' }} />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : (
        <p style={{ fontSize: 13, color: 'var(--fg-3)' }}>
          No insights yet — click Regenerate Insights to analyze the last 30 days.
        </p>
      )}
    </div>
  )
}
