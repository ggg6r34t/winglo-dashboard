import { AgentHubLayout } from '@/components/agents/agent-hub-layout'
import { getAgentBySlug } from '@/lib/agents/registry'
import type { HubTab } from '@/components/agents/agent-hub-layout'

const GROWTH_TABS: HubTab[] = [
  { label: 'Overview',  href: '/agents/growth' },
  { label: 'Intake',    href: '/agents/growth/intake' },
  { label: 'Workflows', href: '/agents/growth/workflows' },
  { label: 'Activity',  href: '/agents/growth/activity' },
  { label: 'Reports',   href: '/agents/growth/reports' },
  { label: 'Memory',    href: '/agents/growth/memory' },
  { label: 'Analytics', href: '/agents/growth/analytics' },
  { label: 'Settings',  href: '/agents/growth/settings' },
]

export default function GrowthHubLayout({ children }: { children: React.ReactNode }) {
  const agent = getAgentBySlug('growth')
  return (
    <AgentHubLayout agent={agent} tabs={GROWTH_TABS}>
      {children}
    </AgentHubLayout>
  )
}
