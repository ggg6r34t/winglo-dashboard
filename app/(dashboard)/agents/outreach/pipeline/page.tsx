import { PipelineTab } from '@/components/agents/tabs/pipeline-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function OutreachPipelinePage() {
  return <PipelineTab agent={getAgentBySlug('outreach')} />
}
