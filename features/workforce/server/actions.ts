'use server'

import { revalidatePath } from 'next/cache'
import { decideApproval } from '@/server/dal/approvals'
import { createActivityEvent } from '@/server/dal/activity-events'
import { updateWorkflow } from '@/server/dal/workflows'
import { getCurrentOrgId } from '@/server/auth/org'
import { getCurrentUserId } from '@/server/auth/user'
import { retractMemoryEntry } from '@/server/dal/memory-entries'
import {
  archiveInboxItem,
  getInboxItem,
  markInboxItemRead,
  replyToInboxItem,
  resolveInboxItem,
} from '@/server/dal/inbox'

export async function approveApprovalAction(id: string): Promise<void> {
  const orgId = await getCurrentOrgId()
  const approval = await decideApproval(id, 'approved')
  await createActivityEvent(orgId, {
    agent_slug: approval.agent_slug,
    actor_type: 'user',
    event_type: 'approval.approved',
    entity_type: 'approval',
    entity_id: approval.id,
    severity: 'success',
    message: `Approved: ${approval.title}`,
  })
  revalidatePath('/workspace/approvals')
  revalidatePath('/workspace')
}

export async function rejectApprovalAction(id: string): Promise<void> {
  const orgId = await getCurrentOrgId()
  const approval = await decideApproval(id, 'rejected')
  await createActivityEvent(orgId, {
    agent_slug: approval.agent_slug,
    actor_type: 'user',
    event_type: 'approval.rejected',
    entity_type: 'approval',
    entity_id: approval.id,
    severity: 'warning',
    message: `Rejected: ${approval.title}`,
  })
  revalidatePath('/workspace/approvals')
  revalidatePath('/workspace')
}

export async function updateWorkflowAction(formData: FormData): Promise<void> {
  const id = String(formData.get('id') ?? '')
  const title = String(formData.get('title') ?? '').trim()
  const schedule = String(formData.get('schedule') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  if (!id || !title || !schedule) throw new Error('Workflow id, title, and schedule are required')

  const orgId = await getCurrentOrgId()
  const workflow = await updateWorkflow(id, { title, schedule, description })
  await createActivityEvent(orgId, {
    agent_slug: workflow.agent_slug,
    actor_type: 'user',
    event_type: 'workflow.updated',
    entity_type: 'workflow',
    entity_id: workflow.id,
    severity: 'info',
    message: `Updated workflow: ${workflow.title}`,
  })
  revalidatePath('/workspace/workflows')
  revalidatePath(`/agents/${workflow.agent_slug}/workflows`)
}

export async function connectorNotConfiguredAction(): Promise<void> {
  throw new Error('Connector OAuth is not configured for this environment yet.')
}

export async function retractMemoryAction(id: string): Promise<void> {
  const orgId = await getCurrentOrgId()
  const entry = await retractMemoryEntry(id)
  await createActivityEvent(orgId, {
    agent_slug: typeof entry.metadata.agent_slug === 'string' ? entry.metadata.agent_slug : 'growth',
    actor_type: 'user',
    event_type: 'memory.retracted',
    entity_type: 'memory_entry',
    entity_id: entry.id,
    severity: 'warning',
    message: `Retracted memory: ${entry.title}`,
  })
  revalidatePath('/workspace/memory')
  revalidatePath('/agents/growth/memory')
}

export async function markInboxReadAction(id: string): Promise<void> {
  const orgId = await getCurrentOrgId()
  const userId = await getCurrentUserId()
  const item = await markInboxItemRead(orgId, id, userId)
  await createActivityEvent(orgId, {
    agent_slug: item.agent_slug,
    actor_type: 'user',
    event_type: 'inbox.read',
    entity_type: 'inbox_item',
    entity_id: item.id,
    severity: 'info',
    message: `Read inbox item: ${item.title}`,
  })
  revalidatePath('/workspace/inbox')
}

export async function archiveInboxItemAction(id: string): Promise<void> {
  const orgId = await getCurrentOrgId()
  const userId = await getCurrentUserId()
  const item = await archiveInboxItem(orgId, id, userId)
  await createActivityEvent(orgId, {
    agent_slug: item.agent_slug,
    actor_type: 'user',
    event_type: 'inbox.archived',
    entity_type: 'inbox_item',
    entity_id: item.id,
    severity: 'info',
    message: `Archived inbox item: ${item.title}`,
  })
  revalidatePath('/workspace/inbox')
  revalidatePath('/workspace')
}

export async function resolveInboxItemAction(id: string): Promise<void> {
  const orgId = await getCurrentOrgId()
  const userId = await getCurrentUserId()
  const item = await resolveInboxItem(orgId, id, userId)
  await createActivityEvent(orgId, {
    agent_slug: item.agent_slug,
    actor_type: 'user',
    event_type: 'inbox.resolved',
    entity_type: 'inbox_item',
    entity_id: item.id,
    severity: 'success',
    message: `Resolved inbox item: ${item.title}`,
  })
  revalidatePath('/workspace/inbox')
  revalidatePath('/workspace')
}

export async function replyToInboxItemAction(id: string, body: string): Promise<void> {
  const orgId = await getCurrentOrgId()
  const userId = await getCurrentUserId()
  const item = await replyToInboxItem(orgId, id, userId, body)
  await createActivityEvent(orgId, {
    agent_slug: item.agent_slug,
    actor_type: 'user',
    event_type: 'inbox.replied',
    entity_type: 'inbox_item',
    entity_id: item.id,
    severity: 'info',
    message: `Replied to inbox item: ${item.title}`,
  })
  revalidatePath('/workspace/inbox')
}

export async function approveInboxItemAction(id: string): Promise<void> {
  const orgId = await getCurrentOrgId()
  const userId = await getCurrentUserId()
  const item = await getInboxItem(orgId, id)

  if (item.source_type === 'approval' && item.source_id) {
    const approval = await decideApproval(item.source_id, 'approved')
    await createActivityEvent(orgId, {
      agent_slug: approval.agent_slug,
      actor_type: 'user',
      event_type: 'approval.approved',
      entity_type: 'approval',
      entity_id: approval.id,
      severity: 'success',
      message: `Approved from inbox: ${approval.title}`,
    })
  }

  const resolved = await resolveInboxItem(orgId, id, userId)
  await createActivityEvent(orgId, {
    agent_slug: resolved.agent_slug,
    actor_type: 'user',
    event_type: 'inbox.approved',
    entity_type: 'inbox_item',
    entity_id: resolved.id,
    severity: 'success',
    message: `Approved and resolved inbox item: ${resolved.title}`,
  })
  revalidatePath('/workspace/inbox')
  revalidatePath('/workspace/approvals')
  revalidatePath('/workspace')
}
