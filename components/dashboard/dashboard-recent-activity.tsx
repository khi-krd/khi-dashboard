import Link from "next/link"
import { ClockIcon } from "@heroicons/react/24/outline"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatNewsDateShort } from "@/lib/intl-ckb"
import { DASHBOARD_MODULE_STYLE } from "@/lib/dashboard-module-style"
import { cn } from "@/lib/utils"
import type { DashboardRecentItem } from "@/lib/dashboard-overview"

type DashboardRecentActivityProps = {
  items: DashboardRecentItem[]
}

export function DashboardRecentActivity({ items }: DashboardRecentActivityProps) {
  return (
    <Card className="overflow-hidden rounded-2xl py-0">
      <CardHeader className="border-b px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
            <ClockIcon className="size-4" />
          </span>
          <div>
            <CardTitle>دوایین نوێکارییەکان</CardTitle>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {items.length > 0
                ? `${items.length} چالاکیی دوایی`
                : "هیچ چالاکییەک نییە"}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 py-5">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted flex size-14 items-center justify-center rounded-2xl">
              <ClockIcon className="text-muted-foreground size-6" />
            </div>
            <p className="text-muted-foreground mt-4 text-sm">
              هێشتا هیچ تۆمارێکی تازە نییە
            </p>
          </div>
        ) : (
          <ul className="relative space-y-1">
            <div
              className="bg-border absolute end-[1.125rem] top-3 bottom-3 w-px"
              aria-hidden
            />
            {items.map((item, index) => {
              const style = DASHBOARD_MODULE_STYLE[item.moduleKey]
              const Icon = style.Icon
              const isLast = index === items.length - 1

              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    className={cn(
                      "hover:bg-muted/50 group flex items-start gap-4 rounded-xl p-3 transition-colors",
                      isLast && "pb-0",
                    )}
                  >
                    <span
                      className={cn(
                        "relative z-[1] flex size-9 shrink-0 items-center justify-center rounded-xl ring-2 ring-background transition-transform group-hover:scale-105",
                        style.chip,
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="truncate text-sm font-medium group-hover:text-primary transition-colors">
                          {item.title}
                        </p>
                        <span
                          className={cn(
                            "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium",
                            style.chip,
                          )}
                        >
                          {item.moduleLabel}
                        </span>
                      </div>
                      {item.date ? (
                        <p className="text-muted-foreground mt-1 text-xs">
                          {formatNewsDateShort(item.date)}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
