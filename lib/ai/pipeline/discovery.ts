import { ai } from '@/lib/ai/providers'
import {
  systemPrompt as discoverySystemPrompt,
  outputSchema as discoveryOutputSchema,
  formatInput as discoveryFormatInput,
} from '@/lib/ai/prompts/discovery-agent'
import {
  systemPrompt as researchSystemPrompt,
  outputSchema as researchOutputSchema,
  formatInput as researchFormatInput,
} from '@/lib/ai/prompts/research-agent'
import {
  systemPrompt as scoringSystemPrompt,
  outputSchema as scoringOutputSchema,
  formatInput as scoringFormatInput,
} from '@/lib/ai/prompts/scoring-agent'
import { getBusinessProfileById } from '@/server/dal/business-profiles'
import { createAIRun, updateAIRun, createAgentLog } from '@/server/dal/ai-runs'
import { createOpportunities } from '@/server/dal/opportunities'
import { searchMemoriesBySimilarity } from '@/server/dal/memory-entries'
import type { Opportunity } from '@/types'

export async function runDiscoveryPipeline(
  orgId: string,
  profileId: string
): Promise<Opportunity[]> {
  const profile = await getBusinessProfileById(profileId)
  if (!profile) throw new Error('Profile not found')

  const orgMemories = await searchMemoriesBySimilarity(
    orgId,
    `${profile.name} ${profile.description ?? ''} ${profile.growth_brief?.partnership_categories?.join(' ') ?? ''}`,
    5
  )

  const discoveryRun = await createAIRun(orgId, 'discovery', { profileId })
  const discoveryStart = Date.now()

  let activeRun = discoveryRun
  let activeStart = discoveryStart

  try {
    await updateAIRun(discoveryRun.id, {
      status: 'running',
      started_at: new Date().toISOString(),
    })
    createAgentLog(orgId, discoveryRun.id, 'info', 'Discovery started', { profile_id: profileId }).catch(() => {})

    const discoveryResult = await ai.complete({
      messages: discoveryFormatInput(profile, orgMemories),
      systemPrompt: discoverySystemPrompt,
      schema: discoveryOutputSchema,
    })

    await updateAIRun(discoveryRun.id, {
      status: 'complete',
      output: discoveryResult.content as unknown as Record<string, unknown>,
      tokens_used: discoveryResult.tokensUsed,
      duration_ms: Date.now() - discoveryStart,
      completed_at: new Date().toISOString(),
    })
    createAgentLog(orgId, discoveryRun.id, 'info', `Discovery complete — ${discoveryResult.content.opportunities.length} opportunities found`, {}).catch(() => {})

    const researchRun = await createAIRun(orgId, 'research', {
      profileId,
      opportunityCount: discoveryResult.content.opportunities.length,
    })
    const researchStart = Date.now()
    activeRun = researchRun
    activeStart = researchStart

    await updateAIRun(researchRun.id, {
      status: 'running',
      started_at: new Date().toISOString(),
    })
    createAgentLog(orgId, researchRun.id, 'info', `Research started — ${discoveryResult.content.opportunities.length} companies`, {}).catch(() => {})

    const researchedOpportunities = await Promise.all(
      discoveryResult.content.opportunities.map(async (opp) => {
        const researchResult = await ai.complete({
          messages: researchFormatInput({
            companyName: opp.company_name,
            companyUrl: opp.company_url,
          }),
          systemPrompt: researchSystemPrompt,
          schema: researchOutputSchema,
        })
        return { ...opp, researchedDescription: researchResult.content.description }
      })
    )

    await updateAIRun(researchRun.id, {
      status: 'complete',
      output: { researched_count: researchedOpportunities.length } as Record<string, unknown>,
      duration_ms: Date.now() - researchStart,
      completed_at: new Date().toISOString(),
    })
    createAgentLog(orgId, researchRun.id, 'info', `Research complete — ${researchedOpportunities.length} enriched`, {}).catch(() => {})

    const scoringRun = await createAIRun(orgId, 'scoring', {
      profileId,
      opportunityCount: researchedOpportunities.length,
    })
    const scoringStart = Date.now()
    activeRun = scoringRun
    activeStart = scoringStart
    let totalScoringTokens = 0

    await updateAIRun(scoringRun.id, {
      status: 'running',
      started_at: new Date().toISOString(),
    })
    createAgentLog(orgId, scoringRun.id, 'info', 'Scoring started', {}).catch(() => {})

    const scoredOpportunities = await Promise.all(
      researchedOpportunities.map(async (opp) => {
        const companyMemories = await searchMemoriesBySimilarity(
          orgId,
          opp.company_name,
          3
        ).catch(() => [])
        const scoringResult = await ai.complete({
          messages: scoringFormatInput(profile, {
            company_name: opp.company_name,
            company_description: opp.researchedDescription,
            opportunity_type: opp.opportunity_type,
          }, companyMemories),
          systemPrompt: scoringSystemPrompt,
          schema: scoringOutputSchema,
        })
        totalScoringTokens += scoringResult.tokensUsed
        return {
          company_name: opp.company_name,
          company_url: opp.company_url ?? null,
          company_description: opp.researchedDescription,
          opportunity_type: opp.opportunity_type,
          score: scoringResult.content.score,
          score_rationale: scoringResult.content.score_rationale,
          estimated_impact: scoringResult.content.estimated_impact,
        }
      })
    )

    await updateAIRun(scoringRun.id, {
      status: 'complete',
      output: {
        scored_count: scoredOpportunities.length,
        scores: scoredOpportunities.map(o => ({ company_name: o.company_name, score: o.score })),
      } as Record<string, unknown>,
      tokens_used: totalScoringTokens,
      duration_ms: Date.now() - activeStart,
      completed_at: new Date().toISOString(),
    })
    const avgScore = scoredOpportunities.length > 0
      ? Math.round(scoredOpportunities.reduce((sum, o) => sum + (o.score ?? 0), 0) / scoredOpportunities.length)
      : 0

    const created = await createOpportunities(orgId, profileId, scoredOpportunities)
    createAgentLog(orgId, scoringRun.id, 'info', `Scoring complete — avg score ${avgScore}, ${scoredOpportunities.length} opportunities saved`, { count: scoredOpportunities.length }).catch(() => {})
    return created
  } catch (error) {
    await updateAIRun(activeRun.id, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - activeStart,
      completed_at: new Date().toISOString(),
    })
    createAgentLog(orgId, activeRun.id, 'error', `Discovery pipeline failed: ${error instanceof Error ? error.message : 'Unknown error'}`, {}).catch(() => {})
    throw error
  }
}
