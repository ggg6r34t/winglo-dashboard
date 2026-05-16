export type AgentSlug =
  | 'growth'
  | 'social-media'
  | 'seo'
  | 'marketing'
  | 'telehealth'
  | 'sales'
  | 'research'
  | 'outreach'
  | 'analytics-manager'

export interface AgentConfig {
  slug: AgentSlug
  name: string
  department: string
  accent: string
  mission: string
  capabilities: string[]
  deployed: boolean
  standbyText: string
}

export const AGENT_REGISTRY: AgentConfig[] = [
  {
    slug: 'growth',
    name: 'Head of Growth & Partnerships',
    department: 'Growth & Outreach',
    accent: '#6366f1',
    mission: 'Identifies, qualifies, and engages high-value partnership opportunities at scale.',
    capabilities: [
      'Opportunity discovery and scoring',
      'Automated outreach drafting',
      'Partnership pipeline management',
      'Institutional memory and knowledge',
      'Real-time orchestration visibility',
    ],
    deployed: true,
    standbyText: 'Scanning for partnership opportunities',
  },
  {
    slug: 'social-media',
    name: 'Social Media Manager',
    department: 'Brand & Content',
    accent: '#ec4899',
    mission: 'Manages brand presence across social platforms with consistent, on-brand content.',
    capabilities: [
      'Multi-platform content scheduling',
      'Engagement monitoring and response',
      'Trend analysis and content ideation',
      'Performance analytics',
      'Brand voice consistency',
    ],
    deployed: false,
    standbyText: 'Monitoring social channels',
  },
  {
    slug: 'seo',
    name: 'SEO Manager',
    department: 'Organic Growth',
    accent: '#f59e0b',
    mission: 'Drives organic search visibility through technical SEO, content strategy, and link intelligence.',
    capabilities: [
      'Keyword research and clustering',
      'Technical SEO audits',
      'Content gap analysis',
      'Backlink monitoring',
      'Rank tracking and reporting',
    ],
    deployed: false,
    standbyText: 'Analyzing search landscape',
  },
  {
    slug: 'marketing',
    name: 'Marketing Manager',
    department: 'Marketing',
    accent: '#10b981',
    mission: 'Coordinates multi-channel marketing campaigns and tracks funnel performance.',
    capabilities: [
      'Campaign planning and execution',
      'Funnel analytics',
      'A/B test coordination',
      'Messaging and positioning',
      'Cross-channel attribution',
    ],
    deployed: false,
    standbyText: 'Monitoring campaign performance',
  },
  {
    slug: 'telehealth',
    name: 'Telehealth Manager',
    department: 'Healthcare Partnerships',
    accent: '#06b6d4',
    mission: 'Identifies and engages telehealth providers and healthcare partnerships.',
    capabilities: [
      'Provider network discovery',
      'Compliance-aware outreach',
      'Partnership qualification',
      'Healthcare market intelligence',
      'Integration opportunity mapping',
    ],
    deployed: false,
    standbyText: 'Monitoring telehealth market',
  },
  {
    slug: 'sales',
    name: 'Sales & Customer Success',
    department: 'Revenue',
    accent: '#8b5cf6',
    mission: 'Manages the sales pipeline and ensures customer success from onboarding to renewal.',
    capabilities: [
      'Lead qualification and scoring',
      'Pipeline management',
      'Customer onboarding coordination',
      'Churn risk detection',
      'Renewal and expansion tracking',
    ],
    deployed: false,
    standbyText: 'Monitoring pipeline activity',
  },
  {
    slug: 'research',
    name: 'Research Analyst',
    department: 'Market Intelligence',
    accent: '#64748b',
    mission: 'Conducts deep market research and synthesizes intelligence for strategic decisions.',
    capabilities: [
      'Market landscape analysis',
      'Competitor monitoring',
      'Research report generation',
      'Signal detection and summarization',
      'Strategic briefing preparation',
    ],
    deployed: false,
    standbyText: 'Monitoring market signals',
  },
  {
    slug: 'outreach',
    name: 'Outreach Manager',
    department: 'Growth & Outreach',
    accent: '#f97316',
    mission: 'Orchestrates personalized outreach campaigns across channels and tracks response rates.',
    capabilities: [
      'Campaign sequencing',
      'Personalization at scale',
      'Multi-channel coordination',
      'Response tracking and follow-up',
      'Template optimization',
    ],
    deployed: false,
    standbyText: 'Monitoring outreach campaigns',
  },
  {
    slug: 'analytics-manager',
    name: 'Analytics Manager',
    department: 'Performance Intelligence',
    accent: '#3b82f6',
    mission: 'Delivers real-time analytics, performance insights, and data-driven recommendations.',
    capabilities: [
      'Dashboard and report generation',
      'KPI tracking and alerting',
      'Cohort and funnel analysis',
      'Anomaly detection',
      'Executive summary generation',
    ],
    deployed: false,
    standbyText: 'Monitoring performance metrics',
  },
]

export function getAgentBySlug(slug: AgentSlug): AgentConfig {
  const agent = AGENT_REGISTRY.find(a => a.slug === slug)
  if (!agent) throw new Error(`Agent not found: ${slug}`)
  return agent
}

export function getDeployedAgents(): AgentConfig[] {
  return AGENT_REGISTRY.filter(a => a.deployed)
}
