import { AgentHubLayout } from '@/components/agents/agent-hub-layout'
import { getAgentBySlug } from '@/lib/agents/registry'

const TABS = [
  { label: 'Operations',  href: '/agents/analytics-manager' },
  { label: 'Pipeline',    href: '/agents/analytics-manager', count: 14  },
  { label: 'Calendar',    href: '/agents/analytics-manager' },
  { label: 'Memory',      href: '/agents/analytics-manager', count: 142 },
  { label: 'Workflows',   href: '/agents/analytics-manager', count: 6   },
  { label: 'Integrations',href: '/agents/analytics-manager' },
]

export default function AnalyticsManagerLayout({ children }: { children: React.ReactNode }) {
  const agent = getAgentBySlug('analytics-manager')
  return (
    <AgentHubLayout agent={agent} tabs={TABS}>
      {children}
    </AgentHubLayout>
  )
}
