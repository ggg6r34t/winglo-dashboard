export type OrganizationStatus = 'active' | 'inactive'

export interface Organization {
  id: string
  name: string
  slug: string
  logo_url: string | null
  monitoring_enabled: boolean
  created_at: string
  updated_at: string
}

export type BusinessProfileStatus = 'draft' | 'processing' | 'complete'

export interface ICP {
  company_size?: string
  industry?: string
  role?: string
  pain_points?: string[]
  budget_range?: string
}

export interface Positioning {
  value_proposition?: string
  differentiators?: string[]
  competitors?: string[]
  category?: string
}

export interface GrowthBrief {
  summary?: string
  opportunities?: string[]
  recommended_channels?: string[]
  partnership_categories?: string[]
}

export interface BusinessProfile {
  id: string
  organization_id: string
  name: string
  website_url: string | null
  description: string | null
  icp: ICP | null
  positioning: Positioning | null
  growth_brief: GrowthBrief | null
  brand_voice: string | null
  target_audience: string | null
  goals: string[]
  status: BusinessProfileStatus
  created_at: string
  updated_at: string
}

export type OpportunityType =
  | 'integration'
  | 'co-marketing'
  | 'reseller'
  | 'distribution'
  | 'technology'
  | 'strategic'

export type OpportunityStatus =
  | 'new'
  | 'reviewing'
  | 'approved'
  | 'rejected'
  | 'contacted'

export interface ScoreRationale {
  strategic_fit: string
  audience_overlap: string
  growth_potential: string
  ease_of_execution: string
}

export interface Opportunity {
  id: string
  organization_id: string
  business_profile_id: string
  company_name: string
  company_url: string | null
  company_description: string | null
  opportunity_type: OpportunityType
  score: number
  score_rationale: ScoreRationale | null
  estimated_impact: string | null
  status: OpportunityStatus
  created_at: string
  updated_at: string
}

export type OutreachChannel = 'email' | 'linkedin' | 'proposal'
export type OutreachTone = 'professional' | 'warm' | 'direct'
export type OutreachStatus = 'draft' | 'approved' | 'sent' | 'rejected'

export interface OutreachDraft {
  id: string
  organization_id: string
  opportunity_id: string
  channel: OutreachChannel
  subject: string | null
  body: string
  tone: OutreachTone
  status: OutreachStatus
  sent_at: string | null
  created_at: string
  updated_at: string
}

export type MemoryEntryType = 'partner_interaction' | 'learning' | 'observation'

export interface MemoryEntry {
  id: string
  organization_id: string
  entry_type: MemoryEntryType
  title: string
  body: string
  source: string
  related_company: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export type AgentType =
  | 'intake'
  | 'research'
  | 'discovery'
  | 'scoring'
  | 'outreach'
  | 'memory'
  | 'analytics'

export type AIRunStatus = 'queued' | 'running' | 'complete' | 'failed'

export interface AIRun {
  id: string
  organization_id: string
  agent_type: AgentType
  status: AIRunStatus
  input: Record<string, unknown> | null
  output: Record<string, unknown> | null
  error: string | null
  duration_ms: number | null
  tokens_used: number | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

export type LogLevel = 'info' | 'warning' | 'error'

export interface AgentLog {
  id: string
  ai_run_id: string
  organization_id: string
  level: LogLevel
  message: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface AnalyticsMetrics {
  outreach_sent: number
  outreach_approved: number
  opportunities_discovered: number
  opportunities_approved: number
  response_rate: number
  avg_score: number
}

export interface AnalyticsSnapshot {
  id: string
  organization_id: string
  snapshot_date: string
  metrics: AnalyticsMetrics
  created_at: string
}
