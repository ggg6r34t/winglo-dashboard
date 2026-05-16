import { NotDeployedView } from '@/components/agents/not-deployed-view'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function TelehealthPage() {
  const agent = getAgentBySlug('telehealth')
  return <NotDeployedView agent={agent} />
}
