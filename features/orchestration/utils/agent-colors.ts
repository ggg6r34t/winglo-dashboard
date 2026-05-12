import type { AgentType } from '@/types'
import type { AgentNodeState } from '../types'

export const STATE_RING: Record<AgentNodeState, string> = {
  idle: 'border-[var(--border-color)]',
  queued: 'border-amber-400',
  executing: 'border-[var(--accent)]',
  completed: 'border-green-500',
  failed: 'border-[var(--destructive)]',
}

export const STATE_TEXT: Record<AgentNodeState, string> = {
  idle: 'text-[var(--text-muted)]',
  queued: 'text-amber-400',
  executing: 'text-[var(--accent)]',
  completed: 'text-green-500',
  failed: 'text-[var(--destructive)]',
}

export const STATE_BG: Record<AgentNodeState, string> = {
  idle: 'bg-[var(--surface)]',
  queued: 'bg-amber-400/5',
  executing: 'bg-[var(--accent)]/5',
  completed: 'bg-green-500/5',
  failed: 'bg-[var(--destructive)]/5',
}

export const AGENT_LABEL: Record<AgentType, string> = {
  intake: 'Intake',
  discovery: 'Discovery',
  research: 'Research',
  scoring: 'Scoring',
  outreach: 'Outreach',
  memory: 'Memory',
  analytics: 'Analytics',
}

export const AGENT_TYPE_COLOR: Record<AgentType, string> = {
  intake: 'text-violet-400',
  discovery: 'text-blue-400',
  research: 'text-cyan-400',
  scoring: 'text-teal-400',
  outreach: 'text-emerald-400',
  memory: 'text-amber-400',
  analytics: 'text-orange-400',
}

export const AGENT_AVATAR_BG: Record<AgentType, string> = {
  intake: 'bg-violet-400/10',
  discovery: 'bg-blue-400/10',
  research: 'bg-cyan-400/10',
  scoring: 'bg-teal-400/10',
  outreach: 'bg-emerald-400/10',
  memory: 'bg-amber-400/10',
  analytics: 'bg-orange-400/10',
}

export const STATE_DOT: Record<AgentNodeState, string> = {
  idle: 'bg-[var(--text-muted)]',
  queued: 'bg-amber-400',
  executing: 'bg-[var(--accent)]',
  completed: 'bg-green-500',
  failed: 'bg-[var(--destructive)]',
}
