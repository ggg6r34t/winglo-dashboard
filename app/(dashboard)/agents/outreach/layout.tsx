import { AgentHubLayout } from '@/components/agents/agent-hub-layout'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function OutreachLayout({ children }: { children: React.ReactNode }) {
  const agent = getAgentBySlug('outreach')
  return (
    <AgentHubLayout agent={agent} tabs={[]}>
      {children}
    </AgentHubLayout>
  )
}
