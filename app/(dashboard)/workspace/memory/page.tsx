import { PageHeader } from '@/components/shared/page-header'
import { getMemoryEntries } from '@/server/dal/memory-entries'
import { getCurrentOrgId } from '@/server/auth/org'
import { retractMemoryAction } from '@/features/workforce/server/actions'

export default async function MemoryPage() {
  const orgId = await getCurrentOrgId()
  const records = await getMemoryEntries(orgId, { limit: 100 })

  return (
    <>
      <PageHeader title="Memory" subtitle={`${records.length} persistent record${records.length === 1 ? '' : 's'}`} />

      {records.length === 0 ? (
        <div className="tab-empty">No memory records have been written yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {records.map(record => {
            const confidence = typeof record.metadata.confidence === 'number' ? record.metadata.confidence : 0.9
            const status = typeof record.metadata.status === 'string' ? record.metadata.status : 'active'
            return (
              <article
                key={record.id}
                className="memory-record"
                style={{ opacity: status === 'retracted' ? 0.55 : 1 }}
              >
                <div className="memory-record-head">
                  <div>
                    <div className="memory-record-key">{record.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>
                      {record.source}{record.related_company ? ` / ${record.related_company}` : ''}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)' }}>
                    {confidence.toFixed(2)} / {status}
                  </div>
                </div>
                <div className="memory-record-body">{record.body}</div>
                <div className="memory-record-foot">
                  <span>{new Date(record.created_at).toLocaleString()}</span>
                  {status !== 'retracted' && (
                    <form action={retractMemoryAction.bind(null, record.id)} style={{ marginLeft: 'auto' }}>
                      <button className="btn" type="submit">Retract</button>
                    </form>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}
