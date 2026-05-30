'use client'

import { useMemo, useState, useTransition } from 'react'
import type { Approval } from '@/types'

interface ApprovalReviewActions {
  approve: (id: string, decisionNote?: string) => Promise<void>
  reject: (id: string, decisionNote: string) => Promise<void>
}

export function ApprovalReviewClient({
  approvals,
  actions,
}: {
  approvals: Approval[]
  actions: ApprovalReviewActions
}) {
  const [items, setItems] = useState(approvals)
  const [activeId, setActiveId] = useState(approvals[0]?.id ?? null)
  const [decisionNote, setDecisionNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const active = useMemo(
    () => items.find(item => item.id === activeId) ?? items[0] ?? null,
    [activeId, items],
  )

  function runDecision(kind: 'approved' | 'rejected', target = active) {
    if (!target) return
    const note = decisionNote.trim()
    if (kind === 'rejected' && !note) {
      setActiveId(target.id)
      setError('Rejection note is required.')
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        if (kind === 'approved') await actions.approve(target.id, note || undefined)
        if (kind === 'rejected') await actions.reject(target.id, note)
        setItems(current => current.filter(item => item.id !== target.id))
        setActiveId(current => {
          const remaining = items.filter(item => item.id !== target.id)
          return current === target.id ? remaining[0]?.id ?? null : current
        })
        setDecisionNote('')
      } catch (decisionError) {
        setError(decisionError instanceof Error ? decisionError.message : 'Decision failed. Please try again.')
      }
    })
  }

  if (items.length === 0) {
    return <div className="tab-empty">No approvals are waiting.</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map(item => {
        const isActive = item.id === active?.id
        return (
          <div
            key={item.id}
            style={{
              background: 'var(--bg-1)',
              border: `1px solid ${isActive ? 'var(--line-2)' : 'var(--line-1)'}`,
              borderRadius: 'var(--r-lg)',
              padding: 14,
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 12,
            }}
          >
            <div>
              <button
                type="button"
                onClick={() => setActiveId(item.id)}
                style={{ display: 'block', width: '100%', padding: 0, border: 0, background: 'transparent', textAlign: 'left', fontFamily: 'inherit', color: 'inherit', cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: 'var(--fg-0)', fontWeight: 500 }}>
                    {item.title}
                  </span>
                  <span className={`urgency ${item.urgency}`}>
                    {item.urgency.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.5 }}>
                  {item.summary}
                </div>
                <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)' }}>
                  {item.agent_slug} / {item.approval_type}
                  {item.entity_type ? ` / ${item.entity_type}` : ''}
                </div>
              </button>

              {isActive && (
                <div style={{ marginTop: 12 }}>
                  <label htmlFor="approval-decision-note" style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Decision note
                  </label>
                  <textarea
                    id="approval-decision-note"
                    value={decisionNote}
                    onChange={event => setDecisionNote(event.target.value)}
                    placeholder="Required for rejection. Optional context for approval."
                    rows={2}
                    style={{ width: '100%', marginTop: 8, resize: 'vertical', background: 'var(--bg-0)', color: 'var(--fg-0)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-md)', padding: 10, fontFamily: 'inherit', fontSize: 13 }}
                  />
                  {error && <div className="tab-empty" style={{ color: 'var(--bad)', marginTop: 8 }}>{error}</div>}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, paddingTop: 2 }}>
              <button type="button" className="btn-mini approve" disabled={isPending} onClick={() => { setActiveId(item.id); runDecision('approved', item) }}>Approve</button>
              <button type="button" className="btn-mini" disabled={isPending} onClick={() => { setActiveId(item.id); runDecision('rejected', item) }}>Reject</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
