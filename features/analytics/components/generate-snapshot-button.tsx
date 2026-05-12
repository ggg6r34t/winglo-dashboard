'use client'

import { useTransition, useState } from 'react'
import { generateDailySnapshot } from '@/features/analytics/server/generate-snapshot'

export function GenerateSnapshotButton() {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') return null

  function handleGenerate() {
    startTransition(async () => {
      try {
        await generateDailySnapshot()
        setDone(true)
        setError(null)
        setTimeout(() => setDone(false), 3000)
      } catch {
        setError('Snapshot failed')
        setTimeout(() => setError(null), 3000)
      }
    })
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={isPending}
      className="text-xs px-3 py-1.5 rounded border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-50"
    >
      {error ?? (isPending ? 'Generating...' : done ? 'Snapshot saved' : 'Generate Snapshot')}
    </button>
  )
}
