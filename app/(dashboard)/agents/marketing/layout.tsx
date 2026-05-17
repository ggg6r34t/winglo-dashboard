import { AgentHubLayout } from '@/components/agents/agent-hub-layout'
import { getAgentBySlug } from '@/lib/agents/registry'

const TABS = [
  { label: 'Operations',  href: '/agents/marketing' },
  { label: 'Pipeline',    href: '/agents/marketing', count: 14  },
  { label: 'Calendar',    href: '/agents/marketing' },
  { label: 'Memory',      href: '/agents/marketing', count: 142 },
  { label: 'Workflows',   href: '/agents/marketing', count: 6   },
  { label: 'Integrations',href: '/agents/marketing' },
]

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const agent = getAgentBySlug('marketing')
  return (
    <AgentHubLayout agent={agent} tabs={TABS}>
      {children}
    </AgentHubLayout>
  )
}
