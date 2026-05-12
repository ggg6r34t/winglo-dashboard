'use client'

import type { AIRunStatus } from '@/types'

interface RunStatusBadgeProps {
  status: AIRunStatus
}

export function RunStatusBadge({ status }: RunStatusBadgeProps) {
  if (status === 'running') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.125rem 0.5rem',
          borderRadius: '9999px',
          fontSize: '0.7rem',
          fontWeight: 500,
          background: 'rgba(59,130,246,0.15)',
          color: '#3b82f6',
        }}
      >
        <span
          style={{
            position: 'relative',
            display: 'inline-flex',
            width: '0.5rem',
            height: '0.5rem',
          }}
        >
          <span
            className="animate-ping"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '9999px',
              background: '#3b82f6',
              opacity: 0.75,
            }}
          />
          <span
            style={{
              position: 'relative',
              display: 'inline-flex',
              borderRadius: '9999px',
              width: '0.5rem',
              height: '0.5rem',
              background: '#3b82f6',
            }}
          />
        </span>
        running
      </span>
    )
  }

  if (status === 'queued') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0.125rem 0.5rem',
          borderRadius: '9999px',
          fontSize: '0.7rem',
          fontWeight: 500,
          background: 'var(--surface-hover, rgba(148,163,184,0.15))',
          color: 'var(--text-muted)',
        }}
      >
        queued
      </span>
    )
  }

  if (status === 'complete') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0.125rem 0.5rem',
          borderRadius: '9999px',
          fontSize: '0.7rem',
          fontWeight: 500,
          background: 'rgba(34,197,94,0.15)',
          color: '#22c55e',
        }}
      >
        complete
      </span>
    )
  }

  // failed
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.125rem 0.5rem',
        borderRadius: '9999px',
        fontSize: '0.7rem',
        fontWeight: 500,
        background: 'rgba(239,68,68,0.15)',
        color: '#ef4444',
      }}
    >
      failed
    </span>
  )
}
