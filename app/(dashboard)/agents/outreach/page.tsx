import { NotDeployedView } from '@/components/agents/not-deployed-view'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function OutreachPage() {
  const agent = getAgentBySlug('outreach')
  return <NotDeployedView agent={agent} />
}
