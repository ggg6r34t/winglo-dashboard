import { IntegrationsTab } from '@/components/agents/tabs/integrations-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function SocialMediaIntegrationsPage() {
  return <IntegrationsTab agent={getAgentBySlug('social-media')} />
}
