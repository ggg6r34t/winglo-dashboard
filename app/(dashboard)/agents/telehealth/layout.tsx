import { AgentHubLayout } from '@/components/agents/agent-hub-layout'
import { getAgentBySlug } from '@/lib/agents/registry'

const TABS = [
  { label: 'Operations',   href: '/agents/telehealth' },
  { label: 'Pipeline',     href: '/agents/telehealth/pipeline',     count: 14  },
  { label: 'Calendar',     href: '/agents/telehealth/calendar' },
  { label: 'Memory',       href: '/agents/telehealth/memory',       count: 142 },
  { label: 'Workflows',    href: '/agents/telehealth/workflows',    count: 6   },
  { label: 'Integrations', href: '/agents/telehealth/integrations' },
]

export default function TelehealthLayout({ children }: { children: React.ReactNode }) {
  const agent = getAgentBySlug('telehealth')
  return (
    <AgentHubLayout agent={agent} tabs={TABS}>
      {children}
    </AgentHubLayout>
  )
}
