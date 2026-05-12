'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Opportunity, OpportunityStatus, OpportunityType, OutreachChannel, OutreachTone } from '@/types'
import { updateOpportunityStatus } from '../server/actions'
import { generateOutreachDraft } from '@/features/outreach/server/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const TYPE_LABELS: Record<OpportunityType, string> = {
  integration: 'Integration',
  'co-marketing': 'Co-Marketing',
  reseller: 'Reseller',
  distribution: 'Distribution',
  technology: 'Technology',
  strategic: 'Strategic',
}

const STATUS_STYLES: Record<OpportunityStatus, string> = {
  new: 'bg-[var(--surface-raised)] text-[var(--text-secondary)]',
  reviewing: 'bg-blue-500/10 text-blue-400',
  approved: 'bg-green-500/10 text-green-400',
  rejected: 'bg-red-500/10 text-red-400',
  contacted: 'bg-purple-500/10 text-purple-400',
}

function ScoreBadge({ score }: { score: number }) {
  const colorClass =
    score >= 90
      ? 'bg-green-500/10 text-green-400 border-green-500/20'
      : score >= 70
      ? 'bg-lime-500/10 text-lime-400 border-lime-500/20'
      : score >= 50
      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      : 'bg-red-500/10 text-red-400 border-red-500/20'
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold border shrink-0',
        colorClass
      )}
    >
      {score}
    </span>
  )
}

interface OpportunityCardProps {
  opportunity: Opportunity
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const canAct =
    opportunity.status === 'new' || opportunity.status === 'reviewing'

  const [channel, setChannel] = useState<OutreachChannel>('email')
  const [tone, setTone] = useState<OutreachTone>('professional')
  const [isGenerating, startGenerating] = useTransition()
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [showRationale, setShowRationale] = useState(false)

  function handleStatusChange(status: OpportunityStatus) {
    startTransition(async () => {
      await updateOpportunityStatus(opportunity.id, status)
    })
  }

  function handleGenerateOutreach() {
    startGenerating(async () => {
      try {
        setGenerateError(null)
        await generateOutreachDraft(opportunity.id, channel, tone)
        router.push('/outreach')
      } catch (e) {
        setGenerateError(e instanceof Error ? e.message : 'Generation failed')
      }
    })
  }

  return (
    <div
      className={cn(
        'rounded-lg border bg-[var(--surface)] p-4 flex flex-col gap-3 transition-opacity',
        opportunity.status === 'rejected'
          ? 'border-[var(--border-color)] opacity-50'
          : 'border-[var(--border-color)]',
        isPending && 'opacity-60 pointer-events-none'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-[var(--text-primary)] leading-tight">
              {opportunity.company_name}
            </span>
            <Badge
              variant="outline"
              className="text-xs shrink-0 border-[var(--border-color)] text-[var(--text-muted)]"
            >
              {TYPE_LABELS[opportunity.opportunity_type]}
            </Badge>
          </div>
          {opportunity.company_url && (opportunity.company_url.startsWith('https://') || opportunity.company_url.startsWith('http://')) && (
            <a
              href={opportunity.company_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] truncate block mt-0.5"
            >
              {opportunity.company_url.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
        <ScoreBadge score={opportunity.score} />
      </div>

      {opportunity.company_description && (
        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
          {opportunity.company_description}
        </p>
      )}

      {opportunity.estimated_impact && (
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          <span className="text-[var(--text-secondary)] font-medium">Impact: </span>
          {opportunity.estimated_impact}
        </p>
      )}

      {opportunity.score_rationale && (
        <div className="mt-3">
          <button
            onClick={() => setShowRationale(r => !r)}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1"
          >
            {showRationale ? '▲ Hide rationale' : '▼ Show rationale'}
          </button>
          {showRationale && (
            <div className="mt-2 space-y-2 text-xs bg-[var(--surface-raised)] rounded p-3">
              {Object.entries(opportunity.score_rationale).map(([key, value]) => (
                <div key={key}>
                  <span className="text-[var(--text-muted)] capitalize">{key.replace(/_/g, ' ')}</span>
                  <p className="text-[var(--text-primary)] mt-0.5">{String(value)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-1 mt-auto">
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize',
            STATUS_STYLES[opportunity.status]
          )}
        >
          {opportunity.status}
        </span>
        {canAct && (
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => handleStatusChange('approved')}
              className="text-xs h-7 px-2.5 border-[var(--border-color)] hover:border-green-500/50 hover:text-green-400 hover:bg-green-500/5"
            >
              Approve
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={isPending}
              onClick={() => handleStatusChange('rejected')}
              className="text-xs h-7 px-2.5 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/5"
            >
              Reject
            </Button>
          </div>
        )}
      </div>

      {opportunity.status === 'approved' && (
        <div className="mt-3 pt-3 border-t border-[var(--border-color)] flex items-center gap-2 flex-wrap">
          <select
            value={channel}
            onChange={e => setChannel(e.target.value as OutreachChannel)}
            disabled={isGenerating}
            className="text-xs bg-[var(--surface-raised)] border border-[var(--border-color)] rounded px-2 py-1 text-[var(--text-primary)]"
          >
            <option value="email">Email</option>
            <option value="linkedin">LinkedIn</option>
            <option value="proposal">Proposal</option>
          </select>
          <select
            value={tone}
            onChange={e => setTone(e.target.value as OutreachTone)}
            disabled={isGenerating}
            className="text-xs bg-[var(--surface-raised)] border border-[var(--border-color)] rounded px-2 py-1 text-[var(--text-primary)]"
          >
            <option value="professional">Professional</option>
            <option value="warm">Warm</option>
            <option value="direct">Direct</option>
          </select>
          <button
            onClick={handleGenerateOutreach}
            disabled={isGenerating}
            className="text-xs px-3 py-1 rounded bg-[var(--accent)] text-white hover:opacity-90 disabled:opacity-50"
          >
            {isGenerating ? 'Generating...' : 'Generate Draft'}
          </button>
          {generateError && (
            <span className="text-xs text-[var(--destructive)]">{generateError}</span>
          )}
        </div>
      )}
    </div>
  )
}
