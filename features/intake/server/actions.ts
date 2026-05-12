'use server'

import { revalidatePath } from 'next/cache'
import { ai } from '@/lib/ai/providers'
import {
  systemPrompt as intakeSystemPrompt,
  outputSchema as intakeOutputSchema,
  formatInput as intakeFormatInput,
} from '@/lib/ai/prompts/intake-agent'
import {
  getLatestBusinessProfile,
  createBusinessProfile,
  updateBusinessProfile,
} from '@/server/dal/business-profiles'
import { createAIRun, updateAIRun, createAgentLog } from '@/server/dal/ai-runs'
import { runDiscoveryPipeline } from '@/lib/ai/pipeline/discovery'
import { mockBusinessProfiles, mockOpportunities, MOCK_ORG_ID, MOCK_PROFILE_ID } from '@/lib/mock'
import { sanitizeForPrompt } from '@/lib/utils'
import { getClientKey } from '@/lib/get-client-key'
import { intakeRateLimiter, discoveryRateLimiter } from '@/lib/rate-limiters'
import type { BusinessProfile, Opportunity } from '@/types'
import type { IntakeFormInput } from '../validations'

// Auth is deferred — hardcoded org until auth is implemented
const ORG_ID = MOCK_ORG_ID

export async function analyzeBusinessProfile(
  input: IntakeFormInput
): Promise<BusinessProfile> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return mockBusinessProfiles.find(p => p.id === MOCK_PROFILE_ID)!
  }

  const clientKey = await getClientKey()
  intakeRateLimiter.check(clientKey)

  // Idempotency: return existing profile if analysis is already in progress or complete
  const existing = await getLatestBusinessProfile(ORG_ID)
  if (existing && (existing.status === 'complete' || existing.status === 'processing')) {
    return existing
  }

  const safeName = sanitizeForPrompt(input.name)
  const safeDescription = sanitizeForPrompt(input.description)
  const safeWebsiteUrl = input.website_url || null

  const profile = await createBusinessProfile(ORG_ID, {
    name: safeName,
    website_url: safeWebsiteUrl,
    description: safeDescription,
    status: 'draft',
  })

  const run = await createAIRun(ORG_ID, 'intake', {
    name: safeName,
    website_url: safeWebsiteUrl,
    description: safeDescription,
  })

  await updateBusinessProfile(profile.id, { status: 'processing' })

  const start = Date.now()

  try {
    await updateAIRun(run.id, { status: 'running', started_at: new Date().toISOString() })
    createAgentLog(ORG_ID, run.id, 'info', 'Intake analysis started', { profile_name: safeName }).catch(() => {})

    const result = await ai.complete({
      messages: intakeFormatInput({
        name: safeName,
        websiteUrl: safeWebsiteUrl || undefined,
        description: safeDescription,
      }),
      systemPrompt: intakeSystemPrompt,
      schema: intakeOutputSchema,
    })

    const updated = await updateBusinessProfile(profile.id, {
      icp: result.content.icp,
      positioning: result.content.positioning,
      growth_brief: result.content.growth_brief,
      status: 'complete',
    })

    await updateAIRun(run.id, {
      status: 'complete',
      output: result.content as unknown as Record<string, unknown>,
      tokens_used: result.tokensUsed,
      duration_ms: Date.now() - start,
      completed_at: new Date().toISOString(),
    })
    createAgentLog(ORG_ID, run.id, 'info', 'Intake analysis complete', { tokens: result.tokensUsed }).catch(() => {})

    return updated
  } catch (error) {
    await updateBusinessProfile(profile.id, { status: 'draft' }).catch(() => {})
    await updateAIRun(run.id, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - start,
      completed_at: new Date().toISOString(),
    })
    createAgentLog(ORG_ID, run.id, 'error', 'Intake analysis failed', { error: error instanceof Error ? error.message : 'Unknown' }).catch(() => {})
    throw error
  }
}

export async function runDiscovery(profileId: string): Promise<Opportunity[]> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return mockOpportunities.filter(o => o.business_profile_id === MOCK_PROFILE_ID)
  }

  const clientKey = await getClientKey()
  discoveryRateLimiter.check(clientKey)

  const created = await runDiscoveryPipeline(ORG_ID, profileId)
  revalidatePath('/opportunities')
  return created
}
