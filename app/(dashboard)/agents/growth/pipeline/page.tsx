import { PipelineTab } from '@/components/agents/tabs/pipeline-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function GrowthPipelinePage() {
  return <PipelineTab agent={getAgentBySlug('growth')} />
}
