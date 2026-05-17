import { IntegrationsTab } from '@/components/agents/tabs/integrations-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function GrowthIntegrationsPage() {
  return <IntegrationsTab agent={getAgentBySlug('growth')} />
}
