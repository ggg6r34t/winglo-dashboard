import { PageHeader } from '@/components/shared/page-header'
import { MetricCard } from '@/features/analytics/components/metric-card'
import { OutreachChart } from '@/features/analytics/components/outreach-chart'
import { InsightsPanel } from '@/features/analytics/components/insights-panel'
import { GenerateSnapshotButton } from '@/features/analytics/components/generate-snapshot-button'
import { getAnalyticsSnapshots } from '@/server/dal/analytics-snapshots'
import { MOCK_ORG_ID } from '@/lib/mock'

export default async function GrowthAnalyticsPage() {
  const allSnapshots = await getAnalyticsSnapshots(MOCK_ORG_ID, { days: 90 })
  const last30 = allSnapshots.slice(-30)

  const totalOutreachSent = last30.reduce((sum, s) => sum + s.metrics.outreach_sent, 0)
  const totalOppsDiscovered = last30.reduce((sum, s) => sum + s.metrics.opportunities_discovered, 0)
  const avgResponseRateRaw =
    last30.length > 0
      ? last30.reduce((sum, s) => sum + s.metrics.response_rate, 0) / last30.length
      : 0
  const avgResponseRate = `${(avgResponseRateRaw * 100).toFixed(1)}%`

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Growth velocity and partnership pipeline"
        action={<GenerateSnapshotButton />}
      />

      {/* Row 1: 3 metric cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <MetricCard label="Outreach Sent" value={totalOutreachSent} sub="last 30 days" />
        <MetricCard
          label="Opportunities"
          value={totalOppsDiscovered}
          sub="discovered last 30 days"
        />
        <MetricCard label="Response Rate" value={avgResponseRate} />
      </div>

      {/* Row 2: Outreach chart */}
      <OutreachChart snapshots={last30} />

      {/* Row 3: AI Insights */}
      <InsightsPanel initial={null} />
    </>
  )
}
