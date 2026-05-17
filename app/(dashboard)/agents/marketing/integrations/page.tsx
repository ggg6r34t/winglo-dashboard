import { IntegrationsTab } from '@/components/agents/tabs/integrations-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function MarketingIntegrationsPage() {
  return <IntegrationsTab agent={getAgentBySlug('marketing')} />
}
