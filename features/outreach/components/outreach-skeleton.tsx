import { SkeletonCard } from '@/components/shared/skeleton'

export function OutreachSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
