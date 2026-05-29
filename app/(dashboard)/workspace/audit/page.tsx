import { PageHeader } from '@/components/shared/page-header'
import { getActivityEvents } from '@/server/dal/activity-events'
import { getCurrentOrgId } from '@/server/auth/org'

export default async function AuditPage() {
  const orgId = await getCurrentOrgId()
  const events = await getActivityEvents(orgId, 100)

  return (
    <>
      <PageHeader title="Audit" subtitle={`${events.length} recent event${events.length === 1 ? '' : 's'}`} />

      {events.length === 0 ? (
        <div className="tab-empty">No activity has been recorded yet.</div>
      ) : (
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
          {events.map((event, index) => (
            <div
              key={event.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '150px 120px 1fr 90px',
                gap: 12,
                padding: '11px 14px',
                borderBottom: index < events.length - 1 ? '1px solid var(--line-1)' : undefined,
                fontSize: 12,
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-3)' }}>
                {new Date(event.created_at).toLocaleString()}
              </span>
              <span style={{ color: 'var(--fg-2)' }}>{event.agent_slug ?? event.actor_type}</span>
              <span style={{ color: 'var(--fg-0)' }}>{event.message}</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: event.severity === 'error' ? 'var(--bad)' : event.severity === 'warning' ? 'var(--warn)' : 'var(--fg-3)' }}>
                {event.severity}
              </span>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
