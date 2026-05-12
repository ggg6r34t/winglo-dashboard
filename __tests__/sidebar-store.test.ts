import { describe, it, expect, beforeEach } from 'vitest'
import { useSidebarStore } from '@/lib/stores/sidebar-store'
import { act } from '@testing-library/react'

describe('sidebar store', () => {
  beforeEach(() => {
    useSidebarStore.setState({ collapsed: false })
  })

  it('starts uncollapsed', () => {
    expect(useSidebarStore.getState().collapsed).toBe(false)
  })

  it('toggles collapsed state', () => {
    act(() => useSidebarStore.getState().toggle())
    expect(useSidebarStore.getState().collapsed).toBe(true)
    act(() => useSidebarStore.getState().toggle())
    expect(useSidebarStore.getState().collapsed).toBe(false)
  })

  it('setCollapsed sets exact value', () => {
    act(() => useSidebarStore.getState().setCollapsed(true))
    expect(useSidebarStore.getState().collapsed).toBe(true)
  })
})
