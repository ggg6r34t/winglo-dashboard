import { WorkflowsTab } from '@/components/agents/tabs/workflows-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function SalesWorkflowsPage() {
  return <WorkflowsTab agent={getAgentBySlug('sales')} />
}
