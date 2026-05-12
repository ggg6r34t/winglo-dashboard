import type { AnalyticsSnapshot } from '@/types'
import { mockAnalyticsSnapshots } from '@/lib/mock'
import { createServiceClient } from '@/lib/supabase/server'

export async function getAnalyticsSnapshots(
  orgId: string,
  options: { days?: number } = {}
): Promise<AnalyticsSnapshot[]> {
  const days = options.days ?? 30
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    return mockAnalyticsSnapshots
      .filter(s => s.organization_id === orgId && new Date(s.snapshot_date) >= cutoff)
      .sort((a, b) => new Date(a.snapshot_date).getTime() - new Date(b.snapshot_date).getTime())
  }
  const supabase = await createServiceClient()
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  const { data, error } = await supabase
    .from('analytics_snapshots')
    .select('*')
    .eq('organization_id', orgId)
    .gte('snapshot_date', cutoffDate.toISOString().split('T')[0])
    .order('snapshot_date', { ascending: true })
  if (error) throw error
  return data ?? []
}
