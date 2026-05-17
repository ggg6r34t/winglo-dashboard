import { AgentHubLayout } from '@/components/agents/agent-hub-layout'
import { getAgentBySlug } from '@/lib/agents/registry'

const TABS = [
  { label: 'Operations',   href: '/agents/seo' },
  { label: 'Pipeline',     href: '/agents/seo/pipeline',     count: 14  },
  { label: 'Calendar',     href: '/agents/seo/calendar' },
  { label: 'Memory',       href: '/agents/seo/memory',       count: 142 },
  { label: 'Workflows',    href: '/agents/seo/workflows',    count: 6   },
  { label: 'Integrations', href: '/agents/seo/integrations' },
]

export default function SeoLayout({ children }: { children: React.ReactNode }) {
  const agent = getAgentBySlug('seo')
  return (
    <AgentHubLayout agent={agent} tabs={TABS}>
      {children}
    </AgentHubLayout>
  )
}
