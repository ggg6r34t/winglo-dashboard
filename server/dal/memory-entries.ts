import type { MemoryEntry, MemoryEntryType } from '@/types'
import { mockMemoryEntries } from '@/lib/mock'
import { createServiceClient } from '@/lib/supabase/server'

export async function createMemoryEntry(
  orgId: string,
  data: {
    entry_type: MemoryEntryType
    title: string
    body: string
    source: string
    related_company?: string | null
    metadata?: Record<string, unknown>
  }
): Promise<MemoryEntry> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return {
      id: `mem-mock-${Date.now()}`,
      organization_id: orgId,
      entry_type: data.entry_type,
      title: data.title,
      body: data.body,
      source: data.source,
      related_company: data.related_company ?? null,
      metadata: data.metadata ?? {},
      created_at: new Date().toISOString(),
    }
  }
  const supabase = await createServiceClient()
  const { data: created, error } = await supabase
    .from('memory_entries')
    .insert({ organization_id: orgId, ...data })
    .select()
    .single()
  if (error) throw error

  // Generate embedding and store (fire-and-forget on error)
  try {
    const { generateEmbedding } = await import('@/lib/ai/embeddings')
    const embeddingVector = await generateEmbedding(`${data.title}\n${data.body}`)
    await supabase
      .from('memory_entries')
      .update({ embedding: embeddingVector as unknown as string })
      .eq('id', created.id)
  } catch (embeddingError) {
    console.error('Failed to store embedding:', embeddingError)
  }

  return created
}

export async function getMemoryEntries(
  orgId: string,
  options: { type?: MemoryEntryType; relatedCompany?: string; limit?: number } = {}
): Promise<MemoryEntry[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    let results = mockMemoryEntries.filter(m => m.organization_id === orgId)
    if (options.type) results = results.filter(m => m.entry_type === options.type)
    if (options.relatedCompany) results = results.filter(m => m.related_company === options.relatedCompany)
    results = results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    if (options.limit) results = results.slice(0, options.limit)
    return results
  }
  const supabase = await createServiceClient()
  let query = supabase
    .from('memory_entries')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
  if (options.type) query = query.eq('entry_type', options.type)
  if (options.relatedCompany) query = query.eq('related_company', options.relatedCompany)
  if (options.limit) query = query.limit(options.limit)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getRelevantMemoriesByCompany(
  orgId: string,
  companyName: string,
  limit = 3
): Promise<MemoryEntry[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return mockMemoryEntries
      .filter(
        m =>
          m.organization_id === orgId &&
          m.related_company?.toLowerCase() === companyName.toLowerCase()
      )
      .slice(0, limit)
  }
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('memory_entries')
    .select('*')
    .eq('organization_id', orgId)
    .ilike('related_company', `%${companyName}%`)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}

export async function searchMemoriesBySimilarity(
  orgId: string,
  queryText: string,
  limit = 5
): Promise<MemoryEntry[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    const lower = queryText.toLowerCase()
    const results = mockMemoryEntries
      .filter(m => m.organization_id === orgId)
      .filter(
        m =>
          m.title.toLowerCase().includes(lower) ||
          m.body.toLowerCase().includes(lower) ||
          (m.related_company?.toLowerCase().includes(lower) ?? false)
      )
    return results.length > 0
      ? results.slice(0, limit)
      : mockMemoryEntries.filter(m => m.organization_id === orgId).slice(0, limit)
  }

  const { generateEmbedding } = await import('@/lib/ai/embeddings')
  const embedding = await generateEmbedding(queryText)
  const embeddingStr = `[${embedding.join(',')}]`

  const supabase = await createServiceClient()
  const { data, error } = await supabase.rpc('search_memories_by_similarity', {
    p_org_id: orgId,
    p_embedding: embeddingStr,
    p_limit: limit,
  })
  if (error) throw error
  return (data ?? []) as MemoryEntry[]
}

export async function retractMemoryEntry(id: string): Promise<MemoryEntry> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    const existing = mockMemoryEntries.find(m => m.id === id)
    if (!existing) throw new Error(`MemoryEntry ${id} not found`)
    return {
      ...existing,
      metadata: { ...existing.metadata, status: 'retracted' },
    }
  }

  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('memory_entries')
    .update({
      status: 'retracted',
      retracted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
