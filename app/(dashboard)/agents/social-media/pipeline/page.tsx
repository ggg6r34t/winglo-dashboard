import { PipelineTab } from '@/components/agents/tabs/pipeline-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function SocialMediaPipelinePage() {
  return <PipelineTab agent={getAgentBySlug('social-media')} />
}
