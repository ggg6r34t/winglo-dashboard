'use client'

import Link from 'next/link'
import { useState } from 'react'

const operations = [
  {
    label: 'Growth discovery',
    href: '/agents/growth/opportunities',
    description: 'Find and score new partnership or growth opportunities.',
  },
  {
    label: 'Workflow library',
    href: '/workspace/workflows',
    description: 'Create, review, or run configured workforce workflows.',
  },
  {
    label: 'Report archive',
    href: '/workspace/reports',
    description: 'Open generated reports and artifacts from the archive.',
  },
]

export function WorkspaceOperationLauncher() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" className="btn primary" onClick={() => setOpen(true)}>
        New operation
      </button>
      {open && (
        <div
          role="presentation"
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            background: 'rgba(0, 0, 0, 0.42)',
            display: 'grid',
            placeItems: 'start center',
            paddingTop: 96,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="New operation"
            onClick={event => event.stopPropagation()}
            style={{
              width: 'min(520px, calc(100vw - 32px))',
              background: 'var(--bg-1)',
              border: '1px solid var(--line-1)',
              borderRadius: 'var(--r-lg)',
              boxShadow: '0 18px 60px rgba(0,0,0,0.28)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: 18, borderBottom: '1px solid var(--line-1)', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-0)' }}>New operation</div>
                <div style={{ fontSize: 12, color: 'var(--fg-2)', marginTop: 4 }}>
                  Start from the production-ready Growth surfaces or workflow library.
                </div>
              </div>
              <button type="button" className="btn" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
            <div style={{ padding: 12, display: 'grid', gap: 10 }}>
              {operations.map(operation => (
                <Link
                  key={operation.href}
                  href={operation.href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: 'block',
                    padding: 14,
                    border: '1px solid var(--line-1)',
                    borderRadius: 'var(--r-md)',
                    textDecoration: 'none',
                    background: 'var(--bg-0)',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-0)' }}>{operation.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg-2)', marginTop: 4, lineHeight: 1.45 }}>{operation.description}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
