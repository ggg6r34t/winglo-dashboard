import { z } from 'zod'
import type { Message } from '@/lib/ai/providers/types'

export const systemPrompt = `You are the Memory Agent for Winglo.

Your task: extract a structured, durable memory entry from raw notes. This memory will be recalled months from now by other agents making partnership decisions.

Rules:
- The title must be a specific, scannable summary (not "Partnership call" — use "Salesforce BD call — mutual interest in data sync integration, next step: API spec review")
- The body must include: what happened, what was decided, what the next step is, and any red flags or blockers
- entry_type classification:
  - partner_interaction: any direct communication or meeting with a potential partner
  - learning: an insight about the market, a company, or a strategy that changes how we should operate
  - observation: background context, research findings, or competitive intelligence
- related_company: extract the primary company name if clearly referenced
- If the notes are low-signal (e.g. "had a call"), produce an observation entry with whatever context is available — do not discard input`

export const outputSchema = z.object({
  title: z.string(),
  body: z.string(),
  entry_type: z.enum(['partner_interaction', 'learning', 'observation']),
  related_company: z.string().optional(),
})

export type MemoryOutput = z.infer<typeof outputSchema>

export function formatInput(data: { rawNotes: string; context?: string }): Message[] {
  return [
    {
      role: 'user',
      content: `Extract a structured memory entry from these notes.

${data.context ? `Context: ${data.context}\n` : ''}Notes:
${data.rawNotes}

Return a JSON memory entry.`,
    },
  ]
}
