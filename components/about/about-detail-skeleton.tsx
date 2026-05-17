"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function AboutDetailSkeleton() {
  return (
    <div dir="rtl" className="mx-auto max-w-[1280px] px-6 py-8">
      <Skeleton className="mb-6 h-10 w-full max-w-lg" />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
        <Skeleton className="h-96 rounded-xl" />
        <div className="space-y-6">
          <Skeleton className="aspect-[8/3] w-full rounded-2xl" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  )
}
