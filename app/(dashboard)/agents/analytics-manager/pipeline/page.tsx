import { PipelineTab } from '@/components/agents/tabs/pipeline-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function AnalyticsManagerPipelinePage() {
  return <PipelineTab agent={getAgentBySlug('analytics-manager')} />
}
