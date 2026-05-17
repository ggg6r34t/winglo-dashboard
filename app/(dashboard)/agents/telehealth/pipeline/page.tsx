import { PipelineTab } from '@/components/agents/tabs/pipeline-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function TelehealthPipelinePage() {
  return <PipelineTab agent={getAgentBySlug('telehealth')} />
}
