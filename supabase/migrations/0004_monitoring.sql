-- Add continuous monitoring flag to organizations
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS monitoring_enabled BOOLEAN NOT NULL DEFAULT FALSE;
