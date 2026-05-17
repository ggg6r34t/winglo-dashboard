import { MemoryTab } from '@/components/agents/tabs/memory-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function SeoMemoryPage() {
  return <MemoryTab agent={getAgentBySlug('seo')} />
}
