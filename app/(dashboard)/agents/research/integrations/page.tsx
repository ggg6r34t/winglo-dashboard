import { IntegrationsTab } from '@/components/agents/tabs/integrations-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function ResearchIntegrationsPage() {
  return <IntegrationsTab agent={getAgentBySlug('research')} />
}
