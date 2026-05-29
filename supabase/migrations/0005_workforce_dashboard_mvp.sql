-- Workforce dashboard MVP production tables.

CREATE TABLE IF NOT EXISTS ai_agents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  slug            TEXT NOT NULL,
  name            TEXT NOT NULL,
  department      TEXT NOT NULL,
  mission         TEXT NOT NULL,
  capabilities    TEXT[] NOT NULL DEFAULT '{}',
  deployed        BOOLEAN NOT NULL DEFAULT false,
  status          TEXT NOT NULL DEFAULT 'not-deployed'
                  CHECK (status IN ('idle', 'active', 'paused', 'not-deployed')),
  config          JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, slug)
);

CREATE TABLE IF NOT EXISTS activity_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_slug      TEXT,
  actor_type      TEXT NOT NULL DEFAULT 'system'
                  CHECK (actor_type IN ('user', 'agent', 'system')),
  event_type      TEXT NOT NULL,
  entity_type     TEXT,
  entity_id       TEXT,
  severity        TEXT NOT NULL DEFAULT 'info'
                  CHECK (severity IN ('info', 'success', 'warning', 'error')),
  message         TEXT NOT NULL,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflows (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_slug      TEXT NOT NULL,
  key             TEXT NOT NULL,
  title           TEXT NOT NULL,
  state           TEXT NOT NULL DEFAULT 'wait' CHECK (state IN ('run', 'done', 'wait')),
  runs            INTEGER NOT NULL DEFAULT 0,
  success         NUMERIC NOT NULL DEFAULT 0,
  schedule        TEXT NOT NULL DEFAULT 'Manual',
  last_run        TEXT NOT NULL DEFAULT 'Never',
  description     TEXT NOT NULL DEFAULT '',
  avg_duration    TEXT NOT NULL DEFAULT '-',
  enabled         BOOLEAN NOT NULL DEFAULT true,
  trigger_type    TEXT NOT NULL DEFAULT 'manual' CHECK (trigger_type IN ('manual', 'schedule', 'event')),
  approval_policy JSONB NOT NULL DEFAULT '{}',
  config          JSONB NOT NULL DEFAULT '{}',
  runs_recent     JSONB NOT NULL DEFAULT '[]',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, key)
);

CREATE TABLE IF NOT EXISTS workflow_steps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id     UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  step_order      INTEGER NOT NULL,
  step_type       TEXT NOT NULL,
  title           TEXT NOT NULL,
  config          JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workflow_id, step_order)
);

CREATE TABLE IF NOT EXISTS workflow_runs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  workflow_id     UUID REFERENCES workflows(id) ON DELETE SET NULL,
  agent_slug      TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'queued'
                  CHECK (status IN ('queued', 'running', 'complete', 'failed')),
  input           JSONB,
  output          JSONB,
  error           TEXT,
  metrics         JSONB NOT NULL DEFAULT '{}',
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflow_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_run_id UUID NOT NULL REFERENCES workflow_runs(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL,
  message         TEXT NOT NULL,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS approvals (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_slug          TEXT NOT NULL,
  approval_type       TEXT NOT NULL,
  title               TEXT NOT NULL,
  summary             TEXT NOT NULL,
  entity_type         TEXT,
  entity_id           TEXT,
  status              TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'approved', 'rejected')),
  urgency             TEXT NOT NULL DEFAULT 'low'
                      CHECK (urgency IN ('high', 'med', 'low')),
  requested_by_run_id UUID REFERENCES ai_runs(id) ON DELETE SET NULL,
  decided_by          TEXT,
  decided_at          TIMESTAMPTZ,
  decision_note       TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_slug      TEXT NOT NULL,
  source_run_id   UUID REFERENCES ai_runs(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  summary         TEXT NOT NULL,
  category        TEXT NOT NULL DEFAULT 'General',
  status          TEXT NOT NULL DEFAULT 'published'
                  CHECK (status IN ('draft', 'published', 'archived')),
  pinned          BOOLEAN NOT NULL DEFAULT false,
  tags            TEXT[] NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS report_artifacts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id       UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  artifact_type   TEXT NOT NULL CHECK (artifact_type IN ('text', 'json', 'file')),
  content_text    TEXT,
  content_json    JSONB,
  storage_url     TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS connectors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key             TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL,
  scopes          TEXT[] NOT NULL DEFAULT '{}',
  oauth_enabled   BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS connector_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  connector_id    UUID NOT NULL REFERENCES connectors(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'not_connected'
                  CHECK (status IN ('connected', 'attention', 'error', 'not_connected')),
  scopes          TEXT[] NOT NULL DEFAULT '{}',
  oauth_metadata  JSONB NOT NULL DEFAULT '{}',
  last_sync_at    TIMESTAMPTZ,
  error           TEXT,
  config          JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, connector_id)
);

