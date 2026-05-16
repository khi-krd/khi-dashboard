import type { ReactNode } from "react"

/** Slightly tighter shell than the dashboard default for news-heavy pages. */
export default function NewsSegmentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 sm:gap-3">{children}</div>
  )
}
