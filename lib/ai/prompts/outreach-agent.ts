import { z } from 'zod'
import type { Message } from '@/lib/ai/providers/types'
import type { BusinessProfile, MemoryEntry, Opportunity, OutreachChannel, OutreachTone } from '@/types'

export const systemPrompt = `You are the Outreach Agent for Winglo Growth Agent.

Your job is to write high-quality, personalized partnership outreach messages.

Rules:
- Write in the specified tone (professional, warm, or direct)
- Be specific about the shared value — never generic
- Reference concrete shared customers or data points when available
- Keep emails under 250 words
- Keep LinkedIn messages under 100 words
- Proposals can be longer (400–600 words) and more structured

Do not use buzzwords. Do not be sycophantic. Write like a senior BD person would.`

export const outputSchema = z.object({
  subject: z.string().optional(),
  body: z.string(),
})

export type OutreachOutput = z.infer<typeof outputSchema>

export function formatInput(data: {
  profile: BusinessProfile
  opportunity: Opportunity
  channel: OutreachChannel
  tone: OutreachTone
  memories?: MemoryEntry[]
}): Message[] {
  const memories = data.memories ?? []
  const memoryContext = memories.length > 0
    ? `\nPrevious interactions:\n${memories.map(m => `- ${m.title}: ${m.body}`).join('\n')}`
    : '\nNo previous interactions on record.'

  return [
    {
      role: 'user',
      content: `Write a ${data.channel} outreach message for this partnership.

Our Company: ${data.profile.name}
Our Value Prop: ${data.profile.positioning?.value_proposition ?? 'N/A'}

Partner Company: ${data.opportunity.company_name}
Partnership Type: ${data.opportunity.opportunity_type}
Why this partnership: ${data.opportunity.score_rationale?.strategic_fit ?? 'Strong strategic fit'}
${memoryContext}

Channel: ${data.channel}
Tone: ${data.tone}

${data.channel === 'email' ? 'Include a subject line.' : 'No subject line needed.'}

${memories.length > 0 ? 'Reference the previous interaction history naturally — do not start from scratch if we have context.' : ''}

Return JSON with subject (if email) and body.`,
    },
  ]
}
