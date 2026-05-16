import { NotDeployedView } from '@/components/agents/not-deployed-view'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function SalesPage() {
  const agent = getAgentBySlug('sales')
  return <NotDeployedView agent={agent} />
}
