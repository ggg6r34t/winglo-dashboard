import { MemoryTab } from '@/components/agents/tabs/memory-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function TelehealthMemoryPage() {
  return <MemoryTab agent={getAgentBySlug('telehealth')} />
}
