import { PageHeader } from '@/components/shared/page-header'
import { getConnectorAccounts } from '@/server/dal/connectors'
import { getCurrentOrgId } from '@/server/auth/org'
import { connectorNotConfiguredAction } from '@/features/workforce/server/actions'

const statusLabel = {
  connected: 'Connected',
  attention: 'Attention',
  error: 'Error',
  not_connected: 'Not connected',
}

export default async function IntegrationsPage() {
  const orgId = await getCurrentOrgId()
  const accounts = await getConnectorAccounts(orgId)
  const connected = accounts.filter(account => account.status === 'connected').length

  return (
    <>
      <PageHeader
        title="Integrations"
        subtitle={`${connected} of ${accounts.length} connector${accounts.length === 1 ? '' : 's'} connected`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
        {accounts.map(account => (
          <div
            key={account.id}
            className="integ-card"
          >
            <div className="integ-card-head">
              <div className="integ-card-mark">{account.connector.name.slice(0, 2).toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="integ-card-name">{account.connector.name}</div>
                <div className="integ-card-cat">{account.connector.category}</div>
              </div>
              <div className={`integ-status ${account.status === 'connected' ? '' : account.status === 'not_connected' ? 'warn' : 'error'}`}>
                <span className="dot" />
                {statusLabel[account.status]}
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.5, marginBottom: 12 }}>
              {account.scopes.join(', ') || 'No scopes configured'}
            </div>
            <div className="integ-card-foot">
              <span>Last sync {account.last_sync_at ? new Date(account.last_sync_at).toLocaleString() : '-'}</span>
              <form action={connectorNotConfiguredAction}>
                <button className="btn" type="submit">
                  {account.status === 'connected' ? 'Configure' : 'Connect'}
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
