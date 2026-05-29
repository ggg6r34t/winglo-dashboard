-- Workspace inbox MVQP production tables.

CREATE TABLE IF NOT EXISTS notification_inbox (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_slug      TEXT,
  agent_name      TEXT,
  agent_role      TEXT,
  actor_type      TEXT NOT NULL DEFAULT 'system'
                  CHECK (actor_type IN ('user', 'agent', 'system')),
  category        TEXT NOT NULL DEFAULT 'message'
                  CHECK (category IN ('decision', 'report', 'operational', 'message')),
  title           TEXT NOT NULL,
  preview         TEXT NOT NULL,
  body            TEXT[] NOT NULL DEFAULT '{}',
  status          TEXT NOT NULL DEFAULT 'open'
                  CHECK (status IN ('open', 'resolved')),
  priority        TEXT NOT NULL DEFAULT 'normal'
                  CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  requires_action BOOLEAN NOT NULL DEFAULT false,
  action_type     TEXT CHECK (action_type IN ('approval', 'reply', 'review')),
  source_type     TEXT,
  source_id       TEXT,
  read_at         TIMESTAMPTZ,
  resolved_at     TIMESTAMPTZ,
  archived_at     TIMESTAMPTZ,
  tags            TEXT[] NOT NULL DEFAULT '{}',
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inbox_item_reads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  inbox_item_id   UUID NOT NULL REFERENCES notification_inbox(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL,
  read_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (inbox_item_id, user_id)
);

CREATE TABLE IF NOT EXISTS inbox_comments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  inbox_item_id   UUID NOT NULL REFERENCES notification_inbox(id) ON DELETE CASCADE,
  author_type     TEXT NOT NULL DEFAULT 'user'
                  CHECK (author_type IN ('user', 'agent', 'system')),
  author_id       TEXT,
  agent_slug      TEXT,
  body            TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inbox_artifacts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  inbox_item_id   UUID NOT NULL REFERENCES notification_inbox(id) ON DELETE CASCADE,
  artifact_type   TEXT NOT NULL
                  CHECK (artifact_type IN ('report', 'file', 'approval', 'link')),
  name            TEXT NOT NULL,
  meta            TEXT NOT NULL DEFAULT '',
  icon            TEXT NOT NULL DEFAULT 'FILE',
  source_type     TEXT,
  source_id       TEXT,
  storage_path    TEXT,
  open_href       TEXT NOT NULL,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_inbox_org_created
  ON notification_inbox(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_inbox_org_category_created
  ON notification_inbox(organization_id, category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_inbox_org_action_created
  ON notification_inbox(organization_id, requires_action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_inbox_org_status_created
  ON notification_inbox(organization_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inbox_item_reads_user
  ON inbox_item_reads(organization_id, user_id, read_at DESC);
CREATE INDEX IF NOT EXISTS idx_inbox_comments_item_created
  ON inbox_comments(inbox_item_id, created_at);
CREATE INDEX IF NOT EXISTS idx_inbox_artifacts_item_created
  ON inbox_artifacts(inbox_item_id, created_at);

ALTER TABLE notification_inbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbox_item_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbox_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbox_artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation" ON notification_inbox
  USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID);
CREATE POLICY "org_isolation" ON inbox_item_reads
  USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID);
CREATE POLICY "org_isolation" ON inbox_comments
  USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID);
CREATE POLICY "org_isolation" ON inbox_artifacts
  USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID);
