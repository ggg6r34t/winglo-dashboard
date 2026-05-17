'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Opportunity, OpportunityStatus, OpportunityType, OutreachChannel, OutreachTone } from '@/types'
import { updateOpportunityStatus } from '../server/actions'
import { generateOutreachDraft } from '@/features/outreach/server/actions'

const TYPE_LABELS: Record<OpportunityType, string> = {
  integration: 'Integration',
  'co-marketing': 'Co-Marketing',
  reseller: 'Reseller',
  distribution: 'Distribution',
  technology: 'Technology',
  strategic: 'Strategic',
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 90 ? 'var(--ok)' :
    score >= 70 ? 'oklch(0.80 0.15 130)' :
    score >= 50 ? 'var(--warn)' :
    'var(--bad)'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 36, height: 36, borderRadius: '50%',
      border: '1px solid currentColor', color,
      fontSize: 12, fontWeight: 700, flexShrink: 0,
      fontFamily: 'var(--font-mono)',
    }}>
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
  const canAct = opportunity.status === 'new' || opportunity.status === 'reviewing'

  const [channel, setChannel] = useState<OutreachChannel>('email')
  const [tone, setTone] = useState<OutreachTone>('professional')
  const [isGenerating, startGenerating] = useTransition()
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [showRationale, setShowRationale] = useState(false)

  function handleStatusChange(status: OpportunityStatus) {
    startTransition(async () => { await updateOpportunityStatus(opportunity.id, status) })
  }

  function handleGenerateOutreach() {
    startGenerating(async () => {
      try {
        setGenerateError(null)
        await generateOutreachDraft(opportunity.id, channel, tone)
        router.push('/agents/growth/outreach')
      } catch (e) {
        setGenerateError(e instanceof Error ? e.message : 'Generation failed')
      }
    })
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
      transition: 'opacity 120ms ease',
      opacity: opportunity.status === 'rejected' ? 0.5 : isPending ? 0.6 : 1,
      pointerEvents: isPending ? 'none' : undefined,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-0)', letterSpacing: '-0.005em' }}>
              {opportunity.company_name}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {TYPE_LABELS[opportunity.opportunity_type]}
            </span>
          </div>
          {opportunity.company_url && (opportunity.company_url.startsWith('https://') || opportunity.company_url.startsWith('http://')) && (
            <a
              href={opportunity.company_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 11, color: 'var(--fg-3)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {opportunity.company_url.replace(/^https?:\/\//, '')}
            </a>
          )}
        </div>
        <ScoreBadge score={opportunity.score} />
      </div>

      {opportunity.company_description && (
        <p style={{ fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.5, margin: 0,
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {opportunity.company_description}
        </p>
      )}

      {opportunity.estimated_impact && (
        <p style={{ fontSize: 12, color: 'var(--fg-3)', lineHeight: 1.5, margin: 0 }}>
          <span style={{ color: 'var(--fg-1)', fontWeight: 500 }}>Impact: </span>
          {opportunity.estimated_impact}
        </p>
      )}

      {opportunity.score_rationale && (
        <div>
          <button
            onClick={() => setShowRationale(r => !r)}
            style={{ fontSize: 11, color: 'var(--fg-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            {showRationale ? '▲ Hide rationale' : '▼ Show rationale'}
          </button>
          {showRationale && (
            <div style={{ marginTop: 8, padding: '10px 12px', background: 'var(--bg-3)', borderRadius: 'var(--r-sm)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {Object.entries(opportunity.score_rationale).map(([key, value]) => (
                <div key={key}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fg-1)' }}>{String(value)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {opportunity.status}
        </span>
        {canAct && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button className="btn-mini approve" disabled={isPending} onClick={() => handleStatusChange('approved')}>
              Approve
            </button>
            <button className="btn-mini" disabled={isPending} onClick={() => handleStatusChange('rejected')}>
              Reject
            </button>
          </div>
        )}
      </div>

      {opportunity.status === 'approved' && (
        <div style={{ marginTop: 4, paddingTop: 10, borderTop: '1px solid var(--line-1)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <select
            value={channel}
            onChange={e => setChannel(e.target.value as OutreachChannel)}
            disabled={isGenerating}
            style={{ fontSize: 12, background: 'var(--bg-3)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', padding: '3px 8px', color: 'var(--fg-1)', fontFamily: 'inherit' }}
          >
            <option value="email">Email</option>
            <option value="linkedin">LinkedIn</option>
            <option value="proposal">Proposal</option>
          </select>
          <select
            value={tone}
            onChange={e => setTone(e.target.value as OutreachTone)}
            disabled={isGenerating}
            style={{ fontSize: 12, background: 'var(--bg-3)', border: '1px solid var(--line-2)', borderRadius: 'var(--r-sm)', padding: '3px 8px', color: 'var(--fg-1)', fontFamily: 'inherit' }}
          >
            <option value="professional">Professional</option>
            <option value="warm">Warm</option>
            <option value="direct">Direct</option>
          </select>
          <button className="btn" onClick={handleGenerateOutreach} disabled={isGenerating} style={{ opacity: isGenerating ? 0.5 : 1 }}>
            {isGenerating ? 'Generating...' : 'Generate Draft'}
          </button>
          {generateError && (
            <span style={{ fontSize: 11, color: 'var(--bad)' }}>{generateError}</span>
          )}
        </div>
      )}
    </div>
  )
}
