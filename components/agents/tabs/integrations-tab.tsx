import type { AgentConfig } from '@/lib/agents/registry'

type IntegStatus = 'ok' | 'warn' | 'error'
type Integration = { mark: string; name: string; scope: string; status: IntegStatus; lastSync: string; accent: string }

const INTEGRATIONS: Record<string, Integration[]> = {
  'social-media': [
    { mark: 'IG', name: 'Instagram',   scope: '2 accounts · post + read',       status: 'ok',   accent: 'oklch(0.62 0.14 320)',  lastSync: '2m'  },
    { mark: 'TT', name: 'TikTok',      scope: '1 account · post + read',        status: 'ok',   accent: 'oklch(0.62 0.005 250)', lastSync: '5m'  },
    { mark: 'LI', name: 'LinkedIn',    scope: 'Company + 3 voices',             status: 'ok',   accent: 'oklch(0.62 0.12 240)',  lastSync: '1m'  },
    { mark: 'X',  name: 'X / Twitter', scope: '1 account · synced',             status: 'ok',   accent: 'oklch(0.62 0.005 250)', lastSync: '4m'  },
    { mark: 'YT', name: 'YouTube',     scope: 'Channel · synced',               status: 'ok',   accent: 'oklch(0.62 0.14 28)',   lastSync: '30m' },
    { mark: 'DR', name: 'Drive',       scope: 'Brand assets',                   status: 'ok',   accent: 'oklch(0.62 0.10 145)',  lastSync: 'now' },
  ],
  growth: [
    { mark: 'AP', name: 'Apollo',      scope: 'Enrichment · 250 credits/day',   status: 'ok',   accent: 'oklch(0.62 0.12 200)',  lastSync: '3m'  },
    { mark: 'HS', name: 'HubSpot',     scope: 'Read/write · 12k contacts',      status: 'ok',   accent: 'oklch(0.62 0.14 28)',   lastSync: '1m'  },
    { mark: 'LI', name: 'LinkedIn',    scope: 'Outreach · founder voice',       status: 'ok',   accent: 'oklch(0.62 0.12 240)',  lastSync: '5m'  },
    { mark: 'GM', name: 'Gmail',       scope: 'Send · founder mailbox',         status: 'ok',   accent: 'oklch(0.62 0.16 28)',   lastSync: '12s' },
    { mark: 'CL', name: 'Clearbit',    scope: 'Company enrichment',             status: 'ok',   accent: 'oklch(0.62 0.12 145)',  lastSync: '8m'  },
  ],
  seo: [
    { mark: 'GS', name: 'Search Console', scope: 'Read · all properties',       status: 'ok',   accent: 'oklch(0.62 0.14 60)',   lastSync: '1h'  },
    { mark: 'GA', name: 'GA4',          scope: 'Site · 3 properties',           status: 'ok',   accent: 'oklch(0.62 0.14 60)',   lastSync: '8m'  },
    { mark: 'AH', name: 'Ahrefs',       scope: 'Ranking · 8k keywords',         status: 'ok',   accent: 'oklch(0.62 0.12 200)',  lastSync: '30m' },
    { mark: 'GH', name: 'GitHub',       scope: 'Open PRs · docs repo',          status: 'ok',   accent: 'oklch(0.62 0.005 250)', lastSync: 'now' },
    { mark: 'CR', name: 'Crawler',      scope: 'Internal · 24h cycle',          status: 'ok',   accent: 'oklch(0.62 0.10 145)',  lastSync: '8m'  },
  ],
  marketing: [
    { mark: 'HS', name: 'HubSpot',     scope: 'Campaigns + email',              status: 'ok',   accent: 'oklch(0.62 0.14 28)',   lastSync: '1m'  },
    { mark: 'WP', name: 'WordPress',   scope: 'Blog · publish + draft',         status: 'ok',   accent: 'oklch(0.62 0.005 250)', lastSync: '12m' },
    { mark: 'FG', name: 'Figma',       scope: 'Brand kit + creative',           status: 'warn', accent: 'oklch(0.62 0.16 28)',   lastSync: '2d'  },
    { mark: 'MA', name: 'Meta Ads',    scope: 'Read-only · ad spend',           status: 'ok',   accent: 'oklch(0.62 0.14 240)',  lastSync: '1h'  },
    { mark: 'GA', name: 'GA4',         scope: 'Attribution · all sites',        status: 'ok',   accent: 'oklch(0.62 0.14 60)',   lastSync: '8m'  },
  ],
  sales: [
    { mark: 'HS', name: 'HubSpot',     scope: 'Deals · pipeline owner',         status: 'ok',   accent: 'oklch(0.62 0.14 28)',   lastSync: '1m'  },
    { mark: 'GM', name: 'Gmail',       scope: 'Send + read · sales@',           status: 'ok',   accent: 'oklch(0.62 0.16 28)',   lastSync: '12s' },
    { mark: 'GG', name: 'Google Cal',  scope: 'Booking · operator + agent',     status: 'ok',   accent: 'oklch(0.62 0.10 145)',  lastSync: 'now' },
    { mark: 'ST', name: 'Stripe',      scope: 'Read-only · revenue',            status: 'ok',   accent: 'oklch(0.62 0.12 270)',  lastSync: 'now' },
    { mark: 'GR', name: 'Grain',       scope: 'Call notes + transcripts',       status: 'ok',   accent: 'oklch(0.62 0.12 200)',  lastSync: '4m'  },
    { mark: 'ZM', name: 'Zoom',        scope: 'Read · meeting records',         status: 'ok',   accent: 'oklch(0.62 0.14 240)',  lastSync: '1h'  },
  ],
  telehealth: [
    { mark: 'EHR',name: 'Athena EHR',  scope: 'Read/write · patient records',   status: 'ok',   accent: 'oklch(0.62 0.12 175)',  lastSync: '30s' },
    { mark: 'RX', name: 'Rx Pharmacy', scope: 'Refills · 4 partner pharmacies', status: 'ok',   accent: 'oklch(0.62 0.10 145)',  lastSync: '1m'  },
    { mark: 'TX', name: 'Twilio',      scope: 'SMS · patient comms',            status: 'ok',   accent: 'oklch(0.62 0.16 28)',   lastSync: 'now' },
    { mark: 'ZM', name: 'Zoom Health', scope: 'HIPAA video · scheduled visits', status: 'ok',   accent: 'oklch(0.62 0.14 240)',  lastSync: '10m' },
    { mark: 'ID', name: 'ID.me',       scope: 'Identity verification',          status: 'ok',   accent: 'oklch(0.62 0.12 175)',  lastSync: '1h'  },
  ],
  'analytics-manager': [
    { mark: 'SQ', name: 'Snowflake',   scope: 'Warehouse · read',               status: 'ok',   accent: 'oklch(0.62 0.12 200)',  lastSync: '5m'  },
    { mark: 'MP', name: 'Mixpanel',    scope: 'Product events',                 status: 'ok',   accent: 'oklch(0.62 0.12 270)',  lastSync: '4m'  },
    { mark: 'GA', name: 'GA4',         scope: 'All properties',                 status: 'ok',   accent: 'oklch(0.62 0.14 60)',   lastSync: '8m'  },
    { mark: 'SE', name: 'Segment',     scope: 'CDP · 6 sources',                status: 'ok',   accent: 'oklch(0.62 0.12 145)',  lastSync: 'now' },
    { mark: 'ST', name: 'Stripe',      scope: 'Revenue · subs',                 status: 'ok',   accent: 'oklch(0.62 0.12 270)',  lastSync: 'now' },
    { mark: 'SL', name: 'Slack',       scope: 'Post · #leadership',             status: 'ok',   accent: 'oklch(0.62 0.14 320)',  lastSync: 'now' },
  ],
  research: [
    { mark: 'PX', name: 'Perplexity Pro', scope: 'Web research',                status: 'ok',   accent: 'oklch(0.62 0.12 200)',  lastSync: 'now' },
    { mark: 'CR', name: 'Crunchbase',  scope: 'Company + funding data',         status: 'ok',   accent: 'oklch(0.62 0.12 240)',  lastSync: '30m' },
    { mark: 'AR', name: 'arXiv',       scope: 'Research papers',                status: 'ok',   accent: 'oklch(0.62 0.10 30)',   lastSync: '1h'  },
    { mark: 'NT', name: 'Notion',      scope: 'Workspace · publish briefs',     status: 'ok',   accent: 'oklch(0.62 0.005 250)', lastSync: '30s' },
    { mark: 'DR', name: 'Drive',       scope: 'Source archive',                 status: 'ok',   accent: 'oklch(0.62 0.10 145)',  lastSync: 'now' },
  ],
  outreach: [
    { mark: 'GM', name: 'Gmail',       scope: 'Send · sequences + founder@',    status: 'ok',   accent: 'oklch(0.62 0.16 28)',   lastSync: '12s' },
    { mark: 'AP', name: 'Apollo',      scope: 'Enrichment · 250 credits/day',   status: 'ok',   accent: 'oklch(0.62 0.12 200)',  lastSync: '3m'  },
    { mark: 'HS', name: 'HubSpot',     scope: 'Sequence tracking · CRM sync',   status: 'ok',   accent: 'oklch(0.62 0.14 28)',   lastSync: '1m'  },
    { mark: 'LI', name: 'LinkedIn',    scope: 'Connection + InMail',            status: 'ok',   accent: 'oklch(0.62 0.12 240)',  lastSync: '5m'  },
    { mark: 'CL', name: 'Clearbit',    scope: 'Company + role enrichment',      status: 'ok',   accent: 'oklch(0.62 0.12 145)',  lastSync: '8m'  },
  ],
}

