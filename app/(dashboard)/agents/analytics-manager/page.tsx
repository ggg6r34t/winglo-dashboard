import { NotDeployedView } from '@/components/agents/not-deployed-view'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function AnalyticsManagerPage() {
  const agent = getAgentBySlug('analytics-manager')
  return <NotDeployedView agent={agent} />
}
