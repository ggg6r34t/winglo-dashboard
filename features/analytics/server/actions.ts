'use server'

import { ai } from '@/lib/ai/providers'
import {
  systemPrompt as analyticsSystemPrompt,
  outputSchema as analyticsOutputSchema,
  formatInput as analyticsFormatInput,
  type AnalyticsOutput,
} from '@/lib/ai/prompts/analytics-agent'
import { getAnalyticsSnapshots } from '@/server/dal/analytics-snapshots'
import { createAIRun, updateAIRun, createAgentLog } from '@/server/dal/ai-runs'
import { MOCK_ORG_ID } from '@/lib/mock'
import { revalidatePath } from 'next/cache'
import { getClientKey } from '@/lib/get-client-key'
import { analyticsRateLimiter } from '@/lib/rate-limiters'

const ORG_ID = MOCK_ORG_ID

export async function generateAnalyticsInsights(): Promise<AnalyticsOutput> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return {
      summary: 'Strong outreach velocity with improving response rates over the last 30 days.',
      insights: [
        'Response rate up 18% week-over-week — highest since tracking began.',
        'Opportunities discovered dropped last week; discovery agent may need re-run.',
        'Approval rate for outreach drafts is 72% — above the 60% benchmark.',
      ],
      recommendations: [
        'Run a new discovery pass to replenish the opportunities pipeline.',
        'Double down on integration-type partnerships — highest response rate.',
        'Schedule outreach sends on Tuesday/Thursday for better open rates.',
      ],
      highlight_metric: {
        label: 'Response Rate',
        value: '14.2%',
        trend: 'up',
      },
    }
  }

  const clientKey = await getClientKey()
  analyticsRateLimiter.check(clientKey)

  const snapshots = await getAnalyticsSnapshots(ORG_ID, { days: 30 })
  const run = await createAIRun(ORG_ID, 'analytics', { snapshotCount: snapshots.length })
  const start = Date.now()

  try {
    await updateAIRun(run.id, { status: 'running', started_at: new Date().toISOString() })
    createAgentLog(ORG_ID, run.id, 'info', 'Analytics insights generation started', {}).catch(() => {})

    const result = await ai.complete({
      messages: analyticsFormatInput(snapshots),
      systemPrompt: analyticsSystemPrompt,
      schema: analyticsOutputSchema,
    })

    await updateAIRun(run.id, {
      status: 'complete',
      output: result.content as unknown as Record<string, unknown>,
      tokens_used: result.tokensUsed,
      duration_ms: Date.now() - start,
      completed_at: new Date().toISOString(),
    })
    createAgentLog(ORG_ID, run.id, 'info', 'Analytics insights generation complete', { tokens: result.tokensUsed }).catch(() => {})

    revalidatePath('/analytics')
    return result.content
  } catch (error) {
    await updateAIRun(run.id, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - start,
      completed_at: new Date().toISOString(),
    })
    createAgentLog(ORG_ID, run.id, 'error', `Analytics insights generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`, {}).catch(() => {})
    throw error
  }
}
