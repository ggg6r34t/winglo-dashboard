'use client'

import { cn } from '@/lib/utils'

interface ErrorCardProps {
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorCard({
  message = 'Something went wrong.',
  onRetry,
  className,
}: ErrorCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-[var(--destructive)]/20 bg-[var(--destructive)]/5 p-4',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-4 h-4 mt-0.5 text-[var(--destructive)]">
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-.75 3.75a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0v-3.5zm.75 7a.875.875 0 1 1 0-1.75.875.875 0 0 1 0 1.75z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[var(--text-primary)]">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-xs text-[var(--accent)] hover:underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
