import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { WorkspaceOperationLauncher } from '@/components/workspace/workspace-operation-launcher'

describe('WorkspaceOperationLauncher', () => {
  it('opens an inline operation launcher from the New operation button', () => {
    render(<WorkspaceOperationLauncher />)

    fireEvent.click(screen.getByRole('button', { name: /new operation/i }))

    expect(screen.getByRole('dialog', { name: /new operation/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /growth discovery/i })).toHaveAttribute(
      'href',
      '/agents/growth/opportunities',
    )
    expect(screen.getByRole('link', { name: /workflow library/i })).toHaveAttribute(
      'href',
      '/workspace/workflows',
    )
  })
})
