import type { Organization } from '@/types'
import { mockOrganizations } from '@/lib/mock'
import { createServiceClient } from '@/lib/supabase/server'

export async function getOrganizations(): Promise<Organization[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return mockOrganizations
  }
  const supabase = await createServiceClient()
  const { data, error } = await supabase.from('organizations').select('*')
  if (error) throw error
  return data ?? []
}

export async function getOrganizationById(id: string): Promise<Organization | null> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return mockOrganizations.find(o => o.id === id) ?? null
  }
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function updateMonitoringEnabled(orgId: string, enabled: boolean): Promise<void> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') return
  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('organizations')
    .update({ monitoring_enabled: enabled, updated_at: new Date().toISOString() })
    .eq('id', orgId)
  if (error) throw error
}

export async function getMonitoringEnabledOrgs(): Promise<Organization[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') return []
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('monitoring_enabled', true)
  if (error) throw error
  return data ?? []
}

export async function getOrganizationBySlug(slug: string): Promise<Organization | null> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return mockOrganizations.find(o => o.slug === slug) ?? null
  }
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data
}
