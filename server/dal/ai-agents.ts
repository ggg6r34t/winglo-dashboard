import type { AIAgent } from '@/types'
import { AGENT_REGISTRY } from '@/lib/agents/registry'
import { createServiceClient } from '@/lib/supabase/server'

function toAIAgent(orgId: string, now: string, agent: (typeof AGENT_REGISTRY)[number]): AIAgent {
  return {
    id: `agent-${agent.slug}`,
    organization_id: orgId,
    slug: agent.slug,
    name: agent.name,
    department: agent.department,
    mission: agent.mission,
    capabilities: agent.capabilities,
    deployed: agent.deployed,
    status: agent.deployed ? 'idle' : 'not-deployed',
    config: { accent: agent.accent, standbyText: agent.standbyText },
    created_at: now,
    updated_at: now,
  }
}

export async function getAIAgents(orgId: string): Promise<AIAgent[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    const now = new Date().toISOString()
    return AGENT_REGISTRY.map(agent => toAIAgent(orgId, now, agent))
  }

  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('ai_agents')
    .select('*')
    .eq('organization_id', orgId)
    .order('department', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getAIAgentBySlug(orgId: string, slug: string): Promise<AIAgent | null> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    const now = new Date().toISOString()
    const agent = AGENT_REGISTRY.find(item => item.slug === slug)
    return agent ? toAIAgent(orgId, now, agent) : null
  }

  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('ai_agents')
    .select('*')
    .eq('organization_id', orgId)
    .eq('slug', slug)
    .single()

  if (error) return null
  return data
}
