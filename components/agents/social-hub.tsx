const PLATFORM_COLORS: Record<string, string> = {
  IG: 'oklch(0.65 0.18 320)',
  TT: 'oklch(0.85 0.005 250)',
  LI: 'oklch(0.58 0.12 250)',
  X:  'oklch(0.55 0.005 250)',
  YT: 'oklch(0.65 0.18 28)',
}

interface PipeItem {
  platform: string
  title: string
  time: string
  meta: string
}

const PIPELINE: Record<string, PipeItem[]> = {
  drafts: [
    { platform: 'IG', title: "Reel — 'How Atlas sources 300 leads/week' (hook variant A)", time: '2m ago',  meta: 'draft' },
    { platform: 'IG', title: 'Carousel — 5 pricing patterns we tested in 2025',           time: '14m ago', meta: 'draft' },
    { platform: 'TT', title: 'Short — Behind the scenes of an AI workforce',               time: '1h ago',  meta: 'draft' },
    { platform: 'X',  title: 'Thread — Lessons from shipping 4 agents in 30 days',         time: '2h ago',  meta: 'draft' },
  ],
  review: [
    { platform: 'IG', title: "Reel — 'Why we replaced our SDR team with Atlas'",    time: '8m ago',  meta: 'your review'  },
    { platform: 'LI', title: 'Post — Long-form Q3 retro from Jordan',               time: '32m ago', meta: 'your review'  },
    { platform: 'TT', title: 'Short — 30 seconds with Mira (telehealth)',            time: '1h ago',  meta: 'Lyra revising' },
  ],
  scheduled: [
    { platform: 'IG', title: 'Reel — Q3 product launch teaser #1',          time: 'Thu · 09:00', meta: 'scheduled' },
    { platform: 'IG', title: 'Reel — Q3 launch teaser #2 (variant B)',       time: 'Thu · 13:00', meta: 'scheduled' },
    { platform: 'LI', title: 'Post — partnership announcement w/ Coil',      time: 'Fri · 10:00', meta: 'scheduled' },
    { platform: 'X',  title: 'Thread — launch day playbook',                 time: 'Mon · 09:00', meta: 'scheduled' },
  ],
  live: [
    { platform: 'IG', title: "Reel — 'Welcome to Winglo' (refresh)", time: 'Today · 09:00', meta: '12.4k reach'    },
    { platform: 'TT', title: 'Short — meet the team (Mira)',          time: 'Yesterday',     meta: '48.2k views'   },
    { platform: 'LI', title: 'Post — engineering deep-dive',          time: '2d ago',        meta: '892 reactions' },
  ],
}

const TILES = [
  { label: 'Posts last 7d',       value: '23',  unit: '',      foot: '+4 vs prev week',       footTone: 'up' },
  { label: 'Reach',               value: '284', unit: 'k',     foot: '+18.2% wow',             footTone: 'up' },
  { label: 'Engagement',          value: '4.7', unit: '%',     foot: 'Above category median', footTone: 'up' },
  { label: 'Pending approval',    value: '3',   unit: 'drafts', foot: 'Oldest 12m',            footTone: ''   },
]

const INTEGRATIONS = [
  { mark: 'IG', name: 'Instagram',   meta: '2 accounts · synced'   },
  { mark: 'TT', name: 'TikTok',      meta: '1 account · synced'    },
  { mark: 'LI', name: 'LinkedIn',    meta: 'Company + 3 voices'    },
  { mark: 'X',  name: 'X / Twitter', meta: '1 account · synced'    },
  { mark: 'YT', name: 'YouTube',     meta: 'Channel · synced'      },
  { mark: 'FB', name: 'Meta Ads',    meta: 'Read-only · ads'       },
  { mark: 'GA', name: 'GA4',         meta: 'Site analytics'        },
  { mark: 'DR', name: 'Drive',       meta: 'Assets · synced'       },
]

const CAL_ACTIVITY: Record<number, string[]> = {
  13: ['IG'],
  14: ['IG', 'LI'],
  15: ['X'],
  16: ['IG', 'TT', 'LI'],
  17: ['IG'],
  18: ['IG', 'LI'],
  19: ['X'],
  22: ['IG'],
}
const TODAY = 16

function PipeCard({ item }: { item: PipeItem }) {
  const color = PLATFORM_COLORS[item.platform]
  return (
    <div className="pipe-card">
      <div className="pipe-card-meta">
        <span className="platform-dot" style={{ background: color }} />
        <span>{item.platform}</span>
      </div>
      <div className="pipe-card-title">{item.title}</div>
      <div className="pipe-card-foot">
        <span>{item.time}</span>
        <span>{item.meta}</span>
      </div>
    </div>
  )
}

function PipeColumn({ title, items }: { title: string; items: PipeItem[] }) {
  return (
    <div className="pipe-col">
      <div className="pipe-col-head">
        <div className="pipe-col-title">{title}</div>
        <div className="pipe-col-count">{items.length}</div>
      </div>
      {items.map((it, i) => <PipeCard key={i} item={it} />)}
    </div>
  )
}

function CalendarBlock() {
  const days = Array.from({ length: 28 }, (_, i) => i + 1)
  return (
    <div className="cal">
      <div className="cal-head">
        <div className="section-title">
          Calendar
          <span className="lbl">May 2026</span>
        </div>
        <span className="section-link">Open →</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase' }}>{d}</div>
        ))}
      </div>
      <div className="cal-grid">
        {days.map(d => (
          <div key={d} className={'cal-cell' + (d === TODAY ? ' today' : '')}>
            {d}
            {CAL_ACTIVITY[d] && (
              <div className="dots">
                {CAL_ACTIVITY[d].map((p, i) => (
                  <span key={i} style={{ background: PLATFORM_COLORS[p] }} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SocialHub() {
  return (
    <div className="hub-body fade-in">
      <div className="tile-row">
        {TILES.map(t => (
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
            Content pipeline
            <span className="lbl">14 items · drag to advance</span>
          </div>
          <span className="section-link">Open board →</span>
        </div>
        <div className="pipeline">
          <PipeColumn title="Drafts"    items={PIPELINE.drafts}    />
          <PipeColumn title="In review" items={PIPELINE.review}    />
          <PipeColumn title="Scheduled" items={PIPELINE.scheduled} />
          <PipeColumn title="Live"      items={PIPELINE.live}      />
        </div>
      </div>

      <div className="split">
        <CalendarBlock />
        <div>
          <div className="section-head">
            <div className="section-title">
              Integrations
              <span className="lbl">8 sources</span>
            </div>
            <span className="section-link">Manage →</span>
          </div>
          <div className="integrations">
            {INTEGRATIONS.map(it => (
              <div className="integ" key={it.name}>
                <div
                  className="integ-mark"
                  style={{
                    background: PLATFORM_COLORS[it.mark]
                      ? `color-mix(in oklch, ${PLATFORM_COLORS[it.mark]} 18%, var(--bg-2))`
                      : 'var(--bg-2)',
                    color: PLATFORM_COLORS[it.mark] || 'var(--fg-1)',
                  }}
                >
                  {it.mark}
                </div>
                <div className="integ-body">
                  <div className="integ-name">{it.name}</div>
                  <div className="integ-meta">{it.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
