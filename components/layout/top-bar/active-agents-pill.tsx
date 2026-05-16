'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useOrchestrationStore } from '@/features/orchestration/hooks/use-orchestration-store'

export function ActiveAgentsPill() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const agentStates = useOrchestrationStore(s => s.agentStates)

  const ACTIVE_STATES = ['executing', 'queued']

  const activeCount = Object.values(agentStates).filter(s =>
    ACTIVE_STATES.includes(s),
  ).length

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border border-[var(--border-color)] bg-[var(--surface-raised)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full transition-colors',
            activeCount > 0 ? 'bg-green-400' : 'bg-[var(--text-muted)]',
          )}
        />
        {activeCount > 0 ? `${activeCount} active` : 'All idle'}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-64 bg-[var(--surface-raised)] border border-[var(--border-color)] rounded-lg shadow-xl z-50 p-1.5">
          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            AI Workforce
          </p>
          {Object.entries(agentStates).map(([agentType, state]) => {
            const isActive = ACTIVE_STATES.includes(state)
            return (
              <div
                key={agentType}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-md"
              >
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full shrink-0',
                    state === 'executing' ? 'bg-green-400' :
                    state === 'queued'    ? 'bg-amber-400' : 'bg-[var(--border-strong)]',
                  )}
                />
                <span className="text-xs text-[var(--text-secondary)] capitalize truncate">
                  {agentType}
                </span>
                <span className={cn(
                  'ml-auto text-[10px] shrink-0',
                  isActive ? 'text-green-400' : 'text-[var(--text-muted)]',
                )}>
                  {state}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
