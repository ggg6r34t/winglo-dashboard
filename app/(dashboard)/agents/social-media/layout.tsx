import { AgentHubLayout } from '@/components/agents/agent-hub-layout'
import { getAgentBySlug } from '@/lib/agents/registry'

const TABS = [
  { label: 'Operations',  href: '/agents/social-media' },
  { label: 'Pipeline',    href: '/agents/social-media', count: 14  },
  { label: 'Calendar',    href: '/agents/social-media' },
  { label: 'Memory',      href: '/agents/social-media', count: 142 },
  { label: 'Workflows',   href: '/agents/social-media', count: 6   },
  { label: 'Integrations',href: '/agents/social-media' },
]

export default function SocialMediaLayout({ children }: { children: React.ReactNode }) {
  const agent = getAgentBySlug('social-media')
  return (
    <AgentHubLayout agent={agent} tabs={TABS}>
      {children}
    </AgentHubLayout>
  )
}
