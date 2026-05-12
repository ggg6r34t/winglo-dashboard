import type { AnalyticsSnapshot } from '@/types'
import { MOCK_ORG_ID } from './organizations'

const ORG = MOCK_ORG_ID

function generateSnapshots(): AnalyticsSnapshot[] {
  const snapshots: AnalyticsSnapshot[] = []
  const start = new Date('2026-02-10')

  for (let i = 0; i < 90; i++) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]

    const baseOutreachSent = Math.floor(2 + Math.random() * 4)
    const baseOutreachApproved = Math.floor(baseOutreachSent * 0.6)
    const baseOppsDiscovered = i % 7 === 0 ? Math.floor(1 + Math.random() * 3) : 0
    const baseOppsApproved = i % 14 === 0 ? Math.floor(1 + Math.random() * 2) : 0

    snapshots.push({
      id: `snap-${dateStr}`,
      organization_id: ORG,
      snapshot_date: dateStr,
      metrics: {
        outreach_sent: baseOutreachSent,
        outreach_approved: baseOutreachApproved,
        opportunities_discovered: baseOppsDiscovered,
        opportunities_approved: baseOppsApproved,
        response_rate: parseFloat((0.08 + Math.random() * 0.12).toFixed(3)),
        avg_score: parseFloat((65 + Math.random() * 20).toFixed(1)),
      },
      created_at: `${dateStr}T23:59:00Z`,
    })
  }

  return snapshots
}

export const mockAnalyticsSnapshots: AnalyticsSnapshot[] = generateSnapshots()
