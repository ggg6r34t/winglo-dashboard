import { MemoryTab } from '@/components/agents/tabs/memory-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function SalesMemoryPage() {
  return <MemoryTab agent={getAgentBySlug('sales')} />
}
