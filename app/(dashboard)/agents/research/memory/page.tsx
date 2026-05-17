import { MemoryTab } from '@/components/agents/tabs/memory-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function ResearchMemoryPage() {
  return <MemoryTab agent={getAgentBySlug('research')} />
}
