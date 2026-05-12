import { SkeletonCard, Skeleton } from '@/components/shared/skeleton'

export function OpportunitiesSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
