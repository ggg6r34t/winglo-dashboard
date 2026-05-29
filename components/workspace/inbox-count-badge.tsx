'use client'

import { useEffect, useState } from 'react'

export function InboxCountBadge({ fallback = 0 }: { fallback?: number }) {
  const [count, setCount] = useState(fallback)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const response = await fetch('/api/workspace/inbox/counts', { cache: 'no-store' })
        if (!response.ok) return
        const data = await response.json() as { unread?: number }
        if (!cancelled) setCount(typeof data.unread === 'number' ? data.unread : fallback)
      } catch {
        if (!cancelled) setCount(fallback)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [fallback])

  if (count <= 0) return null
  return <span>{count}</span>
}
