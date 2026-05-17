'use client'

import { useTransition } from 'react'
import type { OutreachDraft, OutreachChannel, OutreachStatus } from '@/types'
import { approveOutreachDraft, markOutreachSent } from '../server/actions'

const CHANNEL_LABELS: Record<OutreachChannel, string> = {
  email: 'Email',
  linkedin: 'LinkedIn',
  proposal: 'Proposal',
}

interface OutreachDraftCardProps {
  draft: OutreachDraft
}

export function OutreachDraftCard({ draft }: OutreachDraftCardProps) {
  const [isPending, startTransition] = useTransition()

  function handleApprove() {
    startTransition(async () => { await approveOutreachDraft(draft.id) })
  }

  function handleMarkSent() {
    startTransition(async () => { await markOutreachSent(draft.id) })
  }

  return (
    <div style={{
      background: 'var(--bg-2)',
      border: '1px solid var(--line-2)',
      borderRadius: 'var(--r-md)',
      padding: 14,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      opacity: isPending ? 0.6 : 1,
      pointerEvents: isPending ? 'none' : undefined,
      transition: 'opacity 120ms ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {CHANNEL_LABELS[draft.channel]}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {draft.status}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {draft.status === 'draft' && (
            <button className="btn-mini approve" disabled={isPending} onClick={handleApprove}>Approve</button>
          )}
          {draft.status === 'approved' && (
            <button className="btn-mini approve" disabled={isPending} onClick={handleMarkSent}>Mark Sent</button>
          )}
        </div>
      </div>

      {draft.subject && (
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-0)', letterSpacing: '-0.005em' }}>
          {draft.subject}
        </div>
      )}

      <pre style={{
        fontSize: 12, color: 'var(--fg-2)', whiteSpace: 'pre-wrap', fontFamily: 'inherit',
        lineHeight: 1.6, background: 'var(--bg-3)', borderRadius: 'var(--r-sm)',
        padding: '10px 12px', maxHeight: 220, overflowY: 'auto',
        border: '1px solid var(--line-1)', margin: 0,
      }}>
        {draft.body}
      </pre>

      {draft.sent_at && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)' }}>
          Sent {new Date(draft.sent_at).toLocaleDateString()}
        </span>
      )}
    </div>
  )
}
