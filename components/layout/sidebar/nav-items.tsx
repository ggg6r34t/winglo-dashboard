'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5zm10 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5zM4 15a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4zm10 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4z" />
      </svg>
    ),
  },
  {
    label: 'Intake',
    href: '/intake',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
  {
    label: 'Opportunities',
    href: '/opportunities',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-6a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      </svg>
    ),
  },
  {
    label: 'Outreach',
    href: '/outreach',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
      </svg>
    ),
  },
  {
    label: 'Memory',
    href: '/memory',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12H3m2 0a9 9 0 1 0 18 0M5 12a9 9 0 0 1 18 0m-9 0v9m0-9V3" />
      </svg>
    ),
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z" />
      </svg>
    ),
  },
  {
    label: 'Orchestration',
    href: '/orchestration',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
      </svg>
    ),
  },
]

interface NavItemsProps {
  collapsed: boolean
}

export function NavItems({ collapsed }: NavItemsProps) {
  const pathname = usePathname()

  return (
    <TooltipProvider delayDuration={0}>
      <nav className="flex flex-col gap-0.5 px-2">
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          const linkContent = (
            <Link
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors relative group',
                isActive
                  ? 'text-[var(--text-primary)] bg-[var(--surface-raised)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-raised)]'
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[var(--accent)] rounded-r-full" />
              )}
              <span className={cn('shrink-0', isActive && 'text-[var(--accent)]')}>
                {item.icon}
              </span>
              {!collapsed && <span className="truncate font-medium">{item.label}</span>}
            </Link>
          )

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" className="bg-[var(--surface-raised)] border-[var(--border-color)] text-xs">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            )
          }

          return <div key={item.href}>{linkContent}</div>
        })}
      </nav>
    </TooltipProvider>
  )
}
