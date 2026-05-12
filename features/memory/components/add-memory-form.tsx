'use client'

import { useState, useTransition } from 'react'
import { createMemoryFromNotes } from '../server/actions'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export function AddMemoryForm() {
  const [isPending, startTransition] = useTransition()
  const [notes, setNotes] = useState('')
  const [context, setContext] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!notes.trim()) return
    startTransition(async () => {
      try {
        await createMemoryFromNotes(notes.trim(), context.trim() || undefined)
        setNotes('')
        setContext('')
        setError(null)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to save. Please try again.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-5 space-y-4">
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">Capture a note</h3>
      <div className="space-y-1.5">
        <Label htmlFor="context" className="text-xs text-[var(--text-muted)]">Context (optional)</Label>
        <input
          id="context"
          value={context}
          onChange={e => setContext(e.target.value)}
          placeholder="e.g. After Salesforce BD call on May 9"
          disabled={isPending}
          className="w-full text-sm bg-[var(--surface-raised)] border border-[var(--border-color)] rounded-md px-3 py-2 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-xs text-[var(--text-muted)]">Notes <span className="text-[var(--destructive)]">*</span></Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Describe what happened, what you learned, or what you observed..."
          rows={4}
          disabled={isPending}
          className="bg-[var(--surface-raised)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={isPending || !notes.trim()}
          className="bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white"
        >
          {isPending ? 'Processing...' : 'Save to Memory'}
        </Button>
        {success && <span className="text-xs text-green-400">Saved successfully</span>}
      </div>
      {error && (
        <p className="text-xs text-(--destructive)">{error}</p>
      )}
    </form>
  )
}
