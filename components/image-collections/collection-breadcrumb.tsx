import Link from "next/link"
import { ChevronRightIcon } from "@heroicons/react/24/outline"

import { cn } from "@/lib/utils"

export function CollectionBreadcrumbBar({
  segments,
  className,
}: {
  segments: { label: string; href?: string | null }[]
  className?: string
}) {
  return (
    <nav
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm",
        className,
      )}
      aria-label="breadcrumb"
    >
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1
        return (
          <span key={`${seg.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 ? (
              <ChevronRightIcon
                className="text-muted-foreground/50 size-4 shrink-0 rtl:rotate-180"
                aria-hidden
              />
            ) : null}
            {seg.href && !isLast ? (
              <Link
                href={seg.href}
                className="hover:text-foreground transition-colors"
              >
                {seg.label}
              </Link>
            ) : (
              <span className={isLast ? "text-foreground font-medium" : undefined}>
                {seg.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}

export function dashboardCollectionsCrumbHref() {
  return "/dashboard"
}
