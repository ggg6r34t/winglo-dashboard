import { PageHeader } from '@/components/shared/page-header'
import { ComingSoonView } from '@/components/workspace/coming-soon-view'

export default function SignalsPage() {
  return (
    <>
      <PageHeader title="Signals" subtitle="Market and operational signals" />
      <ComingSoonView
        title="Signals coming soon"
        description="Detect and surface important signals across your AI workforce operations."
      />
    </>
  )
}
