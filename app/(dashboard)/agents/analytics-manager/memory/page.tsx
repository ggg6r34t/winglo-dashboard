import { MemoryTab } from '@/components/agents/tabs/memory-tab'
import { getAgentBySlug } from '@/lib/agents/registry'

export default function AnalyticsManagerMemoryPage() {
  return <MemoryTab agent={getAgentBySlug('analytics-manager')} />
}
