import { NotDeployedView } from '@/components/agents/not-deployed-view'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function MarketingPage() {
  const agent = getAgentBySlug('marketing')
  return <NotDeployedView agent={agent} />
}