CREATE TABLE IF NOT EXISTS connector_sync_runs (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connector_account_id UUID NOT NULL REFERENCES connector_accounts(id) ON DELETE CASCADE,
  organization_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  status               TEXT NOT NULL DEFAULT 'queued'
                       CHECK (status IN ('queued', 'running', 'complete', 'failed')),
  records_read         INTEGER NOT NULL DEFAULT 0,
  records_written      INTEGER NOT NULL DEFAULT 0,
  error                TEXT,
  started_at           TIMESTAMPTZ,
  completed_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_slug      TEXT,
  severity        TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error')),
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'resolved')),
  source_type     TEXT,
  source_id       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS signals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  source_type     TEXT NOT NULL,
  source_id       TEXT,
  signal_type     TEXT NOT NULL,
  title           TEXT NOT NULL,
  summary         TEXT NOT NULL,
  confidence      NUMERIC,
  status          TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'dismissed')),
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE memory_entries
  ADD COLUMN IF NOT EXISTS agent_slug TEXT,
  ADD COLUMN IF NOT EXISTS confidence NUMERIC NOT NULL DEFAULT 0.9,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'retracted', 'superseded')),
  ADD COLUMN IF NOT EXISTS provenance JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS retracted_at TIMESTAMPTZ;

ALTER TABLE ai_runs
  ADD COLUMN IF NOT EXISTS workflow_run_id UUID REFERENCES workflow_runs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS parent_run_id UUID REFERENCES ai_runs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT;

ALTER TABLE opportunities
  ADD COLUMN IF NOT EXISTS source_run_id UUID REFERENCES ai_runs(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_agent_slug TEXT,
  ADD COLUMN IF NOT EXISTS decision_by TEXT,
  ADD COLUMN IF NOT EXISTS decision_at TIMESTAMPTZ;

ALTER TABLE outreach_drafts
  ADD COLUMN IF NOT EXISTS approval_id UUID REFERENCES approvals(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS artifact_id UUID REFERENCES report_artifacts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS recipient_metadata JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS provider_metadata JSONB NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_ai_agents_org_slug ON ai_agents(organization_id, slug);
CREATE INDEX IF NOT EXISTS idx_activity_events_org_created ON activity_events(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflows_org_agent ON workflows(organization_id, agent_slug);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_workflow_created ON workflow_runs(workflow_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approvals_org_status_created ON approvals(organization_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_org_created ON reports(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_connector_accounts_org_status ON connector_accounts(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_connector_sync_runs_org_created ON connector_sync_runs(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_org_status_created ON alerts(organization_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_org_status_created ON signals(organization_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memory_entries_org_agent_status ON memory_entries(organization_id, agent_slug, status);
CREATE INDEX IF NOT EXISTS idx_ai_runs_idempotency ON ai_runs(organization_id, idempotency_key);

ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE connector_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE connector_sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON ai_agents
  USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID);
CREATE POLICY "org_isolation" ON activity_events
  USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID);
CREATE POLICY "org_isolation" ON workflows
  USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID);
CREATE POLICY "org_isolation" ON workflow_runs
  USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID);
CREATE POLICY "org_isolation" ON workflow_events
  USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID);
CREATE POLICY "org_isolation" ON approvals
  USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID);
CREATE POLICY "org_isolation" ON reports
  USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID);
CREATE POLICY "org_isolation" ON connector_accounts
  USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID);
CREATE POLICY "org_isolation" ON connector_sync_runs
  USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID);
CREATE POLICY "org_isolation" ON alerts
  USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID);
CREATE POLICY "org_isolation" ON signals
  USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID);

CREATE POLICY "workflow_step_org_isolation" ON workflow_steps
  USING (
    EXISTS (
      SELECT 1 FROM workflows
      WHERE workflows.id = workflow_steps.workflow_id
        AND workflows.organization_id = current_setting('app.current_org_id', TRUE)::UUID
    )
  );

CREATE POLICY "report_artifact_org_isolation" ON report_artifacts
  USING (
    EXISTS (
      SELECT 1 FROM reports
      WHERE reports.id = report_artifacts.report_id
        AND reports.organization_id = current_setting('app.current_org_id', TRUE)::UUID
    )
  );

CREATE POLICY "connector_catalog_read" ON connectors
  FOR SELECT USING (true);

