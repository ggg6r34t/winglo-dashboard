import type { OutreachDraft, OutreachChannel, OutreachStatus, OutreachTone } from '@/types'
import { mockOutreachDrafts } from '@/lib/mock'
import { createServiceClient } from '@/lib/supabase/server'

export async function getOutreachDrafts(
  orgId: string,
  options: { status?: OutreachStatus; opportunityId?: string } = {}
): Promise<OutreachDraft[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    let results = mockOutreachDrafts.filter(d => d.organization_id === orgId)
    if (options.status) results = results.filter(d => d.status === options.status)
    if (options.opportunityId) results = results.filter(d => d.opportunity_id === options.opportunityId)
    return results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
  const supabase = await createServiceClient()
  let query = supabase
    .from('outreach_drafts')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
  if (options.status) query = query.eq('status', options.status)
  if (options.opportunityId) query = query.eq('opportunity_id', options.opportunityId)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getPendingApprovalDrafts(orgId: string): Promise<OutreachDraft[]> {
  return getOutreachDrafts(orgId, { status: 'draft' })
}

export async function createOutreachDraft(
  orgId: string,
  opportunityId: string,
  data: { channel: OutreachChannel; tone: OutreachTone; subject?: string | null; body: string }
): Promise<OutreachDraft> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    const { mockOutreachDrafts } = await import('@/lib/mock')
    // Return the first existing draft for this opportunity (mock doesn't persist new drafts)
    return mockOutreachDrafts.find(d => d.opportunity_id === opportunityId) ?? mockOutreachDrafts[0]
  }
  const supabase = await createServiceClient()
  const { data: created, error } = await supabase
    .from('outreach_drafts')
    .insert({ organization_id: orgId, opportunity_id: opportunityId, ...data, status: 'draft' })
    .select()
    .single()
  if (error) throw error
  return created
}

export async function updateOutreachDraftStatus(
  id: string,
  status: OutreachStatus
): Promise<OutreachDraft> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    const { mockOutreachDrafts } = await import('@/lib/mock')
    const existing = mockOutreachDrafts.find(d => d.id === id)
    if (!existing) throw new Error(`OutreachDraft ${id} not found`)
    return { ...existing, status, updated_at: new Date().toISOString() }
  }
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('outreach_drafts')
    .update({ status, updated_at: new Date().toISOString(), ...(status === 'sent' ? { sent_at: new Date().toISOString() } : {}) })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
