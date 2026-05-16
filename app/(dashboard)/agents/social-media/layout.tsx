import { AgentHubLayout } from '@/components/agents/agent-hub-layout'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function SocialMediaLayout({ children }: { children: React.ReactNode }) {
  const agent = getAgentBySlug('social-media')
  return (
    <AgentHubLayout agent={agent} tabs={[]}>
      {children}
    </AgentHubLayout>
  )
}
