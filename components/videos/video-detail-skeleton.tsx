"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function VideoDetailSkeleton() {
  return (
    <div className="min-h-[50vh]" dir="rtl">
      <div className="border-border border-b px-4 py-3 lg:px-6">
        <Skeleton className="h-5 w-64 max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-6 p-4 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-8 lg:p-6" dir="ltr">
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Skeleton className="h-48 w-full rounded-xl" />
        </aside>
        <div className="max-w-[860px] space-y-6 px-0 pb-12 pt-4 lg:mx-auto lg:px-6 lg:pt-8" dir="rtl">
          <Skeleton className="aspect-video w-full rounded-xl bg-black/80" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  )
}
