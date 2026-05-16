import { EmptyState } from '@/components/shared/empty-state'
import { Settings } from 'lucide-react'

export default function GrowthSettingsPage() {
  return (
    <EmptyState
      icon={<Settings className="w-5 h-5" />}
      title="Agent settings coming soon"
      description="Configure permissions, integrations, and operational behavior for this AI employee."
    />
  )
}
