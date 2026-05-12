import type { BusinessProfile } from '@/types'
import { MOCK_ORG_ID } from './organizations'

export const mockBusinessProfiles: BusinessProfile[] = [
  {
    id: 'bp-0000-0000-0000-000000000001',
    organization_id: MOCK_ORG_ID,
    name: 'Acme AI — Sales Intelligence Platform',
    website_url: 'https://acme-ai.example.com',
    description:
      'Acme AI is a B2B SaaS platform that uses AI to surface revenue signals and prioritize accounts for sales teams at mid-market and enterprise companies.',
    icp: {
      company_size: '200–2000 employees',
      industry: 'B2B SaaS, Financial Services, Professional Services',
      role: 'VP Sales, Revenue Operations, SDR Managers',
      pain_points: [
        'Reps spend too much time on non-ICP accounts',
        'CRM data is stale and incomplete',
        'No signal for when to reach out',
      ],
      budget_range: '$30k–$150k/year',
    },
    positioning: {
      value_proposition:
        'Replace gut-feel prioritization with AI-driven revenue signals so reps focus only on accounts ready to buy.',
      differentiators: [
        'Real-time buying intent from 50+ data sources',
        'Native CRM sync with zero manual entry',
        'Explainable AI — reps see why each account is flagged',
      ],
      competitors: ['6sense', 'Bombora', 'G2 Buyer Intent'],
      category: 'Revenue Intelligence / Buyer Intent',
    },
    growth_brief: {
      summary:
        'Acme AI is well-positioned in the revenue intelligence space with a strong PLG motion for SMB and an enterprise sales motion above $50k ACV. Primary growth lever is integration partnerships with major CRMs and SEPs.',
      opportunities: [
        'Salesforce AppExchange listing — 150k+ admin installs per month',
        'Outreach.io native integration — shared ICP with high overlap',
        'G2 review generation campaign — 3x qualified lead lift',
        'HubSpot marketplace — 20k+ active users in ICP',
      ],
      recommended_channels: [
        'Integration marketplace listings',
        'Co-marketing with CRM partners',
        'G2 / Capterra review campaigns',
        'LinkedIn thought leadership (VP Sales audience)',
      ],
      partnership_categories: [
        'CRM integrations',
        'Sales engagement platforms',
        'Revenue operations tools',
        'Intent data providers',
      ],
    },
    brand_voice:
      'Direct, data-driven, and credible. We speak in outcomes and numbers. No fluff.',
    target_audience:
      'VP of Sales and RevOps leaders at B2B SaaS companies with 50–500 person sales teams.',
    goals: [
      'Grow to $10M ARR by end of 2026',
      'Sign 3 integration partnerships with top CRMs',
      'Increase inbound from G2/Capterra by 40%',
    ],
    status: 'complete',
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-05-10T16:00:00Z',
  },
  {
    id: 'bp-0000-0000-0000-000000000002',
    organization_id: '00000000-0000-0000-0000-000000000002',
    name: 'Demo Corp — HR Automation',
    website_url: 'https://democorp.example.com',
    description: 'HR workflow automation for mid-market companies.',
    icp: null,
    positioning: null,
    growth_brief: null,
    brand_voice: null,
    target_audience: null,
    goals: [],
    status: 'draft',
    created_at: '2026-04-01T10:00:00Z',
    updated_at: '2026-04-01T10:00:00Z',
  },
]

export const MOCK_PROFILE_ID = 'bp-0000-0000-0000-000000000001'
