import { WorkflowsTab } from '@/components/agents/tabs/workflows-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function GrowthWorkflowsPage() {
  return <WorkflowsTab agent={getAgentBySlug('growth')} />
}
