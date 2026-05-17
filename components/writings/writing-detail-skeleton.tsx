import { Skeleton } from "@/components/ui/skeleton"

export function WritingDetailSkeleton() {
  return (
    <div dir="ltr" className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="border-border bg-card space-y-6 rounded-xl border p-6">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </aside>
      <div dir="rtl" className="mx-auto w-full max-w-[860px] space-y-6 px-6 pb-12 pt-8">
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-6">
          <Skeleton className="aspect-[2/3] w-[240px] shrink-0 rounded-lg" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  )
}
