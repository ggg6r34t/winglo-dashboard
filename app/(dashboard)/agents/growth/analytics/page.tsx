import { OutreachChart } from '@/features/analytics/components/outreach-chart'
import { InsightsPanel } from '@/features/analytics/components/insights-panel'
import { GenerateSnapshotButton } from '@/features/analytics/components/generate-snapshot-button'
import { getAnalyticsSnapshots } from '@/server/dal/analytics-snapshots'
import { MOCK_ORG_ID } from '@/lib/mock'

export default async function GrowthAnalyticsPage() {
  const allSnapshots = await getAnalyticsSnapshots(MOCK_ORG_ID, { days: 90 })
  const last30 = allSnapshots.slice(-30)

  const totalOutreachSent    = last30.reduce((sum, s) => sum + s.metrics.outreach_sent, 0)
  const totalOppsDiscovered  = last30.reduce((sum, s) => sum + s.metrics.opportunities_discovered, 0)
  const avgResponseRateRaw   = last30.length > 0
    ? last30.reduce((sum, s) => sum + s.metrics.response_rate, 0) / last30.length
    : 0
  const avgResponseRate = `${(avgResponseRateRaw * 100).toFixed(1)}%`

  const tiles = [
    { label: 'Outreach sent',    value: String(totalOutreachSent),   unit: '', foot: 'last 30 days', footTone: '' },
    { label: 'Opportunities',    value: String(totalOppsDiscovered),  unit: '', foot: 'discovered last 30d', footTone: totalOppsDiscovered > 0 ? 'up' : '' },
    { label: 'Response rate',    value: avgResponseRate,              unit: '', foot: 'rolling avg',  footTone: '' },
  ]

  return (
    <div className="fade-in">
      <div className="tile-row">
        {tiles.map(t => (
          <div className="tile" key={t.label}>
            <div className="tile-label">{t.label}</div>
            <div className="tile-value">
              {t.value}<span className="unit">{t.unit}</span>
            </div>
            <div className={"tile-foot " + t.footTone}>{t.foot}</div>
          </div>
        ))}
      </div>

      <div className="section">
        <div className="section-head">
          <div className="section-title">
            Outreach
            <span className="lbl">last 30 days</span>
          </div>
          <GenerateSnapshotButton />
        </div>
        <OutreachChart snapshots={last30} />
      </div>

      <div className="section">
        <div className="section-head">
          <div className="section-title">AI insights</div>
        </div>
        <InsightsPanel initial={null} />
      </div>
    </div>
  )
}
