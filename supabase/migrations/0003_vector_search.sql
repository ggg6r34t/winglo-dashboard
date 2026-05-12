CREATE OR REPLACE FUNCTION search_memories_by_similarity(
  p_org_id UUID,
  p_embedding VECTOR(1536),
  p_limit INTEGER DEFAULT 5
)
RETURNS SETOF memory_entries
LANGUAGE sql STABLE
SECURITY DEFINER
AS $$
  SELECT *
  FROM memory_entries
  WHERE organization_id = p_org_id
    AND embedding IS NOT NULL
  ORDER BY embedding <=> p_embedding
  LIMIT p_limit;
$$;

REVOKE ALL ON FUNCTION search_memories_by_similarity(UUID, VECTOR, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION search_memories_by_similarity(UUID, VECTOR, INTEGER) TO service_role;
