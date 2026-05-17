import { AgentHubLayout } from '@/components/agents/agent-hub-layout'
import { getAgentBySlug } from '@/lib/agents/registry'

const TABS = [
  { label: 'Operations',   href: '/agents/marketing' },
  { label: 'Pipeline',     href: '/agents/marketing/pipeline',     count: 14  },
  { label: 'Calendar',     href: '/agents/marketing/calendar' },
  { label: 'Memory',       href: '/agents/marketing/memory',       count: 142 },
  { label: 'Workflows',    href: '/agents/marketing/workflows',    count: 6   },
  { label: 'Integrations', href: '/agents/marketing/integrations' },
]

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const agent = getAgentBySlug('marketing')
  return (
    <AgentHubLayout agent={agent} tabs={TABS}>
      {children}
    </AgentHubLayout>
  )
}
