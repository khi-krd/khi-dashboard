import { Skeleton } from "@/components/ui/skeleton"

export function ProjectDetailSkeleton() {
  return (
    <div dir="rtl" className="min-h-[50vh]">
      <div className="border-border sticky top-0 z-30 border-b px-4 py-3 lg:px-6">
        <Skeleton className="h-5 w-64 max-w-full" />
      </div>
      <div className="grid grid-cols-1 lg:mx-auto lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 lg:px-6">
        <main className="order-1 min-w-0">
          <div className="mx-auto max-w-[860px] space-y-6 px-6 pb-12 pt-8">
            <Skeleton className="aspect-[21/9] w-full rounded-xl" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-40 w-full" />
          </div>
        </main>
        <aside className="order-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <Skeleton className="mb-4 h-8 w-full rounded-md" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-6 h-4 w-full" />
          </div>
        </aside>
      </div>
    </div>
  )
}
