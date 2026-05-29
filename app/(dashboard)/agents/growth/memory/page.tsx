import { MemoryTab, type MemRecord } from '@/components/agents/tabs/memory-tab'
import { getAgentBySlug } from '@/lib/agents/registry'
import { getMemoryEntries } from '@/server/dal/memory-entries'
import { getCurrentOrgId } from '@/server/auth/org'
import type { MemoryEntry } from '@/types/database'

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

function toMemRecord(entry: MemoryEntry): MemRecord {
  return {
    key: entry.title,
    val: entry.body,
    source: entry.source,
    conf: 0.9,
    time: relativeTime(entry.created_at),
  }
}

export default async function GrowthMemoryPage() {
  const orgId = await getCurrentOrgId()
  const entries = await getMemoryEntries(orgId).catch(() => [])
  return (
    <MemoryTab
      agent={getAgentBySlug('growth')}
      records={entries.map(toMemRecord)}
    />
  )
}
