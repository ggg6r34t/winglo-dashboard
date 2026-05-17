import { IntegrationsTab } from '@/components/agents/tabs/integrations-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function TelehealthIntegrationsPage() {
  return <IntegrationsTab agent={getAgentBySlug('telehealth')} />
}
