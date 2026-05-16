import { NotDeployedView } from '@/components/agents/not-deployed-view'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function SeoPage() {
  const agent = getAgentBySlug('seo')
  return <NotDeployedView agent={agent} />
}
