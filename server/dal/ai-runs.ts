import type { AIRun, AgentType, AIRunStatus, AgentLog } from '@/types'
import { mockAIRuns, mockAgentLogs } from '@/lib/mock'
import { createServiceClient } from '@/lib/supabase/server'

const mockRunStore = new Map<string, AIRun>()

export async function getAIRuns(
  orgId: string,
  options: { agentType?: AgentType; status?: AIRunStatus; limit?: number } = {}
): Promise<AIRun[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    let results = mockAIRuns.filter(r => r.organization_id === orgId)
    if (options.agentType) results = results.filter(r => r.agent_type === options.agentType)
    if (options.status) results = results.filter(r => r.status === options.status)
    results = results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    if (options.limit) results = results.slice(0, options.limit)
    return results
  }
  const supabase = await createServiceClient()
  let query = supabase
    .from('ai_runs')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
  if (options.agentType) query = query.eq('agent_type', options.agentType)
  if (options.status) query = query.eq('status', options.status)
  if (options.limit) query = query.limit(options.limit)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getActiveAIRuns(orgId: string): Promise<AIRun[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return mockAIRuns.filter(
      r => r.organization_id === orgId && ['running', 'queued'].includes(r.status)
    )
  }
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('ai_runs')
    .select('*')
    .eq('organization_id', orgId)
    .in('status', ['running', 'queued'])
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getAgentLogsForRun(runId: string): Promise<AgentLog[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return mockAgentLogs
      .filter(l => l.ai_run_id === runId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('agent_logs')
    .select('*')
    .eq('ai_run_id', runId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createAIRun(
  orgId: string,
  agentType: AgentType,
  input: Record<string, unknown>
): Promise<AIRun> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    const run: AIRun = {
      id: `run-mock-${Date.now()}`,
      organization_id: orgId,
      agent_type: agentType,
      status: 'queued',
      input,
      output: null,
      error: null,
      duration_ms: null,
      tokens_used: null,
      started_at: null,
      completed_at: null,
      created_at: new Date().toISOString(),
    }
    mockRunStore.set(run.id, run)
    return run
  }
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('ai_runs')
    .insert({ organization_id: orgId, agent_type: agentType, input, status: 'queued' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateAIRun(
  id: string,
  data: Partial<Pick<AIRun, 'status' | 'output' | 'error' | 'duration_ms' | 'tokens_used' | 'started_at' | 'completed_at'>>
): Promise<AIRun> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    const existing = mockAIRuns.find(r => r.id === id) ?? mockRunStore.get(id)
    if (!existing) throw new Error(`AIRun ${id} not found in mock store`)
    const updated = { ...existing, ...data }
    mockRunStore.set(id, updated)
    return updated
  }
  const supabase = await createServiceClient()
  const { data: updated, error } = await supabase
    .from('ai_runs')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return updated
}

export async function createAgentLog(
  orgId: string,
  runId: string,
  level: 'info' | 'warning' | 'error',
  message: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return
  }
  const supabase = await createServiceClient()
  const { error } = await supabase
    .from('agent_logs')
    .insert({ organization_id: orgId, ai_run_id: runId, level, message, metadata })
  if (error) throw error
}

export async function getOrgAgentLogs(
  orgId: string,
  limit: number = 100
): Promise<AgentLog[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return mockAgentLogs
      .filter(l => l.organization_id === orgId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
  }
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('agent_logs')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}
