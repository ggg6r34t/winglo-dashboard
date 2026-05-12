'use client'

import { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AgentType, AIRun } from '@/types'
import { useOrchestrationStore } from '../hooks/use-orchestration-store'
import {
  AGENT_TYPE_COLOR, AGENT_AVATAR_BG, STATE_TEXT, STATE_DOT,
} from '../utils/agent-colors'
import {
  AGENT_ROLE, AGENT_DEPARTMENT, AGENT_STANDBY_TEXT, AGENT_AVATARS,
} from '../utils/agent-identity'
import type { AgentNodeState } from '../types'

const STATE_LABEL: Record<AgentNodeState, string> = {
  idle:      'On Standby',
  queued:    'Queued',
  executing: 'Working',
  completed: 'Completed',
  failed:    'Failed',
}

const TREND_ARROW: Record<string, string> = {
  up:      '↑',
  down:    '↓',
  neutral: '→',
}

function relativeTime(iso: string | null): string {
  if (!iso) return '—'
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  return `${Math.floor(min / 60)}h ago`
}

function formatDuration(ms: number | null): string {
  if (ms == null) return '—'
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`
}

function safe<T>(fn: () => T): T | null {
  try { return fn() } catch { return null }
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--surface-raised)] rounded px-2 py-1.5 flex flex-col gap-0.5">
      <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wide">{label}</span>
      <span className="text-xs font-semibold text-[var(--text-primary)] tabular-nums">{value}</span>
    </div>
  )
}

function OutputLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 py-0.5 border-b border-[var(--border-color)]/50 last:border-0">
      <span className="text-[10px] text-[var(--text-muted)] shrink-0">{label}</span>
      <span className="text-[10px] text-[var(--text-secondary)] text-right leading-snug">{value}</span>
    </div>
  )
}

function OutputPreview({ agentType, run }: { agentType: AgentType; run: AIRun }) {
  const o = run.output as Record<string, unknown> | null
  const input = run.input as Record<string, unknown> | null

  if (!o) return <p className="text-[10px] text-[var(--text-muted)]">No output recorded.</p>

  if (agentType === 'intake') {
    const icp = safe(() => o.icp as Record<string, unknown>)
    const brief = safe(() => o.growth_brief as Record<string, unknown>)
    const cats = safe(() => (brief!.partnership_categories as string[]).length) ?? 0
    return (
      <div>
        {icp?.industry != null && <OutputLine label="Industry" value={String(icp.industry)} />}
        {icp?.company_size != null && <OutputLine label="Company size" value={String(icp.company_size)} />}
        {icp?.role != null && <OutputLine label="Target role" value={String(icp.role)} />}
        {cats > 0 && <OutputLine label="Partnership categories" value={`${cats} identified`} />}
      </div>
    )
  }

  if (agentType === 'discovery') {
    const opps = safe(() => o.opportunities as Array<Record<string, unknown>>) ?? []
    return (
      <div>
        <OutputLine label="Opportunities found" value={String(opps.length)} />
        {opps.slice(0, 3).map((opp, i) => (
          <OutputLine
            key={i}
            label={String(opp.opportunity_type ?? 'partner')}
            value={String(opp.company_name)}
          />
        ))}
        {opps.length > 3 && (
          <p className="text-[10px] text-[var(--text-muted)] pt-1">+{opps.length - 3} more</p>
        )}
      </div>
    )
  }

  if (agentType === 'research') {
    const count = safe(() => Number(o.researched_count)) ?? 0
    return <OutputLine label="Companies enriched" value={String(count)} />
  }

  if (agentType === 'scoring') {
    const scores = safe(() => o.scores as Array<{ company_name: string; score: number }>) ?? []
    const avg = scores.length > 0
      ? Math.round(scores.reduce((s, x) => s + x.score, 0) / scores.length)
      : null
    const top = scores.length > 0
      ? scores.reduce((best, x) => x.score > best.score ? x : best)
      : null
    return (
      <div>
        {avg != null && <OutputLine label="Average score" value={`${avg}/100`} />}
        {top && <OutputLine label="Top opportunity" value={`${top.company_name} (${top.score})`} />}
        <OutputLine label="Leads qualified" value={String(scores.length)} />
      </div>
    )
  }

  if (agentType === 'outreach') {
    const subject = safe(() => String(o.subject)) ?? null
    const channel = safe(() => String(input?.channel)) ?? null
    const tone    = safe(() => String(input?.tone))    ?? null
    return (
      <div>
        {channel && <OutputLine label="Channel" value={channel} />}
        {tone    && <OutputLine label="Tone"    value={tone}    />}
        {subject && <OutputLine label="Subject" value={subject} />}
      </div>
    )
  }

  if (agentType === 'analytics') {
    const hm = safe(() => o.highlight_metric as { label: string; value: string; trend: string })
    const insights = safe(() => o.insights as string[]) ?? []
    return (
      <div>
        {hm && (
          <OutputLine
            label={hm.label}
            value={`${hm.value} ${TREND_ARROW[hm.trend] ?? ''}`}
          />
        )}
        {insights[0] && (
          <p className="text-[10px] text-[var(--text-muted)] pt-1.5 leading-relaxed">{insights[0]}</p>
        )}
      </div>
    )
  }

  return null
}

function deriveState(run: AIRun | null): AgentNodeState {
  if (!run) return 'idle'
  switch (run.status) {
    case 'queued':   return 'queued'
    case 'running':  return 'executing'
    case 'complete': return 'completed'
    case 'failed':   return 'failed'
    default:         return 'idle'
  }
}

interface Props {
  agentType: AgentType
  onClose: () => void
}

export const AgentDetailPanel = memo(function AgentDetailPanel({ agentType, onClose }: Props) {
  const recentRuns  = useOrchestrationStore(s => s.recentRuns)
  const feedEvents  = useOrchestrationStore(s => s.feedEvents)

  const latestRun = useMemo(
    () => recentRuns.find(r => r.agent_type === agentType) ?? null,
    [recentRuns, agentType]
  )

  const agentLogs = useMemo(
    () => feedEvents.filter(e => e.agentType === agentType).slice(0, 8),
    [feedEvents, agentType]
  )

  const state   = deriveState(latestRun)
  const Avatar  = AGENT_AVATARS[agentType]
  const isActive = state === 'executing'

  return (
    <div className="flex flex-col h-full bg-[var(--surface)] overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3 border-b border-[var(--border-color)] shrink-0">
        <div className={cn(
          'shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
          AGENT_AVATAR_BG[agentType]
        )}>
          <Avatar className={AGENT_TYPE_COLOR[agentType]} size={22} />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <span className={cn('text-xs font-semibold leading-tight', AGENT_TYPE_COLOR[agentType])}>
            {AGENT_ROLE[agentType]}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] leading-tight">
            {AGENT_DEPARTMENT[agentType]}
          </span>
          <span className={cn('flex items-center gap-1 text-[10px] font-medium mt-0.5', STATE_TEXT[state])}>
            <span className={cn(
              'w-1.5 h-1.5 rounded-full',
              STATE_DOT[state],
              isActive && 'animate-pulse'
            )} />
            {STATE_LABEL[state]}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close panel"
          className="shrink-0 p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] transition-colors"
        >
          <X size={13} />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">

        {/* Standby / current activity */}
        <section>
          <p className="text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
            Activity
          </p>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {agentLogs[0]?.message ?? AGENT_STANDBY_TEXT[agentType]}
          </p>
        </section>

        {/* Error */}
        {state === 'failed' && latestRun?.error && (
          <section>
            <p className="text-[9px] font-semibold text-[var(--destructive)] uppercase tracking-wide mb-1.5">
              Error
            </p>
            <p className="text-[10px] text-[var(--destructive)] bg-[var(--destructive)]/5 border border-[var(--destructive)]/20 rounded px-2.5 py-2 leading-relaxed font-mono break-words">
              {latestRun.error}
            </p>
          </section>
        )}

        {/* Run metrics */}
        {latestRun && (
          <section>
            <p className="text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
              Last Run
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <MetricRow label="Duration" value={formatDuration(latestRun.duration_ms)} />
              <MetricRow label="Tokens"   value={latestRun.tokens_used?.toLocaleString() ?? '—'} />
              <MetricRow label="Finished" value={relativeTime(latestRun.completed_at)}  />
            </div>
          </section>
        )}

        {/* Agent-specific output */}
        {latestRun?.output && (
          <section>
            <p className="text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
              Output
            </p>
            <OutputPreview agentType={agentType} run={latestRun} />
          </section>
        )}

        {/* Live log tail */}
        {agentLogs.length > 0 && (
          <section>
            <p className="text-[9px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
              Log
            </p>
            <div className="flex flex-col gap-1.5">
              {agentLogs.map(event => (
                <div key={event.id} className="flex items-start gap-2">
                  <span className="text-[9px] text-[var(--text-muted)] tabular-nums shrink-0 pt-px">
                    {new Date(event.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit', minute: '2-digit', hour12: false,
                    })}
                  </span>
                  <span className={cn('text-[10px] leading-relaxed', {
                    'text-[var(--text-muted)]':    event.level === 'info',
                    'text-amber-400':               event.level === 'warning',
                    'text-[var(--destructive)]':    event.level === 'error',
                  })}>
                    {event.message}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
})
