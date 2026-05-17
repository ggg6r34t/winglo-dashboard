import type { AgentConfig } from '@/lib/agents/registry'

type MemRecord = { key: string; val: string; source: string; conf: number; time: string }

const MEMORY: Record<string, MemRecord[]> = {
  'social-media': [
    { key: 'brand.voice',              val: 'Avoid em-dashes in long-form social. Use periods for separation. Confirmed against last 30 published posts.',                          source: 'Style audit · 30 posts',          conf: 0.88, time: '1h'  },
    { key: 'hook.A.outperforms-B',     val: 'Question-led reel hooks outperform claim-led by 2.3× on saves. Apply to all new reel scaffolds.',                                     source: 'Experiment · 14d window',         conf: 0.92, time: '3h'  },
    { key: 'platform.IG.optimal-cadence', val: '3 reels + 1 carousel + 1 story per week peaks engagement without saturation. Stable across last 8 weeks.',                         source: 'Internal analytics',              conf: 0.86, time: '2d'  },
    { key: 'audience.savers',          val: 'Saves correlate 4× more strongly with paid conversion than likes. Optimize hooks for save behavior.',                                  source: 'Cross-ref with GA4',              conf: 0.91, time: '1w'  },
    { key: 'moratorium.tone',          val: 'No celebratory tone during active incident windows. Switch to maintenance voice until status page resolves.',                           source: 'Operator policy',                 conf: 1.0,  time: '2w'  },
  ],
  growth: [
    { key: 'customer.icp',             val: 'Refined ICP to exclude sub-15 headcount; matches conversion data from W18–W22.',                                                      source: 'Pipeline analysis · 412 deals',   conf: 0.94, time: '12m' },
    { key: 'partner.coil.relationship',val: 'Coil is now a paying customer (May 6) AND an active reseller (signed May 14). Treat as both.',                                         source: 'CRM merge + contract',            conf: 0.99, time: '2d'  },
    { key: 'enrichment.apollo.daily-quota', val: 'Apollo plan caps at 250 enrichments/day; batch outbound to fit window. Burst-mode reserved for operator-approved campaigns.',    source: 'Provider docs',                   conf: 1.0,  time: '1w'  },
    { key: 'channel.email.optimal-time', val: 'Outbound email reply rate peaks for sends 09:00–10:30 local recipient time. Use timezone-aware scheduling.',                        source: 'Internal experiment',             conf: 0.84, time: '2w'  },
  ],
  seo: [
    { key: 'docs.api.canonical-rule',  val: 'SDK page generator must emit unique canonicals per endpoint. Rule added to crawl regression.',                                        source: 'Postmortem · canonical incident May 15', conf: 0.99, time: '5h' },
    { key: 'internal-links.density',   val: 'Pages with 3–7 contextual internal links rank 1.4 positions higher on average than fewer/more. Use as guidance, not strict rule.',   source: 'Internal ranking study',          conf: 0.81, time: '3w'  },
    { key: 'schema.required-fields',   val: 'All product pages require Product + Organization + BreadcrumbList schema. Audit weekly.',                                             source: 'Postmortem · Q1 ranking drop',    conf: 0.97, time: '2mo' },
  ],
  marketing: [
    { key: 'launch.q3.embargo',        val: 'Q3 launch embargo: Thursday 09:00 PT. Press list approved by operator. No early reveals.',                                            source: 'Operator decision · AP-2241',     conf: 1.0,  time: '3h'  },
    { key: 'brand.color.usage',        val: 'Warm amber accent reserved for live/operational states only. Never use as primary CTA color.',                                        source: 'Design system v3',                conf: 1.0,  time: '1mo' },
    { key: 'channel.sequencing',       val: 'For major launches: blog goes first (anchor), then email at +30m, social at +60m, paid at +24h.',                                    source: 'Last 4 launches',                 conf: 0.88, time: '2mo' },
  ],
  sales: [
    { key: 'segment.smb.churn-signals', val: 'SMB accounts that miss week-1 onboarding milestone churn 3.2× more often. Trigger personalized outreach at day 5.',                source: 'Churn analysis · 184 SMB accounts', conf: 0.86, time: '1d' },
    { key: 'stage-4.stall.threshold',  val: 'Deals stalled in stage 4 for >21 days require operator review. Auto-flag with weekly digest.',                                        source: 'Pipeline analysis',               conf: 0.95, time: '1w'  },
    { key: 'trial.day-11.signal',      val: 'Trial accounts that cool by day 11 recover at 18% with personalized outreach vs 4% with default sequence.',                          source: 'Re-engagement experiment',        conf: 0.83, time: '2w'  },
  ],
  telehealth: [
    { key: 'triage.chest-pain.criteria', val: 'Updated escalation criteria 4-c. Now triggers when chest pain co-occurs with radiating arm pain OR shortness of breath.',          source: 'Operator-approved · AP-2237',     conf: 1.0,  time: '1d'  },
    { key: 'intake.volume.baseline',   val: 'Average overnight intake is 12 ± 4 cases. Spikes above 2σ should trigger on-call notification.',                                     source: 'Rolling 90d',                     conf: 0.92, time: '1w'  },
    { key: 'protocol.rx-refill',       val: '90-day refill cycles can be auto-approved for stable medications when last labs are <180 days old.',                                  source: 'Clinical guideline',              conf: 1.0,  time: '3mo' },
  ],
  'analytics-manager': [
    { key: 'forecast.accuracy.baseline', val: 'Rolling 8-week forecast accuracy baseline is 92.4% ± 2.1pts. Current week sits at 94.1% — within band.',                          source: 'Self-calibration · weekly',       conf: 0.92, time: '2d'  },
    { key: 'anomaly.σ-threshold',      val: 'Flag any metric movement >2σ from rolling baseline. Below 1.5σ is noise; between is borderline (log only).',                         source: 'Internal policy',                 conf: 0.95, time: '1mo' },
    { key: 'leadership.digest.cadence', val: '#leadership channel receives daily ops digest at 18:00 and weekly pipeline at Mon 06:00. Never duplicate.',                          source: 'Operator preference',             conf: 1.0,  time: '2mo' },
  ],
  research: [
    { key: 'competitor.acme.pricing',  val: 'Acme moved to usage-based pricing on May 9, 2026. Tiered: $0–$25k base + $0.04 per call beyond.',                                   source: 'Acme changelog + investor brief', conf: 0.97, time: '2h'  },
    { key: 'source.paywall.policy',    val: 'Paywalled sources may be cited but never quoted verbatim. Always paraphrase and link to public summary if available.',                source: 'Operator policy',                 conf: 1.0,  time: '1mo' },
    { key: 'synthesis.minimum-sources', val: 'No published brief with fewer than 5 independently sourced data points. Single-source claims must be marked as such.',              source: 'Editorial guideline',             conf: 1.0,  time: '3mo' },
  ],
  outreach: [
    { key: 'send-window.optimal',      val: 'Reply rates peak for sends 09:00–10:30 local recipient time. Timezone-aware scheduling required for all batches.',                   source: 'Internal experiment · 840 sends', conf: 0.87, time: '1w'  },
    { key: 'step.spacing.minimum',     val: 'Minimum 3 business days between sequence steps. Shorter spacing increases unsubscribe rate by 2.4×.',                                source: 'A/B test · 12w',                  conf: 0.91, time: '2w'  },
    { key: 'personalization.threshold', val: 'Emails with ≥2 personalization tokens (name + company insight) outperform generic by 3.1× on reply rate.',                         source: 'Sequence analysis · 200 deals',   conf: 0.88, time: '1mo' },
  ],
}

