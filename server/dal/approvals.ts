import type { Approval, ApprovalCounts, ApprovalStatus } from '@/types'
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

const mockApprovalStore = new Map<string, Approval>(mockApprovals.map(item => [item.id, item]))

export async function getApprovals(
  orgId: string,
  options: { status?: ApprovalStatus; limit?: number } = {},
): Promise<Approval[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    let approvals = Array.from(mockApprovalStore.values()).filter(item => item.organization_id === orgId)
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
  orgId: string,
  id: string,
  status: Extract<ApprovalStatus, 'approved' | 'rejected'>,
  options: { decisionNote?: string; actorId?: string } = {},
): Promise<Approval> {
  const decisionNote = options.decisionNote?.trim() || null
  if (status === 'rejected' && !decisionNote) {
    throw new Error('Rejection note is required')
  }

  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    const existing = mockApprovalStore.get(id)
    if (!existing) throw new Error(`Approval ${id} not found`)
    if (existing.organization_id !== orgId) throw new Error(`Approval ${id} not found`)
    if (existing.status !== 'pending') throw new Error(`Approval ${id} has already been decided`)
    const updated = {
      ...existing,
      status,
      decision_note: decisionNote,
      decided_by: options.actorId ?? 'mock-user',
      decided_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    mockApprovalStore.set(id, updated)
    return updated
  }

  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('approvals')
    .update({
      status,
      decision_note: decisionNote,
      decided_by: options.actorId ?? null,
      decided_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('organization_id', orgId)
    .eq('id', id)
    .eq('status', 'pending')
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getApprovalCounts(orgId: string): Promise<ApprovalCounts> {
  const approvals = await getApprovals(orgId)
  return {
    pending: approvals.filter(item => item.status === 'pending').length,
    approved: approvals.filter(item => item.status === 'approved').length,
    rejected: approvals.filter(item => item.status === 'rejected').length,
    byUrgency: {
      low: approvals.filter(item => item.status === 'pending' && item.urgency === 'low').length,
      med: approvals.filter(item => item.status === 'pending' && item.urgency === 'med').length,
      high: approvals.filter(item => item.status === 'pending' && item.urgency === 'high').length,
    },
  }
}
