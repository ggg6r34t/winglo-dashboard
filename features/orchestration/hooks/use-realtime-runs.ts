'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MOCK_ORG_ID } from '@/lib/mock'
import type { AIRun, AgentLog } from '@/types'
import { useOrchestrationStore } from './use-orchestration-store'

export function useRealtimeRuns() {
  const upsertRun = useOrchestrationStore(s => s.upsertRun)
  const appendLog = useOrchestrationStore(s => s.appendLog)
  const setLive = useOrchestrationStore(s => s.setLive)

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') return

    const supabase = createClient()
    const channel = supabase
      .channel('orchestration-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_runs',
          filter: `organization_id=eq.${MOCK_ORG_ID}`,
        },
        payload => { upsertRun(payload.new as AIRun) }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ai_runs',
          filter: `organization_id=eq.${MOCK_ORG_ID}`,
        },
        payload => { upsertRun(payload.new as AIRun) }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_logs',
          filter: `organization_id=eq.${MOCK_ORG_ID}`,
        },
        payload => {
          appendLog(payload.new as AgentLog)
        }
      )
      .subscribe(status => {
        setLive(status === 'SUBSCRIBED')
      })

    return () => {
      setLive(false)
      supabase.removeChannel(channel).catch(() => {})
    }
  }, [upsertRun, appendLog, setLive])
}
