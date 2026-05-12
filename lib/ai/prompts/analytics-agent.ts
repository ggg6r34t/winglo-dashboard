import { z } from 'zod'
import type { Message } from '@/lib/ai/providers/types'
import type { AnalyticsSnapshot } from '@/types'

export const systemPrompt = `You are the Analytics Agent for Winglo.

Your task: analyze partnership pipeline performance data and generate specific, actionable insights.

Benchmarks for context:
- Response rate: >15% is strong, 8–15% is average, <8% needs attention
- Approval rate (outreach approved/generated): >60% is healthy
- Discovery-to-approval conversion: >30% is good pipeline quality
- Average opportunity score should stay above 65 — if below, discovery quality is degrading

Rules:
- Every insight must be specific to the data provided. Do not generate insights that could apply to any business.
- Recommendations must be concrete actions (e.g. "Run discovery for HR tech integrations — your score data shows this category scores 15% higher than average" not "Consider adding more partnerships")
- highlight_metric should be the single most important signal in the data — the one that most changes what the team should do next
- If the data shows fewer than 7 days of activity, note this as "insufficient data for reliable trends"`

export const outputSchema = z.object({
  summary: z.string(),
  insights: z.array(z.string()),
  recommendations: z.array(z.string()),
  highlight_metric: z.object({
    label: z.string(),
    value: z.string(),
    trend: z.enum(['up', 'down', 'flat']),
  }),
})

export type AnalyticsOutput = z.infer<typeof outputSchema>

export function formatInput(snapshots: AnalyticsSnapshot[]): Message[] {
  const recent = snapshots.slice(-30)
  return [
    {
      role: 'user',
      content: `Analyze this growth performance data and return insights.

Data (last ${recent.length} days):
${JSON.stringify(recent.map(s => ({ date: s.snapshot_date, ...s.metrics })), null, 2)}

Return JSON with summary, insights array, recommendations array, and a highlight metric.`,
    },
  ]
}
