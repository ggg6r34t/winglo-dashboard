import { AgentHubLayout } from '@/components/agents/agent-hub-layout'
import { getAgentBySlug } from '@/lib/agents/registry'

const TABS = [
  { label: 'Operations',  href: '/agents/seo' },
  { label: 'Pipeline',    href: '/agents/seo', count: 14  },
  { label: 'Calendar',    href: '/agents/seo' },
  { label: 'Memory',      href: '/agents/seo', count: 142 },
  { label: 'Workflows',   href: '/agents/seo', count: 6   },
  { label: 'Integrations',href: '/agents/seo' },
]

export default function SeoLayout({ children }: { children: React.ReactNode }) {
  const agent = getAgentBySlug('seo')
  return (
    <AgentHubLayout agent={agent} tabs={TABS}>
      {children}
    </AgentHubLayout>
  )
}
