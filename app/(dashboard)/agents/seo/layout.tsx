import { AgentHubLayout } from '@/components/agents/agent-hub-layout'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function SeoLayout({ children }: { children: React.ReactNode }) {
  const agent = getAgentBySlug('seo')
  return (
    <AgentHubLayout agent={agent} tabs={[]}>
      {children}
    </AgentHubLayout>
  )
}
