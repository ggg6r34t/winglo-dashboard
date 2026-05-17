import { MemoryTab } from '@/components/agents/tabs/memory-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function SocialMediaMemoryPage() {
  return <MemoryTab agent={getAgentBySlug('social-media')} />
}