const STATUS_LABEL: Record<IntegStatus, string> = { ok: 'Synced', warn: 'Attention', error: 'Error' }

export function IntegrationsTab({ agent }: { agent: AgentConfig }) {
  const items = INTEGRATIONS[agent.slug] ?? []
  const healthy   = items.filter(i => i.status === 'ok').length
  const attention = items.filter(i => i.status === 'warn').length
  const errors    = items.filter(i => i.status === 'error').length

  return (
    <div className="hub-body fade-in">
      <div className="tile-row">
        <div className="tile">
          <div className="tile-label">Connected</div>
          <div className="tile-value">{items.length}</div>
          <div className="tile-foot">tools {agent.name} can touch</div>
        </div>
        <div className="tile">
          <div className="tile-label">Healthy</div>
          <div className="tile-value" style={{ color: 'var(--ok)' }}>{healthy}</div>
          <div className="tile-foot">syncing on schedule</div>
        </div>
        <div className="tile">
          <div className="tile-label">Attention</div>
          <div className="tile-value" style={{ color: 'var(--warn)' }}>{attention}</div>
          <div className="tile-foot">re-auth or stale</div>
        </div>
        <div className="tile">
          <div className="tile-label">Errors</div>
          <div className="tile-value" style={{ color: 'var(--bad)' }}>{errors}</div>
          <div className="tile-foot">action required</div>
        </div>
      </div>

      <div className="hub-section-head">
        <div className="section-title">
          {agent.name}&apos;s integrations
          <span className="lbl">scoped permissions · least-privilege by default</span>
        </div>
        <button className="btn">Connect tool</button>
      </div>

      <div className="integ-tab-grid">
        {items.map((it, i) => (
          <div className="integ-card" key={i}>
            <div className="integ-card-head">
              <div
                className="integ-card-mark"
                style={{
                  background:   `color-mix(in oklch, ${it.accent} 18%, var(--bg-2))`,
                  color:         it.accent,
                  borderColor:  `color-mix(in oklch, ${it.accent} 30%, var(--line-2))`,
                }}
              >
                {it.mark}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="integ-card-name">{it.name}</div>
                <div className="integ-card-cat">{it.scope.split('·')[0].trim()}</div>
              </div>
              <div className={`integ-status ${it.status !== 'ok' ? it.status : ''}`}>
                <span className="dot" />
                {STATUS_LABEL[it.status]}
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--fg-2)', lineHeight: 1.5, marginBottom: 12 }}>
              {it.scope}
            </div>
            <div className="integ-card-foot">
              <span>Last sync · {it.lastSync}</span>
              <span style={{ color: 'var(--fg-2)', cursor: 'pointer' }}>Configure →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
