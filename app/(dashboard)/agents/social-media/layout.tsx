import { AgentHubLayout } from '@/components/agents/agent-hub-layout'
import { getAgentBySlug } from '@/lib/agents/registry'

const TABS = [
  { label: 'Operations',   href: '/agents/social-media' },
  { label: 'Pipeline',     href: '/agents/social-media/pipeline',     count: 14  },
  { label: 'Calendar',     href: '/agents/social-media/calendar' },
  { label: 'Memory',       href: '/agents/social-media/memory',       count: 142 },
  { label: 'Workflows',    href: '/agents/social-media/workflows',    count: 6   },
  { label: 'Integrations', href: '/agents/social-media/integrations' },
]

export default function SocialMediaLayout({ children }: { children: React.ReactNode }) {
  const agent = getAgentBySlug('social-media')
  return (
    <AgentHubLayout agent={agent} tabs={TABS}>
      {children}
    </AgentHubLayout>
  )
}
