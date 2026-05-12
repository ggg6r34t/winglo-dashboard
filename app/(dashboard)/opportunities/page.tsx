import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { getOpportunities } from '@/server/dal/opportunities'
import { MOCK_ORG_ID } from '@/lib/mock'
import { FilterBar } from '@/features/opportunities/components/filter-bar'
import { OpportunityCard } from '@/features/opportunities/components/opportunity-card'
import type { OpportunityStatus } from '@/types'

interface PageProps {
  searchParams: Promise<{ status?: string; minScore?: string }>
}

export default async function OpportunitiesPage({ searchParams }: PageProps) {
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
    <>
      <PageHeader
        title="Opportunities"
        subtitle="AI-discovered partnership opportunities"
      />
      <FilterBar
        currentStatus={currentStatus}
        currentMinScore={currentMinScore}
        total={opportunities.length}
      />
      {opportunities.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-6a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"
              />
            </svg>
          }
          title="No opportunities found"
          description="Try adjusting your filters, or run Discovery from the Intake page."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {opportunities.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      )}
    </>
  )
}
