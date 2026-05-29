import { InboxClient } from '@/components/workspace/inbox-client'
import {
  approveInboxItemAction,
  archiveInboxItemAction,
  markInboxReadAction,
  replyToInboxItemAction,
  resolveInboxItemAction,
} from '@/features/workforce/server/actions'
import { getCurrentOrgId } from '@/server/auth/org'
import { getInboxCounts, getInboxItems } from '@/server/dal/inbox'

export default async function InboxPage() {
  const orgId = await getCurrentOrgId()
  const [items, counts] = await Promise.all([
    getInboxItems(orgId, { limit: 50 }),
    getInboxCounts(orgId),
  ])

  return (
    <InboxClient
      initialItems={items}
      counts={counts}
      actions={{
        markRead: markInboxReadAction,
        approve: approveInboxItemAction,
        archive: archiveInboxItemAction,
        resolve: resolveInboxItemAction,
        reply: replyToInboxItemAction,
      }}
    />
  )
}
