import { WorkflowsTab } from '@/components/agents/tabs/workflows-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function TelehealthWorkflowsPage() {
  return <WorkflowsTab agent={getAgentBySlug('telehealth')} />
}
