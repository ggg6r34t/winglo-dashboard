import { IntegrationsTab } from '@/components/agents/tabs/integrations-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function OutreachIntegrationsPage() {
  return <IntegrationsTab agent={getAgentBySlug('outreach')} />
}
