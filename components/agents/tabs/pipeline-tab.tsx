import type { AgentConfig } from '@/lib/agents/registry'

type PipeItem = { tag: string; title: string; meta: string; time: string }
type Pipeline = {
  title: string
  itemLabel: string
  stages: string[]
  items: Record<string, PipeItem[]>
}

const PIPELINES: Record<string, Pipeline> = {
  'social-media': {
    title: 'Content pipeline', itemLabel: 'posts',
    stages: ['Drafts', 'In review', 'Scheduled', 'Live'],
    items: {
      Drafts: [
        { tag: 'IG',  title: "Reel — 'How Atlas sources 300 leads/week' (variant A)", meta: 'draft',        time: '2m'    },
        { tag: 'IG',  title: 'Carousel — 5 pricing patterns we tested in 2025',       meta: 'draft',        time: '14m'   },
        { tag: 'TT',  title: 'Short — Behind the scenes of an AI workforce',          meta: 'draft',        time: '1h'    },
        { tag: 'X',   title: 'Thread — Lessons from shipping 4 agents in 30 days',   meta: 'draft',        time: '2h'    },
      ],
      'In review': [
        { tag: 'IG',  title: "Reel — 'Why we replaced our SDR team with Atlas'",      meta: 'your review',  time: '8m'    },
        { tag: 'LI',  title: 'Post — Long-form Q3 retro from Jordan',                 meta: 'your review',  time: '32m'   },
        { tag: 'TT',  title: 'Short — 30 seconds with Mira (telehealth)',             meta: 'revising',     time: '1h'    },
      ],
      Scheduled: [
        { tag: 'IG',  title: 'Reel — Q3 product launch teaser #1',                   meta: 'Thu · 09:00',  time: ''      },
        { tag: 'IG',  title: 'Reel — Q3 launch teaser #2 (variant B)',               meta: 'Thu · 13:00',  time: ''      },
        { tag: 'LI',  title: 'Post — partnership announcement w/ Coil',               meta: 'Fri · 10:00',  time: ''      },
        { tag: 'X',   title: 'Thread — launch day playbook',                          meta: 'Mon · 09:00',  time: ''      },
      ],
      Live: [
        { tag: 'IG',  title: "Reel — 'Welcome to Winglo' (refresh)",                  meta: '12.4k reach',  time: 'today' },
        { tag: 'TT',  title: 'Short — meet the team (Mira)',                          meta: '48.2k views',  time: 'yest.' },
        { tag: 'LI',  title: 'Post — engineering deep-dive',                          meta: '892 reactions', time: '2d'   },
      ],
    },
  },
  growth: {
    title: 'Lead pipeline', itemLabel: 'leads',
    stages: ['Sourced', 'Enriched', 'Outreach', 'Engaged'],
    items: {
      Sourced: [
        { tag: 'API', title: 'Series A SaaS list · 280 contacts from Apollo',        meta: 'raw · needs enrichment', time: '6m'  },
        { tag: 'WEB', title: 'Q3 webinar attendees · 142 sign-ups',                  meta: 'warm',                   time: '1h'  },
        { tag: 'REF', title: 'Coil partnership intros · 8 contacts',                 meta: 'high-intent',            time: '3h'  },
      ],
      Enriched: [
        { tag: '🇺🇸', title: 'Maya Chen · Loop · VP Eng · 240 employees',            meta: 'ICP match',    time: '12m' },
        { tag: '🇨🇦', title: 'Aiden Park · Stride · CTO · 92 employees',             meta: 'ICP match',    time: '18m' },
        { tag: '🇬🇧', title: 'Lena Whitford · Mercer · Head of Ops',                 meta: 'verify size',  time: '1h'  },
        { tag: '🇩🇪', title: 'Hans Berger · Klar · Founder · 14 employees',          meta: 'below ICP',    time: '2h'  },
      ],
      Outreach: [
        { tag: 'EM',  title: 'Maya Chen · sequence step 2 sent',                     meta: 'opened',       time: '2m'  },
        { tag: 'EM',  title: 'Aiden Park · sequence step 1 sent',                    meta: 'delivered',    time: '32m' },
        { tag: 'LI',  title: 'Lena Whitford · LinkedIn intro request',               meta: 'queued',       time: '1h'  },
      ],
      Engaged: [
        { tag: 'EM',  title: 'Maya Chen · replied · wants demo',                     meta: '→ routed to Hale', time: '12m' },
        { tag: 'MTG', title: 'Coil · Fri 11:00 PT · partnership exec',               meta: 'booked',       time: '1h'  },
        { tag: 'EM',  title: 'Stride · technical questions',                          meta: '→ Hale draft', time: '3h'  },
      ],
    },
  },
  seo: {
    title: 'Site pipeline', itemLabel: 'pages',
    stages: ['Crawled', 'Flagged', 'Patched', 'Shipped'],
    items: {
      Crawled: [
        { tag: 'API',  title: '/docs/api/v2/* · 142 endpoint pages',                 meta: 'scan complete', time: '8m'  },
        { tag: 'BLOG', title: 'Blog archive · 218 posts re-indexed',                 meta: 'scan complete', time: '1h'  },
        { tag: 'PROD', title: '/product/* · 24 marketing pages',                     meta: 'scan complete', time: '2h'  },
      ],
      Flagged: [
        { tag: 'API',  title: '11 duplicate canonicals in /docs/api/v2/*',           meta: 'high · ranking risk', time: '2m'  },
        { tag: 'BLOG', title: '4 missing H1s in legacy archive',                     meta: 'med',           time: '1h'  },
        { tag: 'PROD', title: 'Pricing page · weak internal linking',                meta: 'low',           time: '2h'  },
        { tag: 'API',  title: 'Schema.org missing on 18 endpoint pages',             meta: 'med',           time: '3h'  },
      ],
      Patched: [
        { tag: 'PR',   title: 'PR #1284 · canonical fixes · 11 files',               meta: 'your approval', time: '14m' },
        { tag: 'PR',   title: 'PR #1283 · H1 backfill · 4 posts',                   meta: 'your approval', time: '1h'  },
      ],
      Shipped: [
        { tag: '✓',   title: 'Internal links audit · 32 pages improved',            meta: 'merged',        time: 'yest.' },
        { tag: '✓',   title: 'Sitemap regeneration · all routes',                   meta: 'merged',        time: '2d'  },
        { tag: '✓',   title: 'Robots.txt · staging exclusion',                      meta: 'merged',        time: '3d'  },
      ],
    },
  },
  marketing: {
    title: 'Campaign pipeline', itemLabel: 'campaigns',
    stages: ['Concept', 'Draft', 'Approval', 'Live'],
    items: {
      Concept: [
        { tag: 'Q3',  title: 'Q4 product roadmap teaser',                            meta: 'ideation',      time: '1d'  },
        { tag: 'EVT', title: 'Annual customer summit · save the date',               meta: 'ideation',      time: '2d'  },
      ],
      Draft: [
        { tag: 'LCH', title: 'Q3 launch — blog · email · social · PR',              meta: '4 variants ready', time: '2h' },
        { tag: 'PR',  title: 'Coil partnership press release',                       meta: 'v3',            time: '1d'  },
        { tag: 'EM',  title: 'Customer monthly · May edition',                       meta: 'v2',            time: '1d'  },
      ],
      Approval: [
        { tag: 'LCH', title: 'Q3 launch announcement · multi-channel',              meta: 'embargo Thu 09:00', time: '14m' },
        { tag: 'AD',  title: 'Refresh paid placements · 6 publications',             meta: 'monthly · $4.2k', time: '5h' },
      ],
      Live: [
        { tag: 'EM',  title: 'Customer monthly · April edition',                     meta: '32% open rate', time: '2w'  },
        { tag: 'PR',  title: 'Acme partnership · press release',                     meta: '12 pickups',    time: '3w'  },
        { tag: 'BLOG',title: 'How we built the workforce OS',                        meta: '8.4k reads',    time: '4w'  },
      ],
    },
  },
  sales: {
    title: 'Conversation pipeline', itemLabel: 'deals',
    stages: ['Intro', 'Qualified', 'Proposal', 'Closed'],
    items: {
      Intro: [
        { tag: '$$',   title: 'Maya Chen · Loop · 240 emp',                          meta: 'demo Fri 11:00', time: '12m' },
        { tag: '$$',   title: 'Aiden Park · Stride · 92 emp',                       meta: 'first call booked', time: '1h' },
        { tag: '$$',   title: 'Lena Whitford · Mercer',                              meta: 'needs identifying', time: '2h' },
      ],
      Qualified: [
        { tag: '$$$',  title: 'Northwind · 1,200 emp · trial active',               meta: 'stage 2',       time: '1d'  },
        { tag: '$$$',  title: 'Coil · 80 emp · partner + customer',                 meta: 'stage 2',       time: '1d'  },
        { tag: '$$',   title: 'Beam · 110 emp · evaluating',                        meta: 'stage 2',       time: '2d'  },
      ],
      Proposal: [
        { tag: '$$$$', title: 'Northwind · annual proposal v2',                     meta: 'stalled · 21d', time: '5d'  },
        { tag: '$$$',  title: 'Coil · partner + customer bundle',                   meta: 'stage 3',       time: '3d'  },
      ],
      Closed: [
        { tag: '✓',   title: 'Plym · annual · $48k ARR',                            meta: 'won',           time: '1w'  },
        { tag: '✓',   title: 'Forge · annual · $32k ARR',                           meta: 'won',           time: '1w'  },
        { tag: '✕',   title: 'Glint · no decision · churn risk',                   meta: 'lost',          time: '2w'  },
      ],
    },
  },
  telehealth: {
    title: 'Patient pipeline', itemLabel: 'cases',
    stages: ['Intake', 'Triaged', 'Routed', 'Resolved'],
    items: {
      Intake: [
        { tag: '🟡', title: 'P-1842 · medication reconciliation question',          meta: 'non-urgent',    time: '4m'  },
        { tag: '🟡', title: 'P-1841 · follow-up symptom check',                    meta: 'non-urgent',    time: '12m' },
        { tag: '🟡', title: 'P-1840 · new patient intake',                         meta: 'scheduling',    time: '22m' },
      ],
      Triaged: [
        { tag: '🟠', title: 'P-1839 · post-procedure pain assessment',             meta: 'matched 2-b',   time: '32m' },
        { tag: '🟡', title: 'P-1838 · refill request · annual',                   meta: 'matched 1-a',   time: '1h'  },
        { tag: '🟠', title: 'P-1837 · skin lesion · photo attached',              meta: 'matched 3-c',   time: '1h'  },
      ],
      Routed: [
        { tag: 'Dr', title: 'P-1836 → Dr. Reyes · 09:30 today',                   meta: 'scheduled',     time: '1h'  },
        { tag: 'Dr', title: 'P-1835 → Dr. Park · async msg',                      meta: 'delivered',     time: '2h'  },
        { tag: 'RN', title: 'P-1834 → Nurse triage queue',                        meta: 'queued',        time: '3h'  },
      ],
      Resolved: [
        { tag: '✓', title: 'P-1832 · chest pain → on-call (cleared)',             meta: 'in care',       time: '5h'  },
        { tag: '✓', title: 'P-1831 · medication issue resolved',                  meta: 'closed',        time: '6h'  },
        { tag: '✓', title: 'P-1830 · annual refill approved',                     meta: 'closed',        time: '8h'  },
      ],
    },
  },
  'analytics-manager': {
    title: 'Report pipeline', itemLabel: 'reports',
    stages: ['Queued', 'Analyzing', 'Drafted', 'Delivered'],
    items: {
      Queued: [
        { tag: 'WK',  title: 'Weekly pipeline velocity · W23',                      meta: 'auto · Mon 06:00', time: 'Mon' },
        { tag: 'ADH', title: 'ICP conversion deep-dive · ad-hoc',                  meta: 'operator request', time: ''   },
      ],
      Analyzing: [
        { tag: 'RT',  title: 'Real-time anomaly · intake volume 2.4σ',             meta: 'investigating', time: '8m'  },
        { tag: 'WK',  title: 'CS digest · NPS movement',                           meta: 'compiling',     time: '1h'  },
      ],
      Drafted: [
        { tag: 'WK',  title: 'Pipeline velocity · W22 (final draft)',               meta: 'review',        time: '20m' },
      ],
      Delivered: [
        { tag: '✓',  title: 'Pipeline velocity · W22 · #leadership',               meta: '12 readers',    time: '14m' },
        { tag: '✓',  title: 'Forecast calibration · weekly self-check',            meta: 'auto-archived', time: '2h'  },
        { tag: '✓',  title: 'Daily ops digest · May 15',                           meta: 'auto-archived', time: 'yest.' },
      ],
    },
  },
  research: {
    title: 'Brief pipeline', itemLabel: 'briefs',
    stages: ['Sourcing', 'Synthesizing', 'Drafted', 'Published'],
    items: {
      Sourcing: [
        { tag: '📰', title: 'Q3 macro brief · pulling 22 sources',                  meta: 'auto',          time: '30m' },
        { tag: '📰', title: 'AI workforce category · investor reports',             meta: 'auto',          time: '2h'  },
      ],
      Synthesizing: [
        { tag: '🧠', title: 'Acme + Northwind + Coil pricing convergence',         meta: 'cross-checking', time: '12m' },
        { tag: '🧠', title: 'Customer interview themes · 14 transcripts',          meta: 'tagging',       time: '1h'  },
      ],
      Drafted: [
        { tag: '📄', title: 'Competitor pricing landscape · H1 shifts',            meta: 'ready for review', time: '23m' },
        { tag: '📄', title: 'Q3 strategic memo · scenarios A/B/C',                meta: 'internal draft', time: '1d'  },
      ],
      Published: [
        { tag: '✓', title: 'Q2 retrospective brief · #leadership',                meta: '4 referrals',   time: '1w'  },
        { tag: '✓', title: 'Pricing experiment recap · April',                    meta: '8 readers',     time: '2w'  },
      ],
    },
  },
  outreach: {
    title: 'Sequence pipeline', itemLabel: 'contacts',
    stages: ['Queued', 'Active', 'Replied', 'Closed'],
    items: {
      Queued: [
        { tag: 'EM',  title: 'Series B SaaS batch · 84 contacts',                  meta: 'starts Mon 07:00', time: ''   },
        { tag: 'LI',  title: 'Conference attendees · 38 contacts',                 meta: 'review first',  time: '2h'  },
      ],
      Active: [
        { tag: 'EM',  title: 'Maya Chen · step 2 · opened',                        meta: 'follow up',     time: '4m'  },
        { tag: 'EM',  title: 'Aiden Park · step 1 · delivered',                    meta: 'no open yet',   time: '1h'  },
        { tag: 'LI',  title: 'Lena Whitford · connection accepted',                meta: 'send note',     time: '2h'  },
        { tag: 'EM',  title: 'David Osei · step 3 · clicked',                     meta: 'high intent',   time: '3h'  },
      ],
      Replied: [
        { tag: 'EM',  title: 'Maya Chen · "interested in a demo"',                 meta: '→ routed',      time: '12m' },
        { tag: 'LI',  title: 'Chris Dahl · "not right now"',                      meta: 'snoozed 90d',   time: '1d'  },
      ],
      Closed: [
        { tag: '✓',  title: 'Northwind batch · 24 contacts resolved',             meta: '3 demos booked', time: '1w'  },
        { tag: '✕',  title: 'Stale list · 18 bounced',                            meta: 'removed',       time: '2w'  },
      ],
    },
  },
}

