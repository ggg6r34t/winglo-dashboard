import type { Organization } from '@/types'

export const mockOrganizations: Organization[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Acme AI',
    slug: 'acme-ai',
    logo_url: null,
    monitoring_enabled: false,
    created_at: '2026-01-15T10:00:00Z',
    updated_at: '2026-05-01T14:30:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Demo Corp',
    slug: 'demo-corp',
    logo_url: null,
    monitoring_enabled: false,
    created_at: '2026-02-10T09:00:00Z',
    updated_at: '2026-04-20T11:00:00Z',
  },
]

export const MOCK_ORG_ID = '00000000-0000-0000-0000-000000000001'
