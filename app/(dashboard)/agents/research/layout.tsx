import { AgentHubLayout } from '@/components/agents/agent-hub-layout'
import { getAgentBySlug } from '@/lib/agents/registry'

const TABS = [
  { label: 'Operations',  href: '/agents/research' },
  { label: 'Pipeline',    href: '/agents/research', count: 14  },
  { label: 'Calendar',    href: '/agents/research' },
  { label: 'Memory',      href: '/agents/research', count: 142 },
  { label: 'Workflows',   href: '/agents/research', count: 6   },
  { label: 'Integrations',href: '/agents/research' },
]

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  const agent = getAgentBySlug('research')
  return (
    <AgentHubLayout agent={agent} tabs={TABS}>
      {children}
    </AgentHubLayout>
  )
}