const KNOWLEDGE_TAGS = ['brand', 'policy', 'experiment', 'guideline', 'operator', 'pricing', 'audience', 'process']

function ConfBar({ conf }: { conf: number }) {
  return (
    <div className="confidence" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div className="conf-bar">
        <div className="conf-bar-fill" style={{ width: `${conf * 100}%` }} />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-2)' }}>
        {conf.toFixed(2)}
      </span>
    </div>
  )
}

export function MemoryTab({ agent }: { agent: AgentConfig }) {
  const records = MEMORY[agent.slug] ?? []
  const avgConf = records.length
    ? records.reduce((s, r) => s + r.conf, 0) / records.length
    : 0
  const highConf    = records.filter(r => r.conf >= 0.9).length
  const operatorSet = records.filter(r => r.source.toLowerCase().includes('operator')).length

  // Derive a short glyph mark from the agent slug for display
  const glyphMark = agent.slug.slice(0, 2).toUpperCase()

  return (
    <div className="hub-body fade-in">
      <div className="memory-tab-layout">
        <div>
          <div className="hub-section-head">
            <div className="section-title">
              {agent.name}&apos;s memory
              <span className="lbl">{records.length} records · last sync 12s ago</span>
            </div>
            <button className="btn">Add record</button>
          </div>

          {records.map((m, i) => (
            <div className="memory-record" key={i}>
              <div className="memory-record-head">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    className="agent-glyph"
                    style={{ background: 'var(--bg-3)', color: 'var(--fg-1)', borderColor: 'transparent', width: 20, height: 20, fontSize: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, flexShrink: 0 }}
                  >
                    {glyphMark}
                  </div>
                  <div>
                    <div className="memory-record-key">{glyphMark}/ {m.key}</div>
                    <div style={{ fontSize: 11, color: 'var(--fg-3)' }}>{m.source}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <ConfBar conf={m.conf} />
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)' }}>{m.time} ago</div>
                </div>
              </div>
              <div className="memory-record-body">{m.val}</div>
              <div className="memory-record-foot">
                <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 12 }}>
                  <span style={{ cursor: 'pointer', color: 'var(--fg-2)' }}>Edit</span>
                  <span style={{ cursor: 'pointer', color: 'var(--fg-2)' }}>Retract</span>
                </span>
              </div>
            </div>
          ))}

          {records.length === 0 && (
            <div className="tab-empty">No memory records for {agent.name}.</div>
          )}
        </div>

        <aside>
          <div className="memory-side-card" style={{ marginBottom: 14 }}>
            <div className="rp-section-title" style={{ margin: 0, marginBottom: 10 }}>
              <span>Stats</span>
            </div>
            <div className="memory-stat-row"><span className="key">Records</span><span className="val">{records.length}</span></div>
            <div className="memory-stat-row"><span className="key">Avg confidence</span><span className="val">{records.length ? avgConf.toFixed(2) : '—'}</span></div>
            <div className="memory-stat-row"><span className="key">High-conf (≥0.9)</span><span className="val">{highConf}</span></div>
            <div className="memory-stat-row"><span className="key">Operator-set</span><span className="val">{operatorSet}</span></div>
            <div className="memory-stat-row"><span className="key">Last write</span><span className="val">{records[0]?.time ?? '—'}</span></div>
          </div>

          <div className="memory-side-card" style={{ marginBottom: 14 }}>
            <div className="rp-section-title" style={{ margin: 0, marginBottom: 10 }}>
              <span>Knowledge tags</span>
            </div>
            <div className="knowledge-tags">
              {KNOWLEDGE_TAGS.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          </div>

          <div className="memory-side-card">
            <div className="rp-section-title" style={{ margin: 0, marginBottom: 10 }}>
              <span>Memory health</span>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--fg-2)', lineHeight: 1.55 }}>
              No staleness alerts. All records have fresh provenance. Last conflict resolved 3d ago.
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
