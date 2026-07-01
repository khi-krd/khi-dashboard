import Link from "next/link"
import { ArrowLeftIcon, PlusIcon } from "@heroicons/react/24/outline"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { DASHBOARD_MODULE_STYLE } from "@/lib/dashboard-module-style"
import { cn } from "@/lib/utils"
import type { DashboardModuleState } from "@/hooks/useDashboardOverview"

type DashboardKpiCardsProps = {
  modules: DashboardModuleState[]
}

export function DashboardKpiCards({ modules }: DashboardKpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {modules.map(({ card, isLoading, isError }) => {
        const style = DASHBOARD_MODULE_STYLE[card.key]
        const Icon = style.Icon

        return (
          <article
            key={card.key}
            className="group bg-card relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20"
          >
            <div
              className={cn(
                "pointer-events-none absolute -start-6 -top-6 size-24 rounded-full opacity-50 blur-2xl transition-opacity group-hover:opacity-70",
                style.chip.split(" ")[0],
              )}
              aria-hidden
            />

            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-11 items-center justify-center rounded-xl ring-1 ring-black/5 dark:ring-white/10",
                    style.chip,
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-medium leading-tight">{card.label}</h3>
                  {!isLoading && (
                    <Badge
                      variant={card.isHealthy ? "secondary" : "destructive"}
                      className="mt-1.5 h-5 px-1.5 text-[10px]"
                    >
                      {card.isHealthy ? "باشە" : "هەڵە"}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="relative mt-5">
              {isLoading ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <p
                  className={cn(
                    "text-4xl font-semibold tracking-tight tabular-nums",
                    isError ? "text-muted-foreground" : style.count,
                  )}
                >
                  {isError ? "—" : formatCkbDigits(card.count)}
                </p>
              )}
              <p className="text-muted-foreground mt-1 text-xs">تۆمار</p>
            </div>

            <div className="relative mt-5 flex items-center gap-2 border-t pt-4">
              <Link
                href={card.href}
                className="text-muted-foreground hover:text-foreground flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-colors hover:bg-muted/60"
              >
                <ArrowLeftIcon className="size-3.5" />
                پیشاندان
              </Link>
              <span className="bg-border h-4 w-px" />
              <Link
                href={card.createHref}
                className="text-primary hover:bg-primary/5 flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-colors"
              >
                <PlusIcon className="size-3.5" />
                زیادکردن
              </Link>
            </div>
          </article>
        )
      })}
    </div>
  )
}
