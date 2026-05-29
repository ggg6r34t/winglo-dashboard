import type { ActivityEvent, ActivitySeverity } from '@/types'
import { mockAgentLogs } from '@/lib/mock'
import { createServiceClient } from '@/lib/supabase/server'

export async function getActivityEvents(orgId: string, limit = 100): Promise<ActivityEvent[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return mockAgentLogs
      .filter(log => log.organization_id === orgId)
      .map<ActivityEvent>(log => ({
        id: `activity-${log.id}`,
        organization_id: orgId,
        agent_slug: typeof log.metadata.step === 'string' ? String(log.metadata.step).split('_')[0] : null,
        actor_type: 'agent',
        event_type: log.level === 'error' ? 'run.failed' : 'run.log',
        entity_type: 'ai_run',
        entity_id: log.ai_run_id,
        severity: log.level === 'error' ? 'error' : log.level === 'warning' ? 'warning' : 'info',
        message: log.message,
        metadata: log.metadata,
        created_at: log.created_at,
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
  }

  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('activity_events')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

export async function createActivityEvent(
  orgId: string,
  event: {
    agent_slug?: string | null
    actor_type?: 'user' | 'agent' | 'system'
    event_type: string
    entity_type?: string | null
    entity_id?: string | null
    severity?: ActivitySeverity
    message: string
    metadata?: Record<string, unknown>
  },
): Promise<void> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') return

  const supabase = await createServiceClient()
  const { error } = await supabase.from('activity_events').insert({
    organization_id: orgId,
    agent_slug: event.agent_slug ?? null,
    actor_type: event.actor_type ?? 'system',
    event_type: event.event_type,
    entity_type: event.entity_type ?? null,
    entity_id: event.entity_id ?? null,
    severity: event.severity ?? 'info',
    message: event.message,
    metadata: event.metadata ?? {},
  })
  if (error) throw error
}
