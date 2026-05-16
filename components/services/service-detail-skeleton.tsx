import { Skeleton } from "@/components/ui/skeleton"

export function ServiceDetailSkeleton() {
  return (
    <div dir="rtl" className="min-h-[50vh]">
      <div className="border-border/60 bg-background/95 sticky top-0 z-30 border-b px-4 py-3 backdrop-blur">
        <Skeleton className="h-4 w-64" />
      </div>
      <div
        dir="ltr"
        className="grid grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-8 lg:px-6"
      >
        <aside dir="rtl" className="space-y-6">
          <div className="border-border bg-card space-y-4 rounded-xl border p-6">
            <Skeleton className="h-8 w-full rounded-md" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="border-border mt-6 h-px w-full border-t" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-full" />
          </div>
        </aside>
        <main dir="rtl" className="mx-auto min-w-0 max-w-[860px] space-y-6 px-2">
          <Skeleton className="aspect-[21/9] w-full rounded-xl" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-48 w-full" />
        </main>
      </div>
    </div>
  )
}
