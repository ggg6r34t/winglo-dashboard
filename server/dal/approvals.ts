import type { Approval, ApprovalStatus } from '@/types'
import { createServiceClient } from '@/lib/supabase/server'

const mockApprovals: Approval[] = [
  {
    id: 'ap-growth-outreach-1',
    organization_id: '00000000-0000-0000-0000-000000000001',
    agent_slug: 'growth',
    approval_type: 'outreach',
    title: 'Cold outreach to partner shortlist',
    summary: 'Review first-touch copy for 12 ICP-matched partnership targets.',
    entity_type: 'outreach_draft',
    entity_id: 'od-000000000000000000000000002',
    status: 'pending',
    urgency: 'low',
    requested_by_run_id: null,
    decided_by: null,
    decided_at: null,
    decision_note: null,
    created_at: '2026-05-16T11:00:00Z',
    updated_at: '2026-05-16T11:00:00Z',
  },
  {
    id: 'ap-growth-spend-1',
    organization_id: '00000000-0000-0000-0000-000000000001',
    agent_slug: 'growth',
    approval_type: 'spend',
    title: 'Outbound campaign enrichment',
    summary: 'Enrichment cost is above the configured $50 review threshold.',
    entity_type: 'workflow',
    entity_id: 'wf-g1',
    status: 'pending',
    urgency: 'med',
    requested_by_run_id: null,
    decided_by: null,
    decided_at: null,
    decision_note: null,
    created_at: '2026-05-16T10:42:00Z',
    updated_at: '2026-05-16T10:42:00Z',
  },
]

export async function getApprovals(
  orgId: string,
  options: { status?: ApprovalStatus; limit?: number } = {},
): Promise<Approval[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    let approvals = mockApprovals.filter(item => item.organization_id === orgId)
    if (options.status) approvals = approvals.filter(item => item.status === options.status)
    if (options.limit) approvals = approvals.slice(0, options.limit)
    return approvals
  }

  const supabase = await createServiceClient()
  let query = supabase
    .from('approvals')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
  if (options.status) query = query.eq('status', options.status)
  if (options.limit) query = query.limit(options.limit)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function decideApproval(
  id: string,
  status: Extract<ApprovalStatus, 'approved' | 'rejected'>,
  decisionNote?: string,
): Promise<Approval> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    const existing = mockApprovals.find(item => item.id === id)
    if (!existing) throw new Error(`Approval ${id} not found`)
    return {
      ...existing,
      status,
      decision_note: decisionNote ?? null,
      decided_by: 'mock-user',
      decided_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }

  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('approvals')
    .update({
      status,
      decision_note: decisionNote ?? null,
      decided_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
