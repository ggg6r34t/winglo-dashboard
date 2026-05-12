import type { BusinessProfile } from '@/types'
import { mockBusinessProfiles } from '@/lib/mock'
import { createServiceClient } from '@/lib/supabase/server'

export async function getBusinessProfiles(orgId: string): Promise<BusinessProfile[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return mockBusinessProfiles.filter(p => p.organization_id === orgId)
  }
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getBusinessProfileById(id: string): Promise<BusinessProfile | null> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return mockBusinessProfiles.find(p => p.id === id) ?? null
  }
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function getLatestBusinessProfile(orgId: string): Promise<BusinessProfile | null> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    const profiles = mockBusinessProfiles
      .filter(p => p.organization_id === orgId)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    return profiles[0] ?? null
  }
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('organization_id', orgId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()
  if (error) return null
  return data
}

export async function createBusinessProfile(
  orgId: string,
  data: {
    name: string
    website_url: string | null
    description: string | null
    status: 'draft' | 'processing' | 'complete'
  }
): Promise<BusinessProfile> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return {
      id: `bp-mock-${Date.now()}`,
      organization_id: orgId,
      name: data.name,
      website_url: data.website_url,
      description: data.description,
      icp: null,
      positioning: null,
      growth_brief: null,
      brand_voice: null,
      target_audience: null,
      goals: [],
      status: data.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
  const supabase = await createServiceClient()
  const { data: created, error } = await supabase
    .from('business_profiles')
    .insert({ organization_id: orgId, ...data })
    .select()
    .single()
  if (error) throw error
  return created
}

export async function updateBusinessProfile(
  id: string,
  data: Partial<Pick<BusinessProfile, 'name' | 'website_url' | 'description' | 'icp' | 'positioning' | 'growth_brief' | 'brand_voice' | 'target_audience' | 'goals' | 'status'>>
): Promise<BusinessProfile> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    const existing = mockBusinessProfiles.find(p => p.id === id)
    if (!existing) throw new Error(`Profile ${id} not found`)
    return { ...existing, ...data, updated_at: new Date().toISOString() }
  }
  const supabase = await createServiceClient()
  const { data: updated, error } = await supabase
    .from('business_profiles')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return updated
}
