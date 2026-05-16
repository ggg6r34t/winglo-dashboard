import { PageHeader } from '@/components/shared/page-header'
import { ComingSoonView } from '@/components/workspace/coming-soon-view'

export default function ReportsPage() {
  return (
    <>
      <PageHeader title="Reports" subtitle="Organization-wide reporting" />
      <ComingSoonView
        title="Reports coming soon"
        description="Aggregate reports across all AI employees and operational workflows."
      />
    </>
  )
}
