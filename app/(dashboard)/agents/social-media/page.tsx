import { NotDeployedView } from '@/components/agents/not-deployed-view'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function SocialMediaPage() {
  const agent = getAgentBySlug('social-media')
  return <NotDeployedView agent={agent} />
}
