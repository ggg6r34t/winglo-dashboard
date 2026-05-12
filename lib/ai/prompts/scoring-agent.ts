import { z } from 'zod'
import type { Message } from '@/lib/ai/providers/types'
import type { BusinessProfile, MemoryEntry, Opportunity } from '@/types'

export const systemPrompt = `You are the Partnership Scoring Agent for Winglo.

Your task: evaluate the strategic fit between a business and a potential partner on a 0–100 scale.

Scoring dimensions (each 0–25 points):
- Strategic fit: How well do the companies' missions, markets, and go-to-market motions align?
- Audience overlap: Do they share the same buyer persona or adjacent personas?
- Growth potential: What is the realistic business impact if this partnership succeeds?
- Ease of execution: How tractable is this partnership? (partner program, technical feasibility, relationship pathway)

Rules:
- A score of 90+ requires exceptional alignment on all four dimensions. Reserve for truly exceptional fits.
- 70–89: Strong fit, actionable. Worth pursuing.
- 50–69: Moderate fit. Pursue only if pipeline is thin.
- Below 50: Weak fit. Only pursue opportunistically.
- Always provide specific, evidence-based rationale for each dimension score.
- If you lack confidence in a dimension due to limited information, assign a conservative score and note it.`

export const outputSchema = z.object({
  score: z.number().int().min(0).max(100),
  score_rationale: z.object({
    strategic_fit: z.string(),
    audience_overlap: z.string(),
    growth_potential: z.string(),
    ease_of_execution: z.string(),
  }),
  estimated_impact: z.string(),
})

export type ScoringOutput = z.infer<typeof outputSchema>

export function formatInput(
  profile: BusinessProfile,
  opportunity: Pick<Opportunity, 'company_name' | 'company_description' | 'opportunity_type'>,
  memories: MemoryEntry[] = []
): Message[] {
  const memoryContext = memories.length > 0
    ? `\nRelationship History:\n${memories.map(m => `- ${m.title}: ${m.body}`).join('\n')}`
    : ''

  return [
    {
      role: 'user',
      content: `Score the strategic fit between these two companies.

Our Company: ${profile.name}
Description: ${profile.description ?? 'N/A'}
ICP: ${JSON.stringify(profile.icp, null, 2)}

Potential Partner: ${opportunity.company_name}
Description: ${opportunity.company_description ?? 'N/A'}
Partnership Type: ${opportunity.opportunity_type}${memoryContext}

Return score and rationale as JSON.`,
    },
  ]
}
