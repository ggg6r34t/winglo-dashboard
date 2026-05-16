import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Settings } from 'lucide-react'

export default function WorkspaceSettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Organization and account configuration"
      />
      <EmptyState
        icon={<Settings className="w-5 h-5" />}
        title="Settings coming in a future phase"
        description="Organization settings, API keys, and team management will be configured here."
      />
    </>
  )
}
