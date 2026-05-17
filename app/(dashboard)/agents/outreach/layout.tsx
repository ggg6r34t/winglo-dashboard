import { AgentHubLayout } from '@/components/agents/agent-hub-layout'
import { getAgentBySlug } from '@/lib/agents/registry'

const TABS = [
  { label: 'Operations',   href: '/agents/outreach' },
  { label: 'Pipeline',     href: '/agents/outreach/pipeline',     count: 14  },
  { label: 'Calendar',     href: '/agents/outreach/calendar' },
  { label: 'Memory',       href: '/agents/outreach/memory',       count: 142 },
  { label: 'Workflows',    href: '/agents/outreach/workflows',    count: 6   },
  { label: 'Integrations', href: '/agents/outreach/integrations' },
]

export default function OutreachLayout({ children }: { children: React.ReactNode }) {
  const agent = getAgentBySlug('outreach')
  return (
    <AgentHubLayout agent={agent} tabs={TABS}>
      {children}
    </AgentHubLayout>
  )
}
