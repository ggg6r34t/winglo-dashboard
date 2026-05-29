import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { InboxClient } from '@/components/workspace/inbox-client'
import type { InboxItem } from '@/types'

describe('InboxClient', () => {
  it('shows filtered inbox items and invokes item actions', async () => {
    const actions = {
      markRead: vi.fn(async () => undefined),
      approve: vi.fn(async () => undefined),
      archive: vi.fn(async () => undefined),
      resolve: vi.fn(async () => undefined),
      reply: vi.fn(async () => undefined),
    }

    render(
      <InboxClient
        initialItems={[item('decision-1', 'decision'), item('report-1', 'report')]}
        counts={{ all: 2, unread: 2, decisions: 1, reports: 1, operational: 0 }}
        actions={actions}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /decisions/i }))
    expect(screen.getAllByText('decision-1 subject').length).toBeGreaterThan(0)
    expect(screen.queryByText('report-1 subject')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /approve/i }))
    await waitFor(() => expect(actions.approve).toHaveBeenCalledWith('decision-1'))

    fireEvent.change(screen.getByLabelText(/reply note/i), { target: { value: 'Looks ready.' } })
    fireEvent.click(screen.getByRole('button', { name: /reply with note/i }))
    await waitFor(() => expect(actions.reply).toHaveBeenCalledWith('decision-1', 'Looks ready.'))
  })
})

function item(id: string, category: InboxItem['category']): InboxItem {
  return {
    id,
    organization_id: '00000000-0000-0000-0000-000000000001',
    agent_slug: 'growth',
    agent_name: 'Head of Growth',
    agent_role: 'Growth',
    actor_type: 'agent',
    category,
    title: `${id} subject`,
    preview: `${id} preview`,
    body: [`${id} body`],
    status: 'open',
    priority: 'normal',
    requires_action: category === 'decision',
    action_type: category === 'decision' ? 'approval' : null,
    source_type: category === 'decision' ? 'approval' : 'report',
    source_id: `${id}-source`,
    read_at: null,
    resolved_at: null,
    archived_at: null,
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-05-01T00:00:00Z',
    tags: [category],
    artifacts: [],
    comments: [],
  }
}
