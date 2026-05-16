import { PageHeader } from '@/components/shared/page-header'
import { ComingSoonView } from '@/components/workspace/coming-soon-view'

export default function AlertsPage() {
  return (
    <>
      <PageHeader title="Alerts" subtitle="Operational alerts and notifications" />
      <ComingSoonView
        title="Alerts coming soon"
        description="Configurable alerts for agent failures, threshold breaches, and key events."
      />
    </>
  )
}
