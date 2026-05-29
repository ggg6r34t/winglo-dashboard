import type {
  InboxArtifact,
  InboxCategory,
  InboxComment,
  InboxCounts,
  InboxFilter,
  InboxItem,
} from '@/types'
import { createServiceClient } from '@/lib/supabase/server'

type InboxRow = Omit<InboxItem, 'artifacts' | 'comments'>

const MOCK_ORG_ID = '00000000-0000-0000-0000-000000000001'

const mockItems = new Map<string, InboxItem>()

seedMockInbox()

export async function getInboxItems(
  orgId: string,
  options: { filter?: InboxFilter; limit?: number; includeArchived?: boolean } = {},
): Promise<InboxItem[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return filterInbox(Array.from(mockItems.values()), orgId, options)
  }

  const supabase = await createServiceClient()
  let query = supabase
    .from('notification_inbox')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })

  if (!options.includeArchived) query = query.is('archived_at', null)
  if (options.filter === 'unread') query = query.is('read_at', null)
  if (options.filter === 'decisions') query = query.eq('category', 'decision')
  if (options.filter === 'reports') query = query.eq('category', 'report')
  if (options.filter === 'operational') query = query.eq('category', 'operational')
  if (options.limit) query = query.limit(options.limit)

  const { data, error } = await query
  if (error) throw error

  const rows = (data ?? []) as InboxRow[]
  return Promise.all(rows.map(row => hydrateInboxItem(row)))
}

export async function getInboxItem(orgId: string, id: string): Promise<InboxItem> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    const item = mockItems.get(id)
    if (!item || item.organization_id !== orgId) throw new Error(`Inbox item ${id} not found`)
    return cloneInboxItem(item)
  }

  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('notification_inbox')
    .select('*')
    .eq('organization_id', orgId)
    .eq('id', id)
    .single()
  if (error) throw error
  return hydrateInboxItem(data as InboxRow)
}

export async function getInboxCounts(orgId: string): Promise<InboxCounts> {
  const items = await getInboxItems(orgId, { includeArchived: false })
  return {
    all: items.length,
    unread: items.filter(item => !item.read_at).length,
    decisions: items.filter(item => item.category === 'decision').length,
    reports: items.filter(item => item.category === 'report').length,
    operational: items.filter(item => item.category === 'operational').length,
  }
}

export async function markInboxItemRead(orgId: string, id: string, userId: string): Promise<InboxItem> {
  const now = new Date().toISOString()
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return updateMockItem(orgId, id, { read_at: now, updated_at: now })
  }

  const supabase = await createServiceClient()
  await supabase.from('inbox_item_reads').upsert({
    organization_id: orgId,
    inbox_item_id: id,
    user_id: userId,
    read_at: now,
  })
  const { data, error } = await supabase
    .from('notification_inbox')
    .update({ read_at: now, updated_at: now })
    .eq('organization_id', orgId)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return hydrateInboxItem(data as InboxRow)
}

export async function archiveInboxItem(orgId: string, id: string, userId: string): Promise<InboxItem> {
  const now = new Date().toISOString()
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return updateMockItem(orgId, id, { archived_at: now, updated_at: now })
  }

  const supabase = await createServiceClient()
  await supabase.from('inbox_item_reads').upsert({
    organization_id: orgId,
    inbox_item_id: id,
    user_id: userId,
    read_at: now,
    archived_at: now,
  })
  const { data, error } = await supabase
    .from('notification_inbox')
    .update({ archived_at: now, updated_at: now })
    .eq('organization_id', orgId)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return hydrateInboxItem(data as InboxRow)
}

export async function resolveInboxItem(orgId: string, id: string, _userId: string): Promise<InboxItem> {
  const now = new Date().toISOString()
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return updateMockItem(orgId, id, { status: 'resolved', resolved_at: now, requires_action: false, updated_at: now })
  }

  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('notification_inbox')
    .update({ status: 'resolved', resolved_at: now, requires_action: false, updated_at: now })
    .eq('organization_id', orgId)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return hydrateInboxItem(data as InboxRow)
}

export async function replyToInboxItem(orgId: string, id: string, userId: string, body: string): Promise<InboxItem> {
  const trimmed = body.trim()
  if (!trimmed) throw new Error('Reply note is required')

  const now = new Date().toISOString()
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    const item = requireMockItem(orgId, id)
    const comment: InboxComment = {
      id: `comment-${Date.now()}`,
      organization_id: orgId,
      inbox_item_id: id,
      author_type: 'user',
      author_id: userId,
      agent_slug: null,
      body: trimmed,
      created_at: now,
    }
    return updateMockItem(orgId, id, { comments: [...item.comments, comment], updated_at: now })
  }

  const supabase = await createServiceClient()
  const { error } = await supabase.from('inbox_comments').insert({
    organization_id: orgId,
    inbox_item_id: id,
    author_type: 'user',
    author_id: userId,
    body: trimmed,
  })
  if (error) throw error
  return getInboxItem(orgId, id)
}

function filterInbox(
  items: InboxItem[],
  orgId: string,
  options: { filter?: InboxFilter; limit?: number; includeArchived?: boolean },
) {
  let filtered = items
    .filter(item => item.organization_id === orgId)
    .filter(item => options.includeArchived || !item.archived_at)

  if (options.filter === 'unread') filtered = filtered.filter(item => !item.read_at)
  if (options.filter === 'decisions') filtered = filtered.filter(item => item.category === 'decision')
  if (options.filter === 'reports') filtered = filtered.filter(item => item.category === 'report')
  if (options.filter === 'operational') filtered = filtered.filter(item => item.category === 'operational')

  filtered = filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  if (options.limit) filtered = filtered.slice(0, options.limit)
  return filtered.map(cloneInboxItem)
}

