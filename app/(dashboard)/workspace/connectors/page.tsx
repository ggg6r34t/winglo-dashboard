import { PageHeader } from '@/components/shared/page-header'
import { ComingSoonView } from '@/components/workspace/coming-soon-view'

export default function ConnectorsPage() {
  return (
    <>
      <PageHeader title="Connectors" subtitle="Integrations and data sources" />
      <ComingSoonView
        title="Connectors coming soon"
        description="Connect external tools, CRMs, databases, and data sources to your AI workforce."
      />
    </>
  )
}
