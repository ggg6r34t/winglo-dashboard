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
      className="btn"
      style={{ opacity: isPending ? 0.5 : 1 }}
    >
      {error ?? (isPending ? 'Generating...' : done ? 'Snapshot saved' : 'Generate Snapshot')}
    </button>
  )
}
