'use client'

import { useState, useTransition } from 'react'
import { createMemoryFromNotes } from '../server/actions'

const fieldStyle: React.CSSProperties = {
  width: '100%',
  fontSize: 13,
  background: 'var(--bg-2)',
  border: '1px solid var(--line-2)',
  borderRadius: 'var(--r-sm)',
  padding: '7px 10px',
  color: 'var(--fg-0)',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  color: 'var(--fg-3)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: 6,
}

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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Capture a note
      </div>

      <div>
        <label htmlFor="context" style={labelStyle}>Context <span style={{ color: 'var(--fg-4)', textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
        <input
          id="context"
          value={context}
          onChange={e => setContext(e.target.value)}
          placeholder="e.g. After Salesforce BD call on May 9"
          disabled={isPending}
          style={fieldStyle}
        />
      </div>

      <div>
        <label htmlFor="notes" style={labelStyle}>Notes <span style={{ color: 'var(--bad)' }}>*</span></label>
        <textarea
          id="notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Describe what happened, what you learned, or what you observed..."
          rows={4}
          disabled={isPending}
          style={{ ...fieldStyle, resize: 'none', lineHeight: 1.5 }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          type="submit"
          disabled={isPending || !notes.trim()}
          className="btn primary"
          style={{ opacity: isPending || !notes.trim() ? 0.5 : 1 }}
        >
          {isPending ? 'Processing...' : 'Save to Memory'}
        </button>
        {success && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ok)' }}>Saved</span>
        )}
      </div>

      {error && (
        <p style={{ fontSize: 11, color: 'var(--bad)', margin: 0 }}>{error}</p>
      )}
    </form>
  )
}
