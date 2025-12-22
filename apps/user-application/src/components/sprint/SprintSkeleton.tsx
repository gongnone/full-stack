/**
 * SprintSkeleton Component
 *
 * Loading state skeleton for Sprint View.
 */

import { Skeleton } from '@/components/ui/skeleton';

export function SprintSkeleton() {
  return (
    <div className="fixed inset-0 bg-[#0F1419] flex flex-col">
      {/* Header Skeleton */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-[#2A3038] bg-[#1A1F26]">
        <Skeleton className="h-8 w-20 bg-[#242A33]" />
        <Skeleton className="h-6 w-40 bg-[#242A33]" />
        <Skeleton className="h-8 w-24 bg-[#242A33]" />
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
        {/* Signal Header Skeleton */}
        <div className="w-full max-w-[880px] bg-[#242A33] rounded-lg border border-[#2A3038] p-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-12">
              <div>
                <Skeleton className="h-4 w-16 mb-2 bg-[#1A1F26]" />
                <Skeleton className="h-12 w-20 bg-[#1A1F26]" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2 bg-[#1A1F26]" />
                <Skeleton className="h-12 w-20 bg-[#1A1F26]" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16 bg-[#1A1F26]" />
              <Skeleton className="h-8 w-16 bg-[#1A1F26]" />
            </div>
          </div>
        </div>

        {/* Context Bar Skeleton */}
        <div className="w-full max-w-[880px] flex items-center justify-between py-3">
          <Skeleton className="h-5 w-80 bg-[#242A33]" />
          <Skeleton className="h-6 w-24 bg-[#242A33]" />
        </div>

        {/* Content Card Skeleton */}
        <div className="w-full max-w-[880px] bg-[#0F1419] rounded-lg border border-[#2A3038] p-8">
          <Skeleton className="h-7 w-3/4 mb-6 bg-[#242A33]" />
          <div className="space-y-3 mb-6">
            <Skeleton className="h-4 w-full bg-[#242A33]" />
            <Skeleton className="h-4 w-full bg-[#242A33]" />
            <Skeleton className="h-4 w-4/5 bg-[#242A33]" />
            <Skeleton className="h-4 w-full bg-[#242A33]" />
            <Skeleton className="h-4 w-3/4 bg-[#242A33]" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 bg-[#242A33]" />
            <Skeleton className="h-6 w-20 bg-[#242A33]" />
            <Skeleton className="h-6 w-28 bg-[#242A33]" />
          </div>
        </div>

        {/* Action Bar Skeleton */}
        <div className="w-full max-w-[880px] bg-[#1A1F26] rounded-lg border border-[#2A3038] p-6">
          <div className="flex items-center justify-center gap-8">
            <Skeleton className="h-12 w-40 bg-[#242A33]" />
            <Skeleton className="h-12 w-40 bg-[#242A33]" />
            <Skeleton className="h-12 w-40 bg-[#242A33]" />
          </div>
        </div>
      </main>

      {/* Footer Skeleton */}
      <div className="shrink-0">
        <Skeleton className="h-1 w-full bg-[#2A3038]" />
        <div className="h-10 flex items-center justify-center bg-[#0F1419]">
          <Skeleton className="h-4 w-96 bg-[#242A33]" />
        </div>
      </div>
    </div>
  );
}
