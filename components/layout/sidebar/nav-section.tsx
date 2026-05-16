import { cn } from '@/lib/utils'

interface NavSectionProps {
  label: string
  collapsed: boolean
  children: React.ReactNode
  className?: string
  trailing?: React.ReactNode
}

export function NavSection({ label, collapsed, children, className, trailing }: NavSectionProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      {!collapsed && (
        <div className="flex items-center justify-between px-4 py-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
            {label}
          </span>
          {trailing}
        </div>
      )}
      <div className="flex flex-col gap-0.5 px-2">
        {children}
      </div>
    </div>
  )
}
