'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { BusinessProfile } from '@/types'
import { runDiscovery } from '../server/actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface AnalysisDisplayProps {
  profile: BusinessProfile
}

export function AnalysisDisplay({ profile }: AnalysisDisplayProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleRunDiscovery() {
    startTransition(async () => {
      await runDiscovery(profile.id)
      router.push('/opportunities')
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">{profile.name}</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Analysis complete</p>
        </div>
        <Button
          onClick={handleRunDiscovery}
          disabled={isPending}
          className="shrink-0 bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <svg aria-hidden="true" className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Discovering...
            </span>
          ) : (
            'Discover Opportunities'
          )}
        </Button>
      </div>

      {profile.icp && (
        <section className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
            Ideal Customer Profile
          </h3>
          <dl className="space-y-3 text-sm">
            {profile.icp.company_size && (
              <div className="flex gap-2">
                <dt className="text-[var(--text-muted)] w-28 shrink-0">Company size</dt>
                <dd className="text-[var(--text-primary)]">{profile.icp.company_size}</dd>
              </div>
            )}
            {profile.icp.industry && (
              <div className="flex gap-2">
                <dt className="text-[var(--text-muted)] w-28 shrink-0">Industry</dt>
                <dd className="text-[var(--text-primary)]">{profile.icp.industry}</dd>
              </div>
            )}
            {profile.icp.role && (
              <div className="flex gap-2">
                <dt className="text-[var(--text-muted)] w-28 shrink-0">Buyer role</dt>
                <dd className="text-[var(--text-primary)]">{profile.icp.role}</dd>
              </div>
            )}
            {profile.icp.budget_range && (
              <div className="flex gap-2">
                <dt className="text-[var(--text-muted)] w-28 shrink-0">Budget range</dt>
                <dd className="text-[var(--text-primary)]">{profile.icp.budget_range}</dd>
              </div>
            )}
            {profile.icp.pain_points && profile.icp.pain_points.length > 0 && (
              <div>
                <dt className="text-[var(--text-muted)] mb-2">Pain points</dt>
                <dd>
                  <ul className="space-y-1">
                    {profile.icp.pain_points.map((p, i) => (
                      <li key={i} className="flex gap-2 text-[var(--text-primary)]">
                        <span className="text-[var(--text-muted)] shrink-0">·</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {profile.positioning && (
        <section className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Positioning</h3>
          <div className="space-y-4 text-sm">
            {profile.positioning.value_proposition && (
              <div>
                <div className="text-[var(--text-muted)] mb-1">Value proposition</div>
                <p className="text-[var(--text-primary)]">{profile.positioning.value_proposition}</p>
              </div>
            )}
            {profile.positioning.differentiators && profile.positioning.differentiators.length > 0 && (
              <div>
                <div className="text-[var(--text-muted)] mb-2">Differentiators</div>
                <ul className="space-y-1">
                  {profile.positioning.differentiators.map((d, i) => (
                    <li key={i} className="flex gap-2 text-[var(--text-primary)]">
                      <span className="text-[var(--text-muted)] shrink-0">·</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {profile.positioning.competitors && profile.positioning.competitors.length > 0 && (
              <div>
                <div className="text-[var(--text-muted)] mb-2">Competitors</div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.positioning.competitors.map((c, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="text-xs border-[var(--border-color)] text-[var(--text-secondary)]"
                    >
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {profile.growth_brief && (
        <section className="rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">Growth Brief</h3>
          <div className="space-y-4 text-sm">
            {profile.growth_brief.summary && (
              <p className="text-[var(--text-primary)]">{profile.growth_brief.summary}</p>
            )}
            {profile.growth_brief.partnership_categories &&
              profile.growth_brief.partnership_categories.length > 0 && (
                <div>
                  <div className="text-[var(--text-muted)] mb-2">Partnership categories</div>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.growth_brief.partnership_categories.map((c, i) => (
                      <Badge
                        key={i}
                        className="text-xs bg-[var(--accent-subtle)] text-[var(--accent)] border-0 hover:bg-[var(--accent-subtle)]"
                      >
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            {profile.growth_brief.recommended_channels &&
              profile.growth_brief.recommended_channels.length > 0 && (
                <div>
                  <div className="text-[var(--text-muted)] mb-2">Recommended channels</div>
                  <ul className="space-y-1">
                    {profile.growth_brief.recommended_channels.map((c, i) => (
                      <li key={i} className="flex gap-2 text-[var(--text-primary)]">
                        <span className="text-[var(--text-muted)] shrink-0">·</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </section>
      )}
    </div>
  )
}
