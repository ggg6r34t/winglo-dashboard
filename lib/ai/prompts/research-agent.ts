import { z } from 'zod'
import type { Message } from '@/lib/ai/providers/types'

export const systemPrompt = `You are the Company Intelligence Agent for Winglo.

Your task: synthesize a structured intelligence brief about a potential partner company using ONLY:
1. The company name and URL provided
2. Your training knowledge about this company (which may be outdated — flag uncertainty clearly)
3. Context about the requesting business's ICP and growth goals

CRITICAL RULES:
- You do NOT have web access. Your knowledge has a cutoff date.
- For any field where you are uncertain, use "Unknown — verify manually" rather than guessing.
- partner_program_exists: only set to true if you have high confidence from training data. Default to false with a note to verify.
- notable_customers and existing_integrations: list only those you are highly confident about. Use [] if uncertain.
- Your output is a starting point for human review, not a source of truth.
- Flag staleness: if the company is growing rapidly or recently funded, note that your data may be outdated.
- Set intelligence_confidence to 'high', 'medium', or 'low' based on how confident you are in this intelligence brief.`

export const outputSchema = z.object({
  company_name: z.string(),
  company_url: z.string().optional(),
  description: z.string(),
  business_model: z.string(),
  customer_segments: z.array(z.string()),
  notable_customers: z.array(z.string()),
  existing_integrations: z.array(z.string()),
  partner_program_exists: z.boolean(),
  partner_program_notes: z.string().optional(),
  intelligence_confidence: z.enum(['high', 'medium', 'low']),
  data_caveats: z.string().optional(),
})

export type ResearchOutput = z.infer<typeof outputSchema>

export function formatInput(data: { companyName: string; companyUrl?: string }): Message[] {
  return [
    {
      role: 'user',
      content: `Research this company and return structured intelligence.

Company: ${data.companyName}
${data.companyUrl ? `URL: ${data.companyUrl}` : ''}

Return a JSON object matching the required schema.`,
    },
  ]
}
