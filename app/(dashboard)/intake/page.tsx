import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/shared/skeleton'
import { getLatestBusinessProfile } from '@/server/dal/business-profiles'
import { MOCK_ORG_ID } from '@/lib/mock'
import { IntakeForm } from '@/features/intake/components/intake-form'
import { AnalysisDisplay } from '@/features/intake/components/analysis-display'

export default async function IntakePage() {
  const profile = await getLatestBusinessProfile(MOCK_ORG_ID)
  const hasCompleteProfile = profile?.status === 'complete'

  return (
    <>
      <PageHeader
        title="Business Intake"
        subtitle={
          hasCompleteProfile
            ? `Analysis for ${profile!.name}`
            : 'Submit your business for AI analysis'
        }
      />
      <div className="max-w-2xl">
        {!profile || profile.status === 'draft' ? (
          <IntakeForm />
        ) : profile.status === 'processing' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
              <svg aria-hidden="true" className="animate-spin w-4 h-4 text-[var(--accent)]" viewBox="0 0 24 24" fill="none">
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
    </>
  )
}
