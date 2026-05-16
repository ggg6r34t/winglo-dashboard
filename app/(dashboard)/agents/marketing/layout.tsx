import { AgentHubLayout } from '@/components/agents/agent-hub-layout'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const agent = getAgentBySlug('marketing')
  return (
    <AgentHubLayout agent={agent} tabs={[]}>
      {children}
    </AgentHubLayout>
  )
}
