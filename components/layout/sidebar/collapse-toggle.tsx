'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface CollapseToggleProps {
  collapsed: boolean
  onToggle: () => void
}

export function CollapseToggle({ collapsed, onToggle }: CollapseToggleProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onToggle}
            className="flex items-center justify-center w-7 h-7 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)] transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-[var(--surface-raised)] border-[var(--border-color)] text-xs">
          {collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