export function PipelineTab({ agent }: { agent: AgentConfig }) {
  const pipeline = PIPELINES[agent.slug]

  if (!pipeline) {
    return (
      <div className="hub-body fade-in">
        <div className="tab-empty">No pipeline data for {agent.name}.</div>
      </div>
    )
  }

  const stageCounts = pipeline.stages.map(s => pipeline.items[s]?.length ?? 0)
  const total = stageCounts.reduce((a, b) => a + b, 0)

  return (
    <div className="hub-body fade-in">
      <div className="pipe-board-summary">
        <div>
          <div className="pipe-summary-stat">
            <div className="lbl">{pipeline.title}</div>
            <div className="val">{total} {pipeline.itemLabel}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 28 }}>
          {pipeline.stages.map((s, i) => (
            <div className="pipe-summary-stat" key={s}>
              <div className="lbl">{s}</div>
              <div className="val">{stageCounts[i]}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn">Filter</button>
          <button className="btn primary">Add to pipeline</button>
        </div>
      </div>

      <div className="pipe-board">
        {pipeline.stages.map(stage => (
          <div className="pipe-col" key={stage}>
            <div className="pipe-col-head">
              <div className="pipe-col-title">{stage}</div>
              <div className="pipe-col-count">{pipeline.items[stage]?.length ?? 0}</div>
            </div>
            {(pipeline.items[stage] ?? []).map((item, i) => (
              <div className="pipe-card" key={i}>
                <div className="pipe-card-meta">
                  <span className="pipe-tag">{item.tag}</span>
                  {item.time && <span>{item.time}</span>}
                </div>
                <div className="pipe-card-title">{item.title}</div>
                <div className="pipe-card-foot">
                  <span>{item.meta}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
