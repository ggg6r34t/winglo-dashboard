import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { InboxCountBadge } from '@/components/workspace/inbox-count-badge'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('InboxCountBadge', () => {
  it('loads and displays unread inbox count', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ unread: 7 }),
    })))

    render(<InboxCountBadge fallback={0} />)

    await waitFor(() => expect(screen.getByText('7')).toBeInTheDocument())
  })
})
