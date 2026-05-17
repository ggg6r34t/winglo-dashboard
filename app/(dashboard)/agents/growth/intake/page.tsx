import { Skeleton } from '@/components/shared/skeleton'
import { getLatestBusinessProfile } from '@/server/dal/business-profiles'
import { MOCK_ORG_ID } from '@/lib/mock'
import { IntakeForm } from '@/features/intake/components/intake-form'
import { AnalysisDisplay } from '@/features/intake/components/analysis-display'

export default async function GrowthIntakePage() {
  const profile = await getLatestBusinessProfile(MOCK_ORG_ID)

  return (
    <div className="hub-body fade-in">
      {!profile || profile.status === 'draft' ? (
        <IntakeForm />
      ) : profile.status === 'processing' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--fg-2)' }}>
            <svg aria-hidden="true" className="animate-spin" style={{ width: 14, height: 14, color: 'var(--accent)' }} viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Analyzing your business...
          </div>
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-36 w-full rounded-lg" />
        </div>
      ) : (
        <AnalysisDisplay profile={profile!} />
      )}
    </div>
  )
}
