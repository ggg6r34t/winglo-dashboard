import type { AgentLog } from '@/types'
import { MOCK_ORG_ID } from './organizations'

const ORG = MOCK_ORG_ID

export const mockAgentLogs: AgentLog[] = [
  {
    id: 'log-0000000000000000000000001',
    ai_run_id: 'run-00000000000000000000000001',
    organization_id: ORG,
    level: 'info',
    message: 'Starting intake analysis for https://acme-ai.example.com',
    metadata: { step: 'init' },
    created_at: '2026-05-10T09:00:00Z',
  },
  {
    id: 'log-0000000000000000000000002',
    ai_run_id: 'run-00000000000000000000000001',
    organization_id: ORG,
    level: 'info',
    message: 'Extracted ICP: B2B SaaS, VP Sales, 200–2000 employees',
    metadata: { step: 'icp_extraction', confidence: 0.92 },
    created_at: '2026-05-10T09:00:01Z',
  },
  {
    id: 'log-0000000000000000000000003',
    ai_run_id: 'run-00000000000000000000000001',
    organization_id: ORG,
    level: 'info',
    message: 'Growth brief generated with 4 recommended partnership categories',
    metadata: { step: 'growth_brief', categories: 4 },
    created_at: '2026-05-10T09:00:04Z',
  },
  {
    id: 'log-0000000000000000000000004',
    ai_run_id: 'run-00000000000000000000000005',
    organization_id: ORG,
    level: 'error',
    message: 'OpenAI API rate limit hit — 429 Too Many Requests',
    metadata: { step: 'embedding_generation', retry_after: 60 },
    created_at: '2026-05-11T08:40:01Z',
  },
  {
    id: 'log-0000000000000000000000005',
    ai_run_id: 'run-00000000000000000000000004',
    organization_id: ORG,
    level: 'info',
    message: 'Generating email outreach for Outreach.io (tone: direct)',
    metadata: { step: 'draft_generation', channel: 'email', opportunity: 'opp-00000000-0000-0000-000000000003' },
    created_at: '2026-05-11T08:55:01Z',
  },
  {
    id: 'log-0000000000000000000000006',
    ai_run_id: 'run-00000000000000000000000007',
    organization_id: ORG,
    level: 'info',
    message: 'Company Intelligence Agent: researching Acme Corp',
    metadata: { step: 'research_start', company: 'Acme Corp' },
    created_at: '2026-05-10T09:01:15Z',
  },
  {
    id: 'log-0000000000000000000000007',
    ai_run_id: 'run-00000000000000000000000008',
    organization_id: ORG,
    level: 'info',
    message: 'Company Intelligence Agent: researching Bolt Payments',
    metadata: { step: 'research_start', company: 'Bolt Payments' },
    created_at: '2026-05-10T09:01:15Z',
  },
  {
    id: 'log-0000000000000000000000008',
    ai_run_id: 'run-00000000000000000000000009',
    organization_id: ORG,
    level: 'info',
    message: 'Company Intelligence Agent: researching Outreach.io',
    metadata: { step: 'research_start', company: 'Outreach.io' },
    created_at: '2026-05-10T09:01:15Z',
  },
]
