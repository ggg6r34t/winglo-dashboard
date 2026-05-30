import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ApprovalReviewClient } from '@/components/workspace/approval-review-client'
import type { Approval } from '@/types'

describe('ApprovalReviewClient', () => {
  it('requires rejection notes and submits approval decisions', async () => {
    const actions = {
      approve: vi.fn(async () => undefined),
      reject: vi.fn(async () => undefined),
    }

    render(<ApprovalReviewClient approvals={[approval('ap-1')]} actions={actions} />)

    fireEvent.click(screen.getByRole('button', { name: /reject/i }))
    expect(await screen.findByText(/rejection note is required/i)).toBeInTheDocument()
    expect(actions.reject).not.toHaveBeenCalled()

    fireEvent.change(screen.getByLabelText(/decision note/i), {
      target: { value: 'Needs stronger sourcing.' },
    })
    fireEvent.click(screen.getByRole('button', { name: /reject/i }))
    await waitFor(() => expect(actions.reject).toHaveBeenCalledWith('ap-1', 'Needs stronger sourcing.'))
  })

  it('submits approval decisions with an optional note', async () => {
    const actions = {
      approve: vi.fn(async () => undefined),
      reject: vi.fn(async () => undefined),
    }

    render(<ApprovalReviewClient approvals={[approval('ap-2')]} actions={actions} />)

    fireEvent.change(screen.getByLabelText(/decision note/i), {
      target: { value: 'Source artifact reviewed.' },
    })

    fireEvent.click(screen.getByRole('button', { name: /^approve$/i }))
    await waitFor(() => expect(actions.approve).toHaveBeenCalledWith('ap-2', 'Source artifact reviewed.'))
  })
})

function approval(id: string): Approval {
  return {
    id,
    organization_id: '00000000-0000-0000-0000-000000000001',
    agent_slug: 'growth',
    approval_type: 'outreach',
    title: 'Review outreach draft',
    summary: 'Approve the first-touch partner outreach draft.',
    entity_type: 'outreach_draft',
    entity_id: 'draft-1',
    status: 'pending',
    urgency: 'med',
    requested_by_run_id: null,
    decided_by: null,
    decided_at: null,
    decision_note: null,
    created_at: '2026-05-30T09:00:00Z',
    updated_at: '2026-05-30T09:00:00Z',
  }
}
