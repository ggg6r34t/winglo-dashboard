-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- ── organizations ────────────────────────────────────────
CREATE TABLE organizations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  logo_url    TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── business_profiles ────────────────────────────────────
CREATE TABLE business_profiles (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  website_url      TEXT,
  description      TEXT,
  icp              JSONB,
  positioning      JSONB,
  growth_brief     JSONB,
  brand_voice      TEXT,
  target_audience  TEXT,
  goals            TEXT[] NOT NULL DEFAULT '{}',
  status           TEXT NOT NULL DEFAULT 'draft'
                   CHECK (status IN ('draft', 'processing', 'complete')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── opportunities ─────────────────────────────────────────
CREATE TABLE opportunities (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  business_profile_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  company_name        TEXT NOT NULL,
  company_url         TEXT,
  company_description TEXT,
  opportunity_type    TEXT NOT NULL
                      CHECK (opportunity_type IN (
                        'integration', 'co-marketing', 'reseller',
                        'distribution', 'technology', 'strategic'
                      )),
  score               INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  score_rationale     JSONB,
  estimated_impact    TEXT,
  status              TEXT NOT NULL DEFAULT 'new'
                      CHECK (status IN (
                        'new', 'reviewing', 'approved', 'rejected', 'contacted'
                      )),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── outreach_drafts ──────────────────────────────────────
CREATE TABLE outreach_drafts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  opportunity_id  UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  channel         TEXT NOT NULL CHECK (channel IN ('email', 'linkedin', 'proposal')),
  subject         TEXT,
  body            TEXT NOT NULL,
  tone            TEXT NOT NULL DEFAULT 'professional'
                  CHECK (tone IN ('professional', 'warm', 'direct')),
  status          TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'approved', 'sent', 'rejected')),
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── memory_entries ───────────────────────────────────────
CREATE TABLE memory_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  entry_type      TEXT NOT NULL
                  CHECK (entry_type IN (
                    'partner_interaction', 'learning', 'observation'
                  )),
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  source          TEXT NOT NULL,
  related_company TEXT,
  embedding       VECTOR(1536),
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── ai_runs ──────────────────────────────────────────────
CREATE TABLE ai_runs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_type      TEXT NOT NULL
                  CHECK (agent_type IN (
                    'intake', 'research', 'discovery', 'scoring',
                    'outreach', 'memory', 'analytics'
                  )),
  status          TEXT NOT NULL DEFAULT 'queued'
                  CHECK (status IN ('queued', 'running', 'complete', 'failed')),
  input           JSONB,
  output          JSONB,
  error           TEXT,
  duration_ms     INTEGER,
  tokens_used     INTEGER,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── agent_logs ───────────────────────────────────────────
CREATE TABLE agent_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_run_id       UUID NOT NULL REFERENCES ai_runs(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  level           TEXT NOT NULL CHECK (level IN ('info', 'warning', 'error')),
  message         TEXT NOT NULL,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── analytics_snapshots ──────────────────────────────────
CREATE TABLE analytics_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  snapshot_date   DATE NOT NULL,
  metrics         JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, snapshot_date)
);

-- ── Indexes ───────────────────────────────────────────────
CREATE INDEX idx_business_profiles_org ON business_profiles(organization_id);
CREATE INDEX idx_opportunities_org ON opportunities(organization_id);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_score ON opportunities(score DESC);
CREATE INDEX idx_opportunities_profile ON opportunities(business_profile_id);
CREATE INDEX idx_outreach_drafts_org ON outreach_drafts(organization_id);
CREATE INDEX idx_outreach_drafts_status ON outreach_drafts(status);
CREATE INDEX idx_outreach_drafts_opportunity ON outreach_drafts(opportunity_id);
CREATE INDEX idx_memory_entries_org ON memory_entries(organization_id);
CREATE INDEX idx_memory_entries_type ON memory_entries(entry_type);
CREATE INDEX idx_memory_entries_company ON memory_entries(related_company);
CREATE INDEX idx_ai_runs_org_created ON ai_runs(organization_id, created_at DESC);
CREATE INDEX idx_ai_runs_status ON ai_runs(status);
CREATE INDEX idx_ai_runs_agent_type ON ai_runs(agent_type);
CREATE INDEX idx_agent_logs_run ON agent_logs(ai_run_id, created_at);
CREATE INDEX idx_analytics_org_date ON analytics_snapshots(organization_id, snapshot_date DESC);

-- pgvector index (IVFFlat for cosine similarity)
CREATE INDEX idx_memory_embedding ON memory_entries
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ── Row Level Security ────────────────────────────────────
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS policy pattern: every table reads app.current_org_id
CREATE POLICY "org_isolation" ON organizations
  USING (id = current_setting('app.current_org_id', TRUE)::UUID);

CREATE POLICY "org_isolation" ON business_profiles
  USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID);

CREATE POLICY "org_isolation" ON opportunities
  USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID);

CREATE POLICY "org_isolation" ON outreach_drafts
  USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID);

CREATE POLICY "org_isolation" ON memory_entries
  USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID);

CREATE POLICY "org_isolation" ON ai_runs
  USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID);

CREATE POLICY "org_isolation" ON agent_logs
  USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID);

CREATE POLICY "org_isolation" ON analytics_snapshots
  USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID);

-- ── Seed org for mock/dev mode ─────────────────────────────
-- ID is hardcoded so mock fixtures can reference it
INSERT INTO organizations (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000001', 'Acme AI', 'acme-ai');

INSERT INTO organizations (id, name, slug)
VALUES ('00000000-0000-0000-0000-000000000002', 'Demo Corp', 'demo-corp');
