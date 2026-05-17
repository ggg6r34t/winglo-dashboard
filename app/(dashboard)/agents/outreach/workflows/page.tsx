import { WorkflowsTab } from '@/components/agents/tabs/workflows-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function OutreachWorkflowsPage() {
  return <WorkflowsTab agent={getAgentBySlug('outreach')} />
}