INSERT INTO connectors (key, name, category, scopes, oauth_enabled)
VALUES
  ('hubspot', 'HubSpot', 'CRM', ARRAY['contacts.read', 'contacts.write'], true),
  ('salesforce', 'Salesforce', 'CRM', ARRAY['crm.read'], true),
  ('gmail', 'Gmail', 'Email', ARRAY['mail.send'], true),
  ('ga4', 'Google Analytics 4', 'Analytics', ARRAY['analytics.readonly'], true),
  ('google-search-console', 'Google Search Console', 'Analytics', ARRAY['webmasters.readonly'], true),
  ('slack', 'Slack', 'Communication', ARRAY['chat.write'], true),
  ('stripe', 'Stripe', 'Payments', ARRAY['read_only'], false)
ON CONFLICT (key) DO NOTHING;

INSERT INTO ai_agents (
  organization_id, slug, name, department, mission, capabilities, deployed, status, config
)
SELECT
  organizations.id,
  seed.slug,
  seed.name,
  seed.department,
  seed.mission,
  seed.capabilities,
  seed.deployed,
  CASE WHEN seed.deployed THEN 'idle' ELSE 'not-deployed' END,
  seed.config
FROM organizations
CROSS JOIN (
  VALUES
    ('growth', 'Head of Growth & Partnerships', 'Growth & Outreach', 'Identifies, qualifies, and engages high-value partnership opportunities at scale.', ARRAY['Opportunity discovery and scoring','Automated outreach drafting','Partnership pipeline management','Institutional memory and knowledge','Real-time orchestration visibility'], true, '{"accent":"#6366f1","standbyText":"Scanning for partnership opportunities"}'::jsonb),
    ('social-media', 'Social Media Manager', 'Brand & Content', 'Manages brand presence across social platforms with consistent, on-brand content.', ARRAY['Multi-platform content scheduling','Engagement monitoring and response','Trend analysis and content ideation','Performance analytics','Brand voice consistency'], false, '{"accent":"#ec4899","standbyText":"Monitoring social channels"}'::jsonb),
    ('seo', 'SEO Manager', 'Organic Growth', 'Drives organic search visibility through technical SEO, content strategy, and link intelligence.', ARRAY['Keyword research and clustering','Technical SEO audits','Content gap analysis','Backlink monitoring','Rank tracking and reporting'], false, '{"accent":"#f59e0b","standbyText":"Analyzing search landscape"}'::jsonb),
    ('marketing', 'Marketing Manager', 'Marketing', 'Coordinates multi-channel marketing campaigns and tracks funnel performance.', ARRAY['Campaign planning and execution','Funnel analytics','A/B test coordination','Messaging and positioning','Cross-channel attribution'], false, '{"accent":"#10b981","standbyText":"Monitoring campaign performance"}'::jsonb),
    ('telehealth', 'Telehealth Manager', 'Healthcare Partnerships', 'Identifies and engages telehealth providers and healthcare partnerships.', ARRAY['Provider network discovery','Compliance-aware outreach','Partnership qualification','Healthcare market intelligence','Integration opportunity mapping'], false, '{"accent":"#06b6d4","standbyText":"Monitoring telehealth market"}'::jsonb),
    ('sales', 'Sales & Customer Success', 'Revenue', 'Manages the sales pipeline and ensures customer success from onboarding to renewal.', ARRAY['Lead qualification and scoring','Pipeline management','Customer onboarding coordination','Churn risk detection','Renewal and expansion tracking'], false, '{"accent":"#8b5cf6","standbyText":"Monitoring pipeline activity"}'::jsonb),
    ('research', 'Research Analyst', 'Market Intelligence', 'Conducts deep market research and synthesizes intelligence for strategic decisions.', ARRAY['Market landscape analysis','Competitor monitoring','Research report generation','Signal detection and summarization','Strategic briefing preparation'], false, '{"accent":"#64748b","standbyText":"Monitoring market signals"}'::jsonb),
    ('outreach', 'Outreach Manager', 'Growth & Outreach', 'Orchestrates personalized outreach campaigns across channels and tracks response rates.', ARRAY['Campaign sequencing','Personalization at scale','Multi-channel coordination','Response tracking and follow-up','Template optimization'], false, '{"accent":"#f97316","standbyText":"Monitoring outreach campaigns"}'::jsonb),
    ('analytics-manager', 'Analytics Manager', 'Performance Intelligence', 'Delivers real-time analytics, performance insights, and data-driven recommendations.', ARRAY['Dashboard and report generation','KPI tracking and alerting','Cohort and funnel analysis','Anomaly detection','Executive summary generation'], false, '{"accent":"#3b82f6","standbyText":"Monitoring performance metrics"}'::jsonb)
) AS seed(slug, name, department, mission, capabilities, deployed, config)
ON CONFLICT (organization_id, slug) DO NOTHING;
