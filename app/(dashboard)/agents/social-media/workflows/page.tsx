import { WorkflowsTab } from '@/components/agents/tabs/workflows-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function SocialMediaWorkflowsPage() {
  return <WorkflowsTab agent={getAgentBySlug('social-media')} />
}
