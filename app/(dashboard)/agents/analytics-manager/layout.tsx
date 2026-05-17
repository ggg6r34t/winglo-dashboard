import { AgentHubLayout } from '@/components/agents/agent-hub-layout'
import { getAgentBySlug } from '@/lib/agents/registry'

const TABS = [
  { label: 'Operations',   href: '/agents/analytics-manager' },
  { label: 'Pipeline',     href: '/agents/analytics-manager/pipeline',     count: 14  },
  { label: 'Calendar',     href: '/agents/analytics-manager/calendar' },
  { label: 'Memory',       href: '/agents/analytics-manager/memory',       count: 142 },
  { label: 'Workflows',    href: '/agents/analytics-manager/workflows',    count: 6   },
  { label: 'Integrations', href: '/agents/analytics-manager/integrations' },
]

export default function AnalyticsManagerLayout({ children }: { children: React.ReactNode }) {
  const agent = getAgentBySlug('analytics-manager')
  return (
    <AgentHubLayout agent={agent} tabs={TABS}>
      {children}
    </AgentHubLayout>
  )
}
