import { IntegrationsTab } from '@/components/agents/tabs/integrations-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function AnalyticsManagerIntegrationsPage() {
  return <IntegrationsTab agent={getAgentBySlug('analytics-manager')} />
}
