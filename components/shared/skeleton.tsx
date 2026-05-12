import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-[var(--surface-raised)]',
        className
      )}
    />
  )
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-[var(--border-color)] bg-[var(--surface)] p-4 space-y-3',
        className
      )}
    >
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>
  )
}

export function SkeletonRow({ className }: SkeletonProps) {
  return (
    <div className={cn('flex items-center gap-3 py-3', className)}>
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  )
}
