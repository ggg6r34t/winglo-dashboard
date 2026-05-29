import type { Report } from '@/types'
import { createServiceClient } from '@/lib/supabase/server'

const mockReports: Report[] = [
  {
    id: 'report-growth-weekly-1',
    organization_id: '00000000-0000-0000-0000-000000000001',
    agent_slug: 'growth',
    source_run_id: null,
    title: 'Partnership pipeline - Week 22',
    summary: '32 partners contacted, 11 replied, and 4 advanced to discovery. ICP refinement is improving reply quality.',
    category: 'Weekly',
    status: 'published',
    pinned: true,
    tags: ['partnerships', 'weekly'],
    created_at: '2026-05-16T09:00:00Z',
    updated_at: '2026-05-16T09:00:00Z',
  },
  {
    id: 'report-analytics-velocity-1',
    organization_id: '00000000-0000-0000-0000-000000000001',
    agent_slug: 'analytics-manager',
    source_run_id: null,
    title: 'Pipeline velocity - Week 22',
    summary: 'Stage-2 to stage-3 conversion lifted 11.4% week-over-week, primarily from inbound enriched by the Growth Agent.',
    category: 'Weekly',
    status: 'published',
    pinned: true,
    tags: ['pipeline', 'weekly'],
    created_at: '2026-05-16T08:00:00Z',
    updated_at: '2026-05-16T08:00:00Z',
  },
]

export async function getReports(orgId: string, limit = 50): Promise<Report[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return mockReports
      .filter(report => report.organization_id === orgId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
  }

  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

export async function createReport(
  orgId: string,
  data: Omit<Report, 'id' | 'organization_id' | 'created_at' | 'updated_at'>,
): Promise<Report> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    const now = new Date().toISOString()
    return { ...data, id: `report-mock-${Date.now()}`, organization_id: orgId, created_at: now, updated_at: now }
  }

  const supabase = await createServiceClient()
  const { data: created, error } = await supabase
    .from('reports')
    .insert({ organization_id: orgId, ...data })
    .select()
    .single()
  if (error) throw error
  return created
}
