import { NotDeployedView } from '@/components/agents/not-deployed-view'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function ResearchPage() {
  const agent = getAgentBySlug('research')
  return <NotDeployedView agent={agent} />
}
