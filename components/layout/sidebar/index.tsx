'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Settings } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/lib/stores/sidebar-store'
import { NavItems } from './nav-items'
import { CollapseToggle } from './collapse-toggle'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function Sidebar() {
  const { collapsed, toggle } = useSidebarStore()
  const pathname = usePathname()
  const isSettingsActive = pathname === '/settings'

  const settingsLink = (
    <Link
      href="/settings"
      className={cn(
        'flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors',
        isSettingsActive
          ? 'text-[var(--text-primary)] bg-[var(--surface-raised)]'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)]'
      )}
    >
      <Settings className="w-4 h-4 shrink-0" />
      {!collapsed && <span className="font-medium">Settings</span>}
    </Link>
  )

  return (
    <motion.aside
      layout
      animate={{ width: collapsed ? 52 : 220 }}
      transition={{ duration: 0.15, ease: 'easeInOut' }}
      className="fixed left-0 top-[52px] bottom-0 z-40 flex flex-col bg-[var(--surface)] border-r border-[var(--border-color)] overflow-hidden"
    >
      {/* Main nav */}
      <div className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        <NavItems collapsed={collapsed} />
      </div>

      {/* Bottom: settings + toggle */}
      <div className="border-t border-[var(--border-color)] p-2 flex flex-col gap-1">
        <TooltipProvider delayDuration={0}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>{settingsLink}</TooltipTrigger>
              <TooltipContent side="right" className="bg-[var(--surface-raised)] border-[var(--border-color)] text-xs">
                Settings
              </TooltipContent>
            </Tooltip>
          ) : (
            settingsLink
          )}
        </TooltipProvider>
        <div className={cn('flex', collapsed ? 'justify-center' : 'justify-end')}>
          <CollapseToggle collapsed={collapsed} onToggle={toggle} />
        </div>
      </div>
    </motion.aside>
  )
}
