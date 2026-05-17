import { PipelineTab } from '@/components/agents/tabs/pipeline-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function MarketingPipelinePage() {
  return <PipelineTab agent={getAgentBySlug('marketing')} />
}
