import { AgentHubLayout } from '@/components/agents/agent-hub-layout'
import { getAgentBySlug } from '@/lib/agents/registry'
import type { HubTab } from '@/components/agents/agent-hub-layout'

const GROWTH_TABS: HubTab[] = [
  { label: 'Operations',    href: '/agents/growth' },
  { label: 'Intake',        href: '/agents/growth/intake' },
  { label: 'Opportunities', href: '/agents/growth/opportunities' },
  { label: 'Pipeline',      href: '/agents/growth/pipeline' },
  { label: 'Outreach',      href: '/agents/growth/outreach' },
  { label: 'Calendar',      href: '/agents/growth/calendar' },
  { label: 'Activity',      href: '/agents/growth/activity' },
  { label: 'Analytics',     href: '/agents/growth/analytics' },
  { label: 'Reports',       href: '/agents/growth/reports' },
  { label: 'Workflows',     href: '/agents/growth/workflows' },
  { label: 'Integrations',  href: '/agents/growth/integrations' },
  { label: 'Memory',        href: '/agents/growth/memory' },
  { label: 'Settings',      href: '/agents/growth/settings' },
]

export default function GrowthHubLayout({ children }: { children: React.ReactNode }) {
  const agent = getAgentBySlug('growth')
  return (
    <AgentHubLayout agent={agent} tabs={GROWTH_TABS}>
      {children}
    </AgentHubLayout>
  )
}
