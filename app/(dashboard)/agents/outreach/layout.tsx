import { AgentHubLayout } from '@/components/agents/agent-hub-layout'
import { getAgentBySlug } from '@/lib/agents/registry'

const TABS = [
  { label: 'Operations',  href: '/agents/outreach' },
  { label: 'Pipeline',    href: '/agents/outreach', count: 14  },
  { label: 'Calendar',    href: '/agents/outreach' },
  { label: 'Memory',      href: '/agents/outreach', count: 142 },
  { label: 'Workflows',   href: '/agents/outreach', count: 6   },
  { label: 'Integrations',href: '/agents/outreach' },
]

export default function OutreachLayout({ children }: { children: React.ReactNode }) {
  const agent = getAgentBySlug('outreach')
  return (
    <AgentHubLayout agent={agent} tabs={TABS}>
      {children}
    </AgentHubLayout>
  )
}
