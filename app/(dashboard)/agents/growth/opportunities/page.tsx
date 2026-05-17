import { getOpportunities } from '@/server/dal/opportunities'
import { MOCK_ORG_ID } from '@/lib/mock'
import { FilterBar } from '@/features/opportunities/components/filter-bar'
import { OpportunityCard } from '@/features/opportunities/components/opportunity-card'
import type { OpportunityStatus } from '@/types'

interface PageProps {
  searchParams: Promise<{ status?: string; minScore?: string }>
}

export default async function GrowthOpportunitiesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const VALID_STATUSES = ['new', 'reviewing', 'approved', 'rejected', 'contacted'] as const
  const rawStatus = params.status
  const status = VALID_STATUSES.includes(rawStatus as (typeof VALID_STATUSES)[number])
    ? (rawStatus as OpportunityStatus)
    : undefined
  const minScore = params.minScore ? parseInt(params.minScore, 10) : undefined
  const currentStatus = (status as OpportunityStatus | 'all') || 'all'
  const currentMinScore = params.minScore ?? ''

  const opportunities = await getOpportunities(MOCK_ORG_ID, { status, minScore })

  return (
    <div className="fade-in">
      <FilterBar
        currentStatus={currentStatus}
        currentMinScore={currentMinScore}
        total={opportunities.length}
      />
      {opportunities.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--fg-3)', paddingTop: 24 }}>
          No opportunities found — try adjusting filters, or run Discovery from the Intake tab.
        </p>
      ) : (
        <div className="integ-grid-large" style={{ marginTop: 16 }}>
          {opportunities.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      )}
    </div>
  )
}
