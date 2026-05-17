import { AgentHubLayout } from '@/components/agents/agent-hub-layout'
import { getAgentBySlug } from '@/lib/agents/registry'

const TABS = [
  { label: 'Operations',  href: '/agents/telehealth' },
  { label: 'Pipeline',    href: '/agents/telehealth', count: 14  },
  { label: 'Calendar',    href: '/agents/telehealth' },
  { label: 'Memory',      href: '/agents/telehealth', count: 142 },
  { label: 'Workflows',   href: '/agents/telehealth', count: 6   },
  { label: 'Integrations',href: '/agents/telehealth' },
]

export default function TelehealthLayout({ children }: { children: React.ReactNode }) {
  const agent = getAgentBySlug('telehealth')
  return (
    <AgentHubLayout agent={agent} tabs={TABS}>
      {children}
    </AgentHubLayout>
  )
}
