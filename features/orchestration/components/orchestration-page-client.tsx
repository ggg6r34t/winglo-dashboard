'use client'

import { useRef, useLayoutEffect, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { AIRun, AgentLog, AgentType } from '@/types'
import { useOrchestrationStore } from '../hooks/use-orchestration-store'
import { useRealtimeRuns } from '../hooks/use-realtime-runs'
import { AgentGraph } from './agent-graph'
import { AgentDetailPanel } from './agent-detail-panel'
import { ActivityFeed } from './activity-feed'
import { OrchestrationStatusBar } from './orchestration-status-bar'

interface Props {
  initialRuns: AIRun[]
  initialLogs: AgentLog[]
  monitoringEnabled: boolean
}

export function OrchestrationPageClient({ initialRuns, initialLogs, monitoringEnabled }: Props) {
  const hydrateRuns = useOrchestrationStore(s => s.hydrateRuns)
  const hydrateLogs = useOrchestrationStore(s => s.hydrateLogs)
  const isLive = useOrchestrationStore(s => s.isLive)

  const [selectedAgentType, setSelectedAgentType] = useState<AgentType | null>(null)

  // Hydrate store before first paint — useLayoutEffect fires synchronously
  // after DOM commit but before the browser paints, avoiding a visible flash.
  const hydrated = useRef(false)
  useLayoutEffect(() => {
    if (hydrated.current) return
    hydrated.current = true
    hydrateRuns(initialRuns)
    hydrateLogs(initialLogs)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Own the Realtime subscription lifetime at the page level, not inside a child widget
  useRealtimeRuns()

  const handleAgentClick = useCallback((agentType: AgentType) => {
    setSelectedAgentType(prev => prev === agentType ? null : agentType)
  }, [])

  const handleDeselect = useCallback(() => setSelectedAgentType(null), [])

  return (
    <div className="flex flex-col gap-4 h-full">
      <OrchestrationStatusBar monitoringEnabled={monitoringEnabled} />

      {!isLive && process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'true' && (
        <div className="text-xs text-amber-400 bg-amber-400/5 border border-amber-400/20 rounded px-3 py-2">
          Live updates paused — reconnecting
        </div>
      )}

      <div className="flex flex-1 gap-4 min-h-[600px]">
        {/* Agent graph: 60% */}
        <div className="flex-[3] rounded-lg border border-[var(--border-color)] overflow-hidden">
          <AgentGraph
            selectedAgentType={selectedAgentType}
            onAgentClick={handleAgentClick}
            onDeselect={handleDeselect}
          />
        </div>

        {/* Right panel: detail view overlays the activity feed when an agent is selected */}
        <div className="relative flex-[2] rounded-lg border border-[var(--border-color)] overflow-hidden">
          <ActivityFeed />
          <AnimatePresence>
            {selectedAgentType && (
              <motion.div
                key={selectedAgentType}
                className="absolute inset-0"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <AgentDetailPanel
                  agentType={selectedAgentType}
                  onClose={handleDeselect}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
