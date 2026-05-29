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

export type AgentDeploymentStatus = 'idle' | 'active' | 'paused' | 'not-deployed'

export interface AIAgent {
  id: string
  organization_id: string
  slug: string
  name: string
  department: string
  mission: string
  capabilities: string[]
  deployed: boolean
  status: AgentDeploymentStatus
  config: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type ActivitySeverity = 'info' | 'success' | 'warning' | 'error'

export interface ActivityEvent {
  id: string
  organization_id: string
  agent_slug: string | null
  actor_type: 'user' | 'agent' | 'system'
  event_type: string
  entity_type: string | null
  entity_id: string | null
  severity: ActivitySeverity
  message: string
  metadata: Record<string, unknown>
  created_at: string
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'
export type ApprovalUrgency = 'high' | 'med' | 'low'

export interface Approval {
  id: string
  organization_id: string
  agent_slug: string
  approval_type: string
  title: string
  summary: string
  entity_type: string | null
  entity_id: string | null
  status: ApprovalStatus
  urgency: ApprovalUrgency
  requested_by_run_id: string | null
  decided_by: string | null
  decided_at: string | null
  decision_note: string | null
  created_at: string
  updated_at: string
}

export type WorkflowStatus = 'run' | 'done' | 'wait'
export type WorkflowRunStatus = 'done' | 'fail' | 'run'

export interface WorkflowRunSummary {
  id: string
  time: string
  dur: string
  state: WorkflowRunStatus
}

export interface WorkflowDefinition {
  id: string
  organization_id: string
  agent_slug: string
  key: string
  title: string
  state: WorkflowStatus
  runs: number
  success: number
  schedule: string
  last_run: string
  description: string
  avg_duration: string
  enabled: boolean
  trigger_type: 'manual' | 'schedule' | 'event'
  approval_policy: Record<string, unknown>
  config: Record<string, unknown>
  runs_recent: WorkflowRunSummary[]
  created_at: string
  updated_at: string
}

export type ReportStatus = 'draft' | 'published' | 'archived'

export interface Report {
  id: string
  organization_id: string
  agent_slug: string
  source_run_id: string | null
  title: string
  summary: string
  category: string
  status: ReportStatus
  pinned: boolean
  tags: string[]
  created_at: string
  updated_at: string
}

export interface ReportArtifact {
  id: string
  report_id: string
  artifact_type: 'text' | 'json' | 'file'
  content_text: string | null
  content_json: Record<string, unknown> | null
  storage_url: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface Connector {
  id: string
  key: string
  name: string
  category: string
  scopes: string[]
  oauth_enabled: boolean
  created_at: string
}

export type ConnectorAccountStatus = 'connected' | 'attention' | 'error' | 'not_connected'

export interface ConnectorAccount {
  id: string
  organization_id: string
  connector_id: string
  connector: Connector
  status: ConnectorAccountStatus
  scopes: string[]
  last_sync_at: string | null
  error: string | null
  config: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type InboxFilter = 'all' | 'unread' | 'decisions' | 'reports' | 'operational'
export type InboxCategory = 'decision' | 'report' | 'operational' | 'message'
export type InboxStatus = 'open' | 'resolved'
export type InboxPriority = 'low' | 'normal' | 'high' | 'urgent'
export type InboxActionType = 'approval' | 'reply' | 'review' | null

export interface InboxArtifact {
  id: string
  organization_id: string
  inbox_item_id: string
  artifact_type: 'report' | 'file' | 'approval' | 'link'
  name: string
  meta: string
  icon: string
  source_type: string | null
  source_id: string | null
  storage_path: string | null
  open_href: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface InboxComment {
  id: string
  organization_id: string
  inbox_item_id: string
  author_type: 'user' | 'agent' | 'system'
  author_id: string | null
  agent_slug: string | null
  body: string
  created_at: string
}

export interface InboxItem {
  id: string
  organization_id: string
  agent_slug: string | null
  agent_name: string | null
  agent_role: string | null
  actor_type: 'user' | 'agent' | 'system'
  category: InboxCategory
  title: string
  preview: string
  body: string[]
  status: InboxStatus
  priority: InboxPriority
  requires_action: boolean
  action_type: InboxActionType
  source_type: string | null
  source_id: string | null
  read_at: string | null
  resolved_at: string | null
  archived_at: string | null
  created_at: string
  updated_at: string
  tags: string[]
  artifacts: InboxArtifact[]
  comments: InboxComment[]
}

export interface InboxCounts {
  all: number
  unread: number
  decisions: number
  reports: number
  operational: number
}
