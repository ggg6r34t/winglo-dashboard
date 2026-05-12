'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { AgentFlowNode, AgentNodeState } from '../types'
import {
  STATE_RING, STATE_TEXT, STATE_BG, AGENT_TYPE_COLOR, AGENT_AVATAR_BG, STATE_DOT,
} from '../utils/agent-colors'
import {
  AGENT_ROLE, AGENT_DEPARTMENT, AGENT_STANDBY_TEXT, AGENT_AVATARS,
} from '../utils/agent-identity'

const STATE_LABEL: Record<AgentNodeState, string> = {
  idle:      'On Standby',
  queued:    'Queued',
  executing: 'Working',
  completed: 'Completed',
  failed:    'Failed',
}

const STATE_FALLBACK_TEXT: Record<AgentNodeState, string> = {
  idle:      '',
  queued:    'Queued for processing',
  executing: 'Processing...',
  completed: 'Task completed',
  failed:    'An error was encountered',
}

function formatDuration(ms: number | null): string | null {
  if (ms == null) return null
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`
}

function ThinkingDots() {
  return (
    <span className="flex items-center gap-0.5 shrink-0 mt-0.5">
      {([0, 0.3, 0.6] as number[]).map((delay, i) => (
        <motion.span
          key={i}
          className="w-1 h-1 rounded-full bg-[var(--accent)] inline-block"
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 1.2, repeat: Infinity, delay }}
        />
      ))}
    </span>
  )
}

export const AgentNode = memo(function AgentNode({ data, selected }: NodeProps<AgentFlowNode>) {
  const Avatar = AGENT_AVATARS[data.agentType]
  const isExecuting = data.state === 'executing'

  const activityText = data.lastLogMessage
    || (data.state === 'idle'
      ? AGENT_STANDBY_TEXT[data.agentType]
      : STATE_FALLBACK_TEXT[data.state])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'relative w-[220px] rounded-xl border-2 cursor-pointer select-none',
        'bg-[var(--surface)] transition-shadow duration-200',
        STATE_RING[data.state],
        STATE_BG[data.state],
        data.state === 'idle' && 'opacity-70',
        selected && 'shadow-[0_0_0_2px_var(--accent)]'
      )}
    >
      {/* Executing presence ring */}
      {isExecuting && (
        <motion.div
          className="absolute inset-0 rounded-xl border-2 border-[var(--accent)] pointer-events-none"
          animate={{ opacity: [0.35, 0, 0.35], scale: [1, 1.05, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <Handle
        type="target"
        position={Position.Left}
        className="!border-[var(--border-color)] !bg-[var(--surface-raised)]"
      />

      {/* Identity header */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        <div className={cn(
          'shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
          AGENT_AVATAR_BG[data.agentType]
        )}>
          <Avatar className={AGENT_TYPE_COLOR[data.agentType]} size={22} />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className={cn('text-xs font-semibold leading-tight', AGENT_TYPE_COLOR[data.agentType])}>
            {AGENT_ROLE[data.agentType]}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] leading-tight">
            {AGENT_DEPARTMENT[data.agentType]}
          </span>
        </div>
      </div>

      <div className="h-px bg-[var(--border-color)] mx-4" />

      {/* Current activity */}
      <div className="px-4 pt-2.5 pb-3">
        <div className="flex items-start gap-1.5 min-h-[2.25rem]">
          {isExecuting && <ThinkingDots />}
          <p className={cn(
            'text-[10px] leading-relaxed line-clamp-2',
            isExecuting ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'
          )}>
            {activityText}
          </p>
        </div>
      </div>

      {/* Status footer */}
      <div className="flex items-center justify-between px-4 py-2 rounded-b-xl border-t border-[var(--border-color)] bg-[var(--surface-raised)]">
        <span className={cn('flex items-center gap-1.5 text-[10px] font-medium', STATE_TEXT[data.state])}>
          <span className={cn(
            'w-1.5 h-1.5 rounded-full',
            STATE_DOT[data.state],
            isExecuting && 'animate-pulse'
          )} />
          {STATE_LABEL[data.state]}
        </span>
        {data.lastRunDurationMs != null && (
          <span className="text-[9px] text-[var(--text-muted)] tabular-nums">
            {formatDuration(data.lastRunDurationMs)}
          </span>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!border-[var(--border-color)] !bg-[var(--surface-raised)]"
      />
    </motion.div>
  )
})
