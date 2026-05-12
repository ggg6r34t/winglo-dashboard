'use server'

import { ai } from '@/lib/ai/providers'
import {
  systemPrompt as memorySystemPrompt,
  outputSchema as memoryOutputSchema,
  formatInput as memoryFormatInput,
} from '@/lib/ai/prompts/memory-agent'
import { createMemoryEntry } from '@/server/dal/memory-entries'
import { createAIRun, updateAIRun, createAgentLog } from '@/server/dal/ai-runs'
import { MOCK_ORG_ID } from '@/lib/mock'
import type { MemoryEntry } from '@/types'
import { revalidatePath } from 'next/cache'
import { getClientKey } from '@/lib/get-client-key'
import { memoryRateLimiter } from '@/lib/rate-limiters'

const ORG_ID = MOCK_ORG_ID

export async function createMemoryFromNotes(
  rawNotes: string,
  context?: string
): Promise<MemoryEntry> {
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    return {
      id: `mem-mock-${Date.now()}`,
      organization_id: ORG_ID,
      entry_type: 'observation',
      title: 'Note captured (mock mode)',
      body: rawNotes.slice(0, 500),
      source: 'manual',
      related_company: null,
      metadata: {},
      created_at: new Date().toISOString(),
    }
  }

  const clientKey = await getClientKey()
  memoryRateLimiter.check(clientKey)

  const run = await createAIRun(ORG_ID, 'memory', { notesLength: rawNotes.length })
  const start = Date.now()

  try {
    await updateAIRun(run.id, { status: 'running', started_at: new Date().toISOString() })
    createAgentLog(ORG_ID, run.id, 'info', 'Memory extraction started', {}).catch(() => {})

    const result = await ai.complete({
      messages: memoryFormatInput({ rawNotes, context }),
      systemPrompt: memorySystemPrompt,
      schema: memoryOutputSchema,
    })

    const entry = await createMemoryEntry(ORG_ID, {
      entry_type: result.content.entry_type,
      title: result.content.title,
      body: result.content.body,
      source: 'memory-agent',
      related_company: result.content.related_company ?? null,
    })

    await updateAIRun(run.id, {
      status: 'complete',
      output: result.content as unknown as Record<string, unknown>,
      tokens_used: result.tokensUsed,
      duration_ms: Date.now() - start,
      completed_at: new Date().toISOString(),
    })
    createAgentLog(ORG_ID, run.id, 'info', 'Memory extraction complete', { entry_type: result.content.entry_type }).catch(() => {})

    revalidatePath('/memory')
    return entry
  } catch (error) {
    await updateAIRun(run.id, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration_ms: Date.now() - start,
      completed_at: new Date().toISOString(),
    })
    createAgentLog(ORG_ID, run.id, 'error', `Memory extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`, {}).catch(() => {})
    throw error
  }
}
