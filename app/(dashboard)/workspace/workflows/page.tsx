import { PageHeader } from '@/components/shared/page-header'
import { ComingSoonView } from '@/components/workspace/coming-soon-view'

export default function WorkflowsPage() {
  return (
    <>
      <PageHeader title="Workflows" subtitle="Cross-agent workflow management" />
      <ComingSoonView
        title="Workflows coming soon"
        description="Manage and monitor workflows across all AI employees from one place."
      />
    </>
  )
}
