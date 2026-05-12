'use client'

import { useTransition } from 'react'
import type { OutreachDraft, OutreachChannel, OutreachStatus } from '@/types'
import { approveOutreachDraft, markOutreachSent } from '../server/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const CHANNEL_LABELS: Record<OutreachChannel, string> = {
  email: 'Email',
  linkedin: 'LinkedIn',
  proposal: 'Proposal',
}

const STATUS_STYLES: Record<OutreachStatus, string> = {
  draft: 'bg-[var(--surface-raised)] text-[var(--text-secondary)]',
  approved: 'bg-blue-500/10 text-blue-400',
  sent: 'bg-green-500/10 text-green-400',
  rejected: 'bg-red-500/10 text-red-400',
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
    <div className={cn(
      'rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-5 flex flex-col gap-4',
      isPending && 'opacity-60 pointer-events-none'
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-xs border-[var(--border-color)] text-[var(--text-muted)]">
            {CHANNEL_LABELS[draft.channel]}
          </Badge>
          <span className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize',
            STATUS_STYLES[draft.status]
          )}>
            {draft.status}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {draft.status === 'draft' && (
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={handleApprove}
              className="text-xs h-7 px-2.5 border-[var(--border-color)] hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/5"
            >
              Approve
            </Button>
          )}
          {draft.status === 'approved' && (
            <Button
              size="sm"
              disabled={isPending}
              onClick={handleMarkSent}
              className="text-xs h-7 px-2.5 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white"
            >
              Mark Sent
            </Button>
          )}
        </div>
      </div>

      {draft.subject && (
        <p className="text-sm font-medium text-[var(--text-primary)]">{draft.subject}</p>
      )}

      <pre className="text-xs text-[var(--text-secondary)] whitespace-pre-wrap font-sans leading-relaxed bg-[var(--surface-raised)] rounded-md p-4 max-h-64 overflow-y-auto border border-[var(--border-color)]">
        {draft.body}
      </pre>

      {draft.sent_at && (
        <p className="text-xs text-[var(--text-muted)]">
          Sent {new Date(draft.sent_at).toLocaleDateString()}
        </p>
      )}
    </div>
  )
}
