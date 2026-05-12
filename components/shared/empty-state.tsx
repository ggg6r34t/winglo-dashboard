import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-8 text-center',
        'rounded-lg border border-dashed border-[var(--border-strong)]',
        className
      )}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--surface-raised)] text-[var(--text-muted)] mb-4">
        {icon}
      </div>
      <h3 className="text-sm font-medium text-[var(--text-primary)] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--text-muted)] max-w-xs mb-4">{description}</p>
      )}
      {action}
    </div>
  )
}
