import { SkeletonCard, Skeleton } from '@/components/shared/skeleton'

export function IntakeSkeleton() {
  return (
    <div className="max-w-2xl space-y-6">
      <SkeletonCard className="h-12" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  )
}
