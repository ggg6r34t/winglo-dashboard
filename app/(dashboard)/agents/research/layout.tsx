import { AgentHubLayout } from '@/components/agents/agent-hub-layout'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  const agent = getAgentBySlug('research')
  return (
    <AgentHubLayout agent={agent} tabs={[]}>
      {children}
    </AgentHubLayout>
  )
}
