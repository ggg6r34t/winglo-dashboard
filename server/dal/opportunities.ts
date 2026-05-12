import type { Opportunity, OpportunityStatus, OpportunityType, ScoreRationale } from '@/types'
import { mockOpportunities } from '@/lib/mock'
import { createServiceClient } from '@/lib/supabase/server'

interface GetOpportunitiesOptions {
  status?: OpportunityStatus
  minScore?: number
  limit?: number
}

export async function getOpportunities(
  orgId: string,
  options: GetOpportunitiesOptions = {}
): Promise<Opportunity[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    let results = mockOpportunities.filter(o => o.organization_id === orgId)
    if (options.status) results = results.filter(o => o.status === options.status)
    if (options.minScore !== undefined) results = results.filter(o => o.score >= options.minScore!)
    results = results.sort((a, b) => b.score - a.score)
    if (options.limit) results = results.slice(0, options.limit)
    return results
  }
  const supabase = await createServiceClient()
  let query = supabase
    .from('opportunities')
    .select('*')
    .eq('organization_id', orgId)
    .order('score', { ascending: false })
  if (options.status) query = query.eq('status', options.status)
  if (options.minScore !== undefined) query = query.gte('score', options.minScore)
  if (options.limit) query = query.limit(options.limit)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getOpportunityById(id: string): Promise<Opportunity | null> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return mockOpportunities.find(o => o.id === id) ?? null
  }
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function createOpportunities(
  orgId: string,
  profileId: string,
  opportunities: Array<{
    company_name: string
    company_url?: string | null
    company_description?: string | null
    opportunity_type: OpportunityType
    score: number
    score_rationale: ScoreRationale | null
    estimated_impact: string | null
  }>
): Promise<Opportunity[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return mockOpportunities.filter(o => o.organization_id === orgId)
  }
  if (opportunities.length === 0) return []
  const supabase = await createServiceClient()
  const rows = opportunities.map(o => ({
    organization_id: orgId,
    business_profile_id: profileId,
    company_name: o.company_name,
    company_url: o.company_url ?? null,
    company_description: o.company_description ?? null,
    opportunity_type: o.opportunity_type,
    score: o.score,
    score_rationale: o.score_rationale,
    estimated_impact: o.estimated_impact,
    status: 'new' as OpportunityStatus,
  }))
  const { data, error } = await supabase
    .from('opportunities')
    .insert(rows)
    .select()
  if (error) throw error
  return data ?? []
}

export async function updateOpportunityStatus(
  id: string,
  status: OpportunityStatus
): Promise<Opportunity> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    const existing = mockOpportunities.find(o => o.id === id)
    if (!existing) throw new Error(`Opportunity ${id} not found`)
    return { ...existing, status, updated_at: new Date().toISOString() }
  }
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('opportunities')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}