async function hydrateInboxItem(row: InboxRow): Promise<InboxItem> {
  const supabase = await createServiceClient()
  const [{ data: artifacts, error: artifactsError }, { data: comments, error: commentsError }] = await Promise.all([
    supabase.from('inbox_artifacts').select('*').eq('inbox_item_id', row.id).order('created_at', { ascending: true }),
    supabase.from('inbox_comments').select('*').eq('inbox_item_id', row.id).order('created_at', { ascending: true }),
  ])
  if (artifactsError) throw artifactsError
  if (commentsError) throw commentsError
  return {
    ...row,
    body: Array.isArray(row.body) ? row.body : [],
    tags: Array.isArray(row.tags) ? row.tags : [],
    artifacts: (artifacts ?? []) as InboxArtifact[],
    comments: (comments ?? []) as InboxComment[],
  }
}

function updateMockItem(orgId: string, id: string, patch: Partial<InboxItem>): InboxItem {
  const item = requireMockItem(orgId, id)
  const updated = { ...item, ...patch }
  mockItems.set(id, updated)
  return cloneInboxItem(updated)
}

function requireMockItem(orgId: string, id: string): InboxItem {
  const item = mockItems.get(id)
  if (!item || item.organization_id !== orgId) throw new Error(`Inbox item ${id} not found`)
  return item
}

function cloneInboxItem(item: InboxItem): InboxItem {
  return {
    ...item,
    body: [...item.body],
    tags: [...item.tags],
    artifacts: item.artifacts.map(artifact => ({ ...artifact })),
    comments: item.comments.map(comment => ({ ...comment })),
  }
}

function seedMockInbox() {
  if (mockItems.size > 0) return
  const now = '2026-05-29T12:00:00Z'
  const items: InboxItem[] = [
    makeItem({
      id: 'inbox-growth-approval',
      category: 'decision',
      title: 'Review Growth outreach draft',
      preview: 'Atlas prepared a partner outreach draft that needs approval before it can continue.',
      body: [
        'Atlas generated a first-touch partner outreach draft for a high-fit opportunity.',
        'Review the message in Approvals before it is marked ready for manual sending.',
      ],
      tags: ['decision', 'approval', 'growth'],
      source_type: 'approval',
      source_id: 'ap-growth-outreach-1',
      requires_action: true,
      action_type: 'approval',
      created_at: now,
      artifacts: [artifact('artifact-approval-1', 'approval', 'Outreach approval', 'approval queue', 'APP', '/workspace/approvals')],
    }),
    makeItem({
      id: 'inbox-growth-report',
      category: 'report',
      title: 'Partnership pipeline report is ready',
      preview: '32 partners contacted, 11 replied, and 4 advanced to discovery.',
      body: [
        'The latest Growth report is available in the reports archive.',
        'Use it to review pipeline movement and partner reply quality.',
      ],
      tags: ['report', 'growth'],
      source_type: 'report',
      source_id: 'report-growth-weekly-1',
      created_at: '2026-05-29T11:00:00Z',
      artifacts: [artifact('artifact-report-1', 'report', 'Partnership pipeline - Week 22', 'report archive', 'RPT', '/workspace/reports')],
    }),
    makeItem({
      id: 'inbox-run-failure',
      category: 'operational',
      title: 'Discovery run needs attention',
      preview: 'A Growth discovery run failed after the provider returned a rate-limit error.',
      body: [
        'The discovery run did not complete because the AI provider returned a rate-limit response.',
        'No external action was taken. Retry from orchestration once provider capacity is available.',
      ],
      tags: ['operational', 'run-failure'],
      source_type: 'ai_run',
      source_id: 'run-000000000000000000000000004',
      priority: 'high',
      created_at: '2026-05-29T10:00:00Z',
    }),
  ]
  items.forEach(item => mockItems.set(item.id, item))
}

function makeItem(input: Partial<InboxItem> & Pick<InboxItem, 'id' | 'category' | 'title' | 'preview' | 'body' | 'tags' | 'source_type' | 'source_id' | 'created_at'>): InboxItem {
  return {
    organization_id: MOCK_ORG_ID,
    agent_slug: 'growth',
    agent_name: 'Atlas',
    agent_role: 'Head of Growth',
    actor_type: 'agent',
    status: 'open',
    priority: 'normal',
    requires_action: false,
    action_type: null,
    read_at: null,
    resolved_at: null,
    archived_at: null,
    updated_at: input.created_at,
    artifacts: [],
    comments: [],
    ...input,
  }
}

function artifact(
  id: string,
  type: InboxArtifact['artifact_type'],
  name: string,
  meta: string,
  icon: string,
  openHref: string,
): InboxArtifact {
  return {
    id,
    organization_id: MOCK_ORG_ID,
    inbox_item_id: '',
    artifact_type: type,
    name,
    meta,
    icon,
    source_type: type,
    source_id: null,
    storage_path: null,
    open_href: openHref,
    metadata: {},
    created_at: '2026-05-29T12:00:00Z',
  }
}
