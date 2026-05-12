'use server'

import { ai } from '@/lib/ai/providers'
import {
  systemPrompt as outreachSystemPrompt,
  outputSchema as outreachOutputSchema,
  formatInput as outreachFormatInput,
} from '@/lib/ai/prompts/outreach-agent'
import { getLatestBusinessProfile } from '@/server/dal/business-profiles'
import { getOpportunityById } from '@/server/dal/opportunities'
import { createOutreachDraft, updateOutreachDraftStatus } from '@/server/dal/outreach-drafts'
import { createAIRun, updateAIRun, createAgentLog } from '@/server/dal/ai-runs'
import { searchMemoriesBySimilarity } from '@/server/dal/memory-entries'
import { mockOutreachDrafts, MOCK_ORG_ID } from '@/lib/mock'
import type { OutreachDraft, OutreachChannel, OutreachTone } from '@/types'
import { revalidatePath } from 'next/cache'
import { getClientKey } from '@/lib/get-client-key'
import { outreachRateLimiter } from '@/lib/rate-limiters'

const ORG_ID = MOCK_ORG_ID

export async function generateOutreachDraft(
  opportunityId: string,
  channel: OutreachChannel,
  tone: OutreachTone
): Promise<OutreachDraft> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return mockOutreachDrafts.find(d => d.opportunity_id === opportunityId) ?? mockOutreachDrafts[0]
  }

  const clientKey = await getClientKey()
  outreachRateLimiter.check(clientKey)

  const [profile, opportunity] = await Promise.all([
    getLatestBusinessProfile(ORG_ID),
    getOpportunityById(opportunityId),
  ])
  if (!profile) throw new Error('No business profile found')
  if (!opportunity) throw new Error('Opportunity not found')

  const run = await createAIRun(ORG_ID, 'outreach', { opportunityId, channel, tone })
  const start = Date.now()

  try {
    await updateAIRun(run.id, { status: 'running', started_at: new Date().toISOString() })
    createAgentLog(ORG_ID, run.id, 'info', 'Outreach draft generation started', { opportunity_id: opportunityId, channel, tone }).catch(() => {})

    const companyMemories = await searchMemoriesBySimilarity(
      ORG_ID,
      opportunity.company_name,
      3
    ).catch(() => [])

    const result = await ai.complete({
      messages: outreachFormatInput({ profile, opportunity, channel, tone, memories: companyMemories }),
      systemPrompt: outreachSystemPrompt,
      schema: outreachOutputSchema,
    })

    const draft = await createOutreachDraft(ORG_ID, opportunityId, {
      channel,
      tone,
      subject: result.content.subject ?? null,
      body: result.content.body,
    })

    await updateAIRun(run.id, {
      status: 'complete',
      output: result.content as unknown as Record<string, unknown>,
      tokens_used: result.tokensUsed,
      duration_ms: Date.now() - start,
      completed_at: new Date().toISOString(),
    })
    createAgentLog(ORG_ID, run.id, 'info', 'Outreach draft generation complete', { tokens: result.tokensUsed }).catch(() => {})

    revalidatePath('/outreach')
    return draft
  } catch (error) {
    await updateAIRun(run.id, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - start,
      completed_at: new Date().toISOString(),
    })
    createAgentLog(ORG_ID, run.id, 'error', `Outreach generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`, {}).catch(() => {})
    throw error
  }
}

export async function approveOutreachDraft(id: string): Promise<OutreachDraft> {
  const updated = await updateOutreachDraftStatus(id, 'approved')
  revalidatePath('/outreach')
  return updated
}

export async function markOutreachSent(id: string): Promise<OutreachDraft> {
  const updated = await updateOutreachDraftStatus(id, 'sent')
  revalidatePath('/outreach')
  return updated
}
