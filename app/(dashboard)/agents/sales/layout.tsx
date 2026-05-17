import { AgentHubLayout } from '@/components/agents/agent-hub-layout'
import { getAgentBySlug } from '@/lib/agents/registry'

const TABS = [
  { label: 'Operations',  href: '/agents/sales' },
  { label: 'Pipeline',    href: '/agents/sales', count: 14  },
  { label: 'Calendar',    href: '/agents/sales' },
  { label: 'Memory',      href: '/agents/sales', count: 142 },
  { label: 'Workflows',   href: '/agents/sales', count: 6   },
  { label: 'Integrations',href: '/agents/sales' },
]

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  const agent = getAgentBySlug('sales')
  return (
    <AgentHubLayout agent={agent} tabs={TABS}>
      {children}
    </AgentHubLayout>
  )
}
