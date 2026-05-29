import { PageHeader } from '@/components/shared/page-header'
import { getReports } from '@/server/dal/reports'
import { getCurrentOrgId } from '@/server/auth/org'

export default async function ReportsPage() {
  const orgId = await getCurrentOrgId()
  const reports = await getReports(orgId)

  return (
    <>
      <PageHeader title="Reports" subtitle={`${reports.length} generated artifact${reports.length === 1 ? '' : 's'}`} />

      {reports.length === 0 ? (
        <div className="tab-empty">No reports have been generated yet.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          {reports.map(report => (
            <article
              key={report.id}
              style={{
                background: 'var(--bg-1)',
                border: '1px solid var(--line-1)',
                borderRadius: 'var(--r-lg)',
                padding: 14,
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)', marginBottom: 8 }}>
                {report.agent_slug} / {report.category}{report.pinned ? ' / pinned' : ''}
              </div>
              <h2 style={{ fontSize: 14, color: 'var(--fg-0)', margin: 0, marginBottom: 6 }}>
                {report.title}
              </h2>
              <p style={{ fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.5, margin: 0 }}>
                {report.summary}
              </p>
              <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {report.tags.map(tag => <span className="tag" key={tag}>{tag}</span>)}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
