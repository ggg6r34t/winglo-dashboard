'use client'

import { useRef, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useOrchestrationStore } from '../hooks/use-orchestration-store'
import { AGENT_TYPE_COLOR, AGENT_LABEL } from '../utils/agent-colors'

const LEVEL_STYLES: Record<string, string> = {
  info: 'text-[var(--text-muted)]',
  warning: 'text-amber-400',
  error: 'text-[var(--destructive)]',
}

const LEVEL_BADGE: Record<string, string> = {
  info: 'bg-[var(--surface-raised)] text-[var(--text-muted)]',
  warning: 'bg-amber-400/10 text-amber-400',
  error: 'bg-[var(--destructive)]/10 text-[var(--destructive)]',
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function ActivityFeed() {
  const feedEvents = useOrchestrationStore(s => s.feedEvents)
  const containerRef = useRef<HTMLDivElement>(null)
  const [userScrolled, setUserScrolled] = useState(false)

  // Auto-scroll to top (newest entries) unless user scrolled down
  useEffect(() => {
    if (!userScrolled && containerRef.current) {
      containerRef.current.scrollTop = 0
    }
  }, [feedEvents, userScrolled])

  function handleScroll() {
    if (!containerRef.current) return
    setUserScrolled(containerRef.current.scrollTop > 10)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-color)]">
        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
          Activity
        </span>
        {feedEvents.length > 0 && (
          <span className="text-xs text-[var(--text-muted)]">{feedEvents.length} events</span>
        )}
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 py-2 space-y-1"
      >
        {feedEvents.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)] pt-4 text-center">
            No activity yet.
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {feedEvents.map(event => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-start gap-2 py-1.5 border-b border-[var(--border-color)]/50 last:border-0"
              >
                <span className="text-[10px] text-[var(--text-muted)] shrink-0 pt-0.5 tabular-nums">
                  {formatTime(event.createdAt)}
                </span>
                <span
                  className={cn(
                    'text-[10px] font-medium shrink-0 px-1 rounded',
                    AGENT_TYPE_COLOR[event.agentType],
                    'bg-[var(--surface-raised)]'
                  )}
                >
                  {AGENT_LABEL[event.agentType]}
                </span>
                <span
                  className={cn(
                    'text-[10px] font-medium shrink-0 px-1 rounded',
                    LEVEL_BADGE[event.level]
                  )}
                >
                  {event.level}
                </span>
                <span className={cn('text-xs leading-relaxed', LEVEL_STYLES[event.level])}>
                  {event.message}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
