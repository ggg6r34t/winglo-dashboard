import type { WorkflowDefinition } from '@/types'
import { createServiceClient } from '@/lib/supabase/server'

const mockGrowthWorkflows: WorkflowDefinition[] = [
  {
    id: 'wf-g1',
    organization_id: '00000000-0000-0000-0000-000000000001',
    agent_slug: 'growth',
    key: 'partnership-outreach-series-a',
    title: 'Partnership outreach - Series A SaaS list',
    state: 'run',
    runs: 84,
    success: 0.971,
    schedule: 'Daily - 07:00',
    last_run: '1h ago',
    description: 'Source, enrich, personalize, and prepare partnership pitches to Series A SaaS targets.',
    avg_duration: '6m 02s',
    enabled: true,
    trigger_type: 'schedule',
    approval_policy: { requireApprovalBeforeSend: true },
    config: {},
    runs_recent: [
      { id: 'RN-84', time: 'Today 07:00', dur: '5m 58s', state: 'done' },
      { id: 'RN-83', time: 'Yesterday 07:00', dur: '6m 12s', state: 'done' },
      { id: 'RN-82', time: 'May 17 07:00', dur: '6m 04s', state: 'done' },
      { id: 'RN-81', time: 'May 16 07:00', dur: '5m 44s', state: 'fail' },
    ],
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-05-16T08:00:00Z',
  },
  {
    id: 'wf-g2',
    organization_id: '00000000-0000-0000-0000-000000000001',
    agent_slug: 'growth',
    key: 'inbound-lead-enrichment-routing',
    title: 'Inbound lead enrichment + routing',
    state: 'run',
    runs: 412,
    success: 0.996,
    schedule: 'On-trigger',
    last_run: '2m ago',
    description: 'Enrich inbound signups, score against ICP, and route them to the right sequence.',
    avg_duration: '38s',
    enabled: true,
    trigger_type: 'event',
    approval_policy: {},
    config: {},
    runs_recent: [
      { id: 'RN-412', time: 'Today 14:18', dur: '36s', state: 'done' },
      { id: 'RN-411', time: 'Today 13:54', dur: '40s', state: 'done' },
    ],
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-05-16T14:18:00Z',
  },
]

export async function getWorkflows(
  orgId: string,
  options: { agentSlug?: string; limit?: number } = {},
): Promise<WorkflowDefinition[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    let workflows = mockGrowthWorkflows.filter(workflow => workflow.organization_id === orgId)
    if (options.agentSlug) workflows = workflows.filter(workflow => workflow.agent_slug === options.agentSlug)
    if (options.limit) workflows = workflows.slice(0, options.limit)
    return workflows
  }

  const supabase = await createServiceClient()
  let query = supabase
    .from('workflows')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
  if (options.agentSlug) query = query.eq('agent_slug', options.agentSlug)
  if (options.limit) query = query.limit(options.limit)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []).map(workflow => ({ ...workflow, runs_recent: workflow.runs_recent ?? [] }))
}

export async function updateWorkflow(
  id: string,
  data: Pick<WorkflowDefinition, 'title' | 'schedule' | 'description'>,
): Promise<WorkflowDefinition> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    const existing = mockGrowthWorkflows.find(workflow => workflow.id === id)
    if (!existing) throw new Error(`Workflow ${id} not found`)
    return { ...existing, ...data, updated_at: new Date().toISOString() }
  }

  const supabase = await createServiceClient()
  const { data: updated, error } = await supabase
    .from('workflows')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return { ...updated, runs_recent: updated.runs_recent ?? [] }
}
