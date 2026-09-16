import { Skeleton } from "@/components/ui/skeleton"

export function WritingDetailSkeleton() {
  return (
    <div dir="ltr" className="flex flex-col">
      <div className="border-border/60 border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <Skeleton className="h-8 w-56" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-10">
        <aside className="px-4 pt-4 lg:px-0 lg:pt-0">
          <div className="border-border bg-card space-y-6 rounded-xl border p-6">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </aside>
        <div
          dir="rtl"
          className="mx-auto w-full max-w-[860px] space-y-6 px-6 pb-12 pt-8"
        >
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-6">
            <Skeleton className="aspect-[2/3] w-[240px] shrink-0 rounded-xl" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  )
}
