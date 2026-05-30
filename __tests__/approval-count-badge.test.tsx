import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApprovalCountBadge } from '@/components/workspace/approval-count-badge'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('ApprovalCountBadge', () => {
  it('loads and displays pending approval count', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ pending: 4 }),
    })))

    render(<ApprovalCountBadge fallback={0} />)

    await waitFor(() => expect(screen.getByText('4')).toBeInTheDocument())
  })
})
