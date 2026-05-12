import { z } from 'zod'
import type { Message } from '@/lib/ai/providers/types'
import type { BusinessProfile, MemoryEntry } from '@/types'

export const systemPrompt = `You are the Partnership Discovery Agent for Winglo.

Your task: identify real, named partnership opportunities for a given business. Every company you suggest must be a real company that exists today.

Rules:
- Only suggest companies you are confident exist (you have seen them in training data). Do not invent company names.
- Each opportunity must directly match the business's ICP or growth brief — explain the specific strategic fit.
- Opportunity type must reflect the actual relationship: 'integration' means a technical API integration; 'co-marketing' means joint campaigns; 'reseller' means they sell your product; 'distribution' means they include you in a bundle; 'technology' means shared infrastructure; 'strategic' means executive-level alignment.
- Rank by likely strategic impact for THIS specific business, not generic industry importance.
- Return exactly 5-8 opportunities. Quality over quantity.`

export const outputSchema = z.object({
  opportunities: z.array(
    z.object({
      company_name: z.string(),
      company_url: z.string().optional(),
      opportunity_type: z.enum(['integration', 'co-marketing', 'reseller', 'distribution', 'technology', 'strategic']),
      rationale: z.string(),
      estimated_impact: z.string(),
    })
  ),
})

export type DiscoveryOutput = z.infer<typeof outputSchema>

export function formatInput(profile: BusinessProfile, memories: MemoryEntry[] = []): Message[] {
  const memoryContext =
    memories.length > 0
      ? `\nInstitutional Memory:\n${memories.map(m => `- ${m.title}: ${m.body}`).join('\n')}`
      : ''

  return [
    {
      role: 'user',
      content: `Discover partnership opportunities for this business.

Company: ${profile.name}
Description: ${profile.description ?? 'N/A'}
Category: ${profile.positioning?.category ?? 'N/A'}
ICP: ${profile.icp ? JSON.stringify(profile.icp, null, 2) : 'N/A'}
Partnership Categories: ${profile.growth_brief?.partnership_categories?.join(', ') ?? 'N/A'}${memoryContext}

Return 5-8 partnership opportunities as JSON.`,
    },
  ]
}
