import { Skeleton } from "@/components/ui/skeleton"

export function CollectionDetailSkeleton() {
  return (
    <div dir="ltr" className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="space-y-6 rounded-xl border border-border bg-card p-6">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </aside>
      <div dir="rtl" className="mx-auto w-full max-w-[860px] space-y-6 px-6 pb-12 pt-8">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="aspect-[4/3] w-full rounded-lg" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  )
}
