-- Helper function to set org context for RLS enforcement.
-- Called by createOrgScopedClient() in lib/supabase/server.ts before any data query.
-- All tables use: USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID)
CREATE OR REPLACE FUNCTION set_org_context(org_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config('app.current_org_id', org_id::TEXT, TRUE);
END;
$$;

-- Revoke public access, grant to service role only
REVOKE ALL ON FUNCTION set_org_context(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION set_org_context(UUID) TO service_role;
