import { SkeletonCard, Skeleton } from '@/components/shared/skeleton'

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} className="h-28" />
        ))}
      </div>
      <SkeletonCard className="h-64" />
      <div className="grid grid-cols-2 gap-4">
        <SkeletonCard className="h-48" />
        <SkeletonCard className="h-48" />
      </div>
    </div>
  )
}
