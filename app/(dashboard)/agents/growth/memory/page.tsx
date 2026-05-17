import { MemoryTab } from '@/components/agents/tabs/memory-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function GrowthMemoryPage() {
  return <MemoryTab agent={getAgentBySlug('growth')} />
}
