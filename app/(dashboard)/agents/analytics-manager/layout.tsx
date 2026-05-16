import { AgentHubLayout } from '@/components/agents/agent-hub-layout'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function AnalyticsManagerLayout({ children }: { children: React.ReactNode }) {
  const agent = getAgentBySlug('analytics-manager')
  return (
    <AgentHubLayout agent={agent} tabs={[]}>
      {children}
    </AgentHubLayout>
  )
}
