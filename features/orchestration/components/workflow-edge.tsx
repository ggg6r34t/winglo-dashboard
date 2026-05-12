'use client'

import { memo } from 'react'
import { getBezierPath, type EdgeProps } from '@xyflow/react'
import { motion } from 'framer-motion'
import type { WorkflowFlowEdge } from '../types'

export const WorkflowEdge = memo(function WorkflowEdge({
  id,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  data,
}: EdgeProps<WorkflowFlowEdge>) {
  const [edgePath] = getBezierPath({ sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition })
  const active = data?.active ?? false

  return (
    <>
      {/* Ghost track — always visible faint rail */}
      <path
        d={edgePath}
        fill="none"
        stroke="var(--border-color)"
        strokeWidth={1}
        strokeDasharray="3 6"
        opacity={0.5}
      />

      {/* Active communication trail — flowing dashes */}
      {active && (
        <motion.path
          d={edgePath}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeDasharray="8 18"
          animate={{ strokeDashoffset: [0, -26] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
          opacity={0.75}
        />
      )}

      {/* Active — solid base stroke underneath dashes */}
      {active && (
        <path
          d={edgePath}
          fill="none"
          stroke="var(--accent)"
          strokeWidth={1}
          opacity={0.2}
        />
      )}
    </>
  )
})
