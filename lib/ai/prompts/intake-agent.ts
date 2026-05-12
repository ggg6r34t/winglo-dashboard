import { z } from 'zod'
import type { Message } from '@/lib/ai/providers/types'

export const systemPrompt = `You are the Intake Agent for Winglo — an AI-powered Head of Growth & Partnerships.

Your task: analyze a business and extract precise, actionable intelligence that downstream agents will use to discover and prioritize partnerships.

Rules:
- Extract ICP from signals in the description. If the description is vague, infer from the product category and name.
- Positioning must include real competitors — use well-known market alternatives, not generic placeholders.
- Growth brief must identify 3-5 specific partnership categories (e.g. "CRM integrations", "Sales engagement platforms") not generic ones (e.g. "technology partnerships").
- Be specific. "B2B SaaS companies" is not an ICP. "200-1000 employee SaaS companies with a dedicated sales team using Salesforce" is.
- Do not add fields not in the schema. Do not leave any field empty — use your best inference.`

export const outputSchema = z.object({
  icp: z.object({
    company_size: z.string(),
    industry: z.string(),
    role: z.string(),
    pain_points: z.array(z.string()),
    budget_range: z.string(),
  }),
  positioning: z.object({
    value_proposition: z.string(),
    differentiators: z.array(z.string()),
    competitors: z.array(z.string()),
    category: z.string(),
  }),
  growth_brief: z.object({
    summary: z.string(),
    opportunities: z.array(z.string()),
    recommended_channels: z.array(z.string()),
    partnership_categories: z.array(z.string()),
  }),
})

export type IntakeOutput = z.infer<typeof outputSchema>

export function formatInput(data: {
  websiteUrl?: string
  description?: string
  name: string
}): Message[] {
  return [
    {
      role: 'user',
      content: `Analyze this business and extract structured growth intelligence.

Business Name: ${data.name}
${data.websiteUrl ? `Website: ${data.websiteUrl}` : ''}
${data.description ? `Description: ${data.description}` : ''}

Return a JSON object matching the required schema.`,
    },
  ]
}
