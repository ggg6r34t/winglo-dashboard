import { PipelineTab } from '@/components/agents/tabs/pipeline-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function ResearchPipelinePage() {
  return <PipelineTab agent={getAgentBySlug('research')} />
}
