import { SkeletonCard, SkeletonRow } from '@/components/shared/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Top metrics row */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} className="h-24" />
        ))}
      </div>
      {/* Two column layout */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-3">
          <SkeletonCard className="h-8 w-40" />
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
        <div className="space-y-3">
          <SkeletonCard className="h-8 w-32" />
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
