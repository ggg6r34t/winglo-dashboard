'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { BusinessProfile } from '@/types'
import { runDiscovery } from '../server/actions'

interface AnalysisDisplayProps {
  profile: BusinessProfile
}

const sectionStyle: React.CSSProperties = {
  background: 'var(--bg-2)',
  border: '1px solid var(--line-2)',
  borderRadius: 'var(--r-md)',
  padding: '16px 18px',
  marginBottom: 12,
}

const rowLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 10.5,
  color: 'var(--fg-3)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  width: 110,
  flexShrink: 0,
}

export function AnalysisDisplay({ profile }: AnalysisDisplayProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleRunDiscovery() {
    startTransition(async () => {
      await runDiscovery(profile.id)
      router.push('/agents/growth/opportunities')
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-0)', letterSpacing: '-0.01em' }}>{profile.name}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', marginTop: 2 }}>Analysis complete</div>
        </div>
        <button
          onClick={handleRunDiscovery}
          disabled={isPending}
          className="btn primary"
          style={{ flexShrink: 0, opacity: isPending ? 0.6 : 1 }}
        >
          {isPending ? (
            <>
              <svg aria-hidden="true" style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Discovering...
            </>
          ) : (
            'Discover Opportunities'
          )}
        </button>
      </div>

      {profile.icp && (
        <div style={sectionStyle}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Ideal Customer Profile
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {profile.icp.company_size && (
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={rowLabelStyle}>Company size</span>
                <span style={{ fontSize: 13, color: 'var(--fg-1)' }}>{profile.icp.company_size}</span>
              </div>
            )}
            {profile.icp.industry && (
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={rowLabelStyle}>Industry</span>
                <span style={{ fontSize: 13, color: 'var(--fg-1)' }}>{profile.icp.industry}</span>
              </div>
            )}
            {profile.icp.role && (
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={rowLabelStyle}>Buyer role</span>
                <span style={{ fontSize: 13, color: 'var(--fg-1)' }}>{profile.icp.role}</span>
              </div>
            )}
            {profile.icp.budget_range && (
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={rowLabelStyle}>Budget range</span>
                <span style={{ fontSize: 13, color: 'var(--fg-1)' }}>{profile.icp.budget_range}</span>
              </div>
            )}
            {profile.icp.pain_points && profile.icp.pain_points.length > 0 && (
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={rowLabelStyle}>Pain points</span>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {profile.icp.pain_points.map((p, i) => (
                    <li key={i} style={{ fontSize: 13, color: 'var(--fg-1)', display: 'flex', gap: 6 }}>
                      <span style={{ color: 'var(--fg-3)' }}>·</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {profile.positioning && (
        <div style={sectionStyle}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Positioning
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {profile.positioning.value_proposition && (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Value proposition</div>
                <p style={{ fontSize: 13, color: 'var(--fg-1)', margin: 0, lineHeight: 1.5 }}>{profile.positioning.value_proposition}</p>
              </div>
            )}
            {profile.positioning.differentiators && profile.positioning.differentiators.length > 0 && (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Differentiators</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {profile.positioning.differentiators.map((d, i) => (
                    <li key={i} style={{ fontSize: 13, color: 'var(--fg-1)', display: 'flex', gap: 6 }}>
                      <span style={{ color: 'var(--fg-3)' }}>·</span>{d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {profile.positioning.competitors && profile.positioning.competitors.length > 0 && (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Competitors</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {profile.positioning.competitors.map((c, i) => (
                    <span key={i} className="chip">{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {profile.growth_brief && (
        <div style={sectionStyle}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            Growth Brief
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {profile.growth_brief.summary && (
              <p style={{ fontSize: 13, color: 'var(--fg-1)', margin: 0, lineHeight: 1.5 }}>{profile.growth_brief.summary}</p>
            )}
            {profile.growth_brief.partnership_categories && profile.growth_brief.partnership_categories.length > 0 && (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Partnership categories</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {profile.growth_brief.partnership_categories.map((c, i) => (
                    <span key={i} className="chip active">{c}</span>
                  ))}
                </div>
              </div>
            )}
            {profile.growth_brief.recommended_channels && profile.growth_brief.recommended_channels.length > 0 && (
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Recommended channels</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {profile.growth_brief.recommended_channels.map((c, i) => (
                    <li key={i} style={{ fontSize: 13, color: 'var(--fg-1)', display: 'flex', gap: 6 }}>
                      <span style={{ color: 'var(--fg-3)' }}>·</span>{c}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
