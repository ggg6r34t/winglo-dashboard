'use client'

import { useState, useTransition } from 'react'
import type { AnalyticsOutput } from '@/lib/ai/prompts/analytics-agent'
import { generateAnalyticsInsights } from '@/features/analytics/server/actions'

interface InsightsPanelProps {
  initial: AnalyticsOutput | null
}

function TrendArrow({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  if (trend === 'up') return <span style={{ color: 'var(--color-success, #22c55e)' }}>↑</span>
  if (trend === 'down') return <span style={{ color: 'var(--color-error, #ef4444)' }}>↓</span>
  return <span style={{ color: 'var(--text-muted)' }}>→</span>
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
        setError(null)  // clear error only on success, inside transition
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate insights.')
      }
    })
  }

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '0.5rem',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          gap: '1rem',
        }}
      >
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}
        >
          AI Insights
        </h2>
        <button
          onClick={handleRegenerate}
          aria-disabled={isPending}
          disabled={isPending}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.375rem 0.875rem',
            fontSize: '0.8125rem',
            fontWeight: 500,
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: isPending ? 'not-allowed' : 'pointer',
            opacity: isPending ? 0.7 : 1,
            flexShrink: 0,
          }}
        >
          {isPending ? (
            <>
              <svg
                style={{ width: '0.875rem', height: '0.875rem', animation: 'spin 1s linear infinite' }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
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
        <p
          style={{
            fontSize: '0.8125rem',
            color: 'var(--color-error, #ef4444)',
            marginBottom: '1rem',
            padding: '0.625rem',
            background: 'rgba(239,68,68,0.08)',
            borderRadius: '0.375rem',
          }}
        >
          {error}
        </p>
      )}

      {data ? (
        <>
          {/* Summary */}
          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--text-secondary, var(--text-muted))',
              marginBottom: '1.25rem',
              lineHeight: 1.6,
            }}
          >
            {data.summary}
          </p>

          {/* Highlight metric */}
          {data.highlight_metric && (
            <div
              style={{
                display: 'inline-flex',
                flexDirection: 'column',
                background: 'var(--surface-secondary, var(--surface))',
                border: '1px solid var(--border-color)',
                borderRadius: '0.375rem',
                padding: '0.75rem 1.25rem',
                marginBottom: '1.25rem',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                {data.highlight_metric.label}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {data.highlight_metric.value}
                </span>
                <TrendArrow trend={data.highlight_metric.trend} />
              </span>
            </div>
          )}

          {/* Two-column layout: insights + recommendations */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '0.625rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Insights
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {data.insights.map((insight, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--text-secondary, var(--text-muted))',
                      paddingLeft: '1rem',
                      position: 'relative',
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: '0.4em',
                        width: '0.375rem',
                        height: '0.375rem',
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        display: 'inline-block',
                      }}
                    />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '0.625rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Recommendations
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {data.recommendations.map((rec, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--text-secondary, var(--text-muted))',
                      paddingLeft: '1rem',
                      position: 'relative',
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: '0.4em',
                        width: '0.375rem',
                        height: '0.375rem',
                        borderRadius: '50%',
                        background: 'var(--color-success, #22c55e)',
                        display: 'inline-block',
                      }}
                    />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : (
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          No insights available yet.
        </p>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
