import { AgentHubLayout } from '@/components/agents/agent-hub-layout'
import { getAgentBySlug } from '@/lib/agents/registry'

const TABS = [
  { label: 'Operations',   href: '/agents/sales' },
  { label: 'Pipeline',     href: '/agents/sales/pipeline',     count: 14  },
  { label: 'Calendar',     href: '/agents/sales/calendar' },
  { label: 'Memory',       href: '/agents/sales/memory',       count: 142 },
  { label: 'Workflows',    href: '/agents/sales/workflows',    count: 6   },
  { label: 'Integrations', href: '/agents/sales/integrations' },
]

export default function SalesLayout({ children }: { children: React.ReactNode }) {
  const agent = getAgentBySlug('sales')
  return (
    <AgentHubLayout agent={agent} tabs={TABS}>
      {children}
    </AgentHubLayout>
  )
}
