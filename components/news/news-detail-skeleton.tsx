"use client"

/**
 * Mirrors the redesigned detail shell: sticky top stripe + two-pane grid skeleton.
 */

export function NewsDetailSkeleton() {
  return (
    <div dir="rtl" className="min-h-[60vh]">
      <div className="bg-background/95 supports-backdrop-filter:backdrop-blur border-border sticky top-0 z-30 border-b">
        <div className="mx-auto flex max-w-[calc(860px+340px+2rem)] flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <div className="bg-muted h-5 w-56 animate-pulse rounded-md sm:w-72" />
          <div className="flex flex-wrap gap-2">
            <div className="bg-muted size-9 animate-pulse rounded-md" />
            <div className="bg-muted size-9 animate-pulse rounded-md" />
            <div className="bg-muted h-9 w-28 animate-pulse rounded-md" />
            <div className="bg-muted h-9 w-24 animate-pulse rounded-md" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:mx-auto lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 lg:px-6">
        <main className="order-1 max-w-none lg:py-8">
          <div className="mx-auto max-w-[860px] px-6 pb-12 pt-8">
            <div className="bg-muted mb-4 h-4 w-48 max-w-[90%] animate-pulse rounded-md" />

            <div className="bg-muted relative mb-10 aspect-[21/9] w-full animate-pulse rounded-xl overflow-hidden" />

            <div className="bg-muted mb-4 h-10 w-[85%] animate-pulse rounded-md" />
            <div className="bg-muted mb-8 h-6 w-[55%] animate-pulse rounded-md" />

            <div className="space-y-3">
              <div className="bg-muted h-4 w-full animate-pulse rounded-md" />
              <div className="bg-muted h-4 w-[92%] animate-pulse rounded-md" />
              <div className="bg-muted h-4 w-[88%] animate-pulse rounded-md" />
              <div className="bg-muted h-4 w-[70%] animate-pulse rounded-md" />
            </div>
          </div>
        </main>

        <aside className="order-2 border-border mx-4 mb-8 rounded-xl border lg:sticky lg:top-20 lg:mb-12 lg:h-fit lg:self-start lg:mx-0 lg:mt-8">
          <div className="space-y-6 p-6">
            <div className="bg-muted h-12 w-full animate-pulse rounded-md" />
            <div className="border-border border-t pt-6">
              <div className="bg-muted mb-4 h-3 w-20 animate-pulse rounded-md" />
              <div className="flex gap-2">
                <div className="bg-muted h-8 w-20 animate-pulse rounded-md" />
                <div className="bg-muted h-8 w-24 animate-pulse rounded-md" />
              </div>
            </div>
            <div className="border-border border-t pt-6 space-y-3">
              <div className="bg-muted mb-4 h-3 w-28 animate-pulse rounded-md" />
              <div className="bg-muted h-16 w-full animate-pulse rounded-md" />
              <div className="bg-muted h-16 w-full animate-pulse rounded-md" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
