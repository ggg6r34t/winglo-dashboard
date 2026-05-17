import { WorkflowsTab } from '@/components/agents/tabs/workflows-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function ResearchWorkflowsPage() {
  return <WorkflowsTab agent={getAgentBySlug('research')} />
}
