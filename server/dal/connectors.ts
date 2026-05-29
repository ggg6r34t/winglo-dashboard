import type { Connector, ConnectorAccount } from '@/types'
import { createServiceClient } from '@/lib/supabase/server'

const catalog: Connector[] = [
  { id: 'conn-hubspot', key: 'hubspot', name: 'HubSpot', category: 'CRM', scopes: ['contacts.read', 'contacts.write'], oauth_enabled: true, created_at: '2026-05-01T00:00:00Z' },
  { id: 'conn-salesforce', key: 'salesforce', name: 'Salesforce', category: 'CRM', scopes: ['crm.read'], oauth_enabled: true, created_at: '2026-05-01T00:00:00Z' },
  { id: 'conn-gmail', key: 'gmail', name: 'Gmail', category: 'Email', scopes: ['mail.send'], oauth_enabled: true, created_at: '2026-05-01T00:00:00Z' },
  { id: 'conn-ga4', key: 'ga4', name: 'Google Analytics 4', category: 'Analytics', scopes: ['analytics.readonly'], oauth_enabled: true, created_at: '2026-05-01T00:00:00Z' },
  { id: 'conn-gsc', key: 'google-search-console', name: 'Google Search Console', category: 'Analytics', scopes: ['webmasters.readonly'], oauth_enabled: true, created_at: '2026-05-01T00:00:00Z' },
  { id: 'conn-slack', key: 'slack', name: 'Slack', category: 'Communication', scopes: ['chat.write'], oauth_enabled: true, created_at: '2026-05-01T00:00:00Z' },
  { id: 'conn-stripe', key: 'stripe', name: 'Stripe', category: 'Payments', scopes: ['read_only'], oauth_enabled: false, created_at: '2026-05-01T00:00:00Z' },
]

export async function getConnectorAccounts(orgId: string): Promise<ConnectorAccount[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    const now = new Date().toISOString()
    return catalog.map((connector, index) => ({
      id: `acct-${connector.key}`,
      organization_id: orgId,
      connector_id: connector.id,
      connector,
      status: index < 4 ? 'connected' : 'not_connected',
      scopes: connector.scopes,
      last_sync_at: index < 4 ? now : null,
      error: null,
      config: {},
      created_at: now,
      updated_at: now,
    }))
  }

  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('connector_accounts')
    .select('*, connector:connectors(*)')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getConnectors(): Promise<Connector[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') return catalog

  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('connectors')
    .select('*')
    .order('category', { ascending: true })
  if (error) throw error
  return data ?? []
}
