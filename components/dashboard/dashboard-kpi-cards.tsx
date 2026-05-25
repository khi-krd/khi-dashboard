import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { DASHBOARD_MODULE_STYLE } from "@/lib/dashboard-module-style"
import { cn } from "@/lib/utils"
import type { DashboardModuleState } from "@/hooks/useDashboardOverview"

type DashboardKpiCardsProps = {
  modules: DashboardModuleState[]
}

export function DashboardKpiCards({ modules }: DashboardKpiCardsProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {modules.map(({ card, isLoading, isError }) => {
        const style = DASHBOARD_MODULE_STYLE[card.key]
        const Icon = style.Icon
        return (
          <Card
            key={card.key}
            className="relative gap-0 py-0 transition-shadow hover:shadow-md"
          >
            <span
              className={cn(
                "absolute inset-x-0 top-0 h-1 rounded-t-xl",
                style.bar,
              )}
            />
            <CardHeader className="border-b py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg",
                      style.chip,
                    )}
                  >
                    <Icon className="size-4.5" />
                  </span>
                  <CardTitle className="text-sm">{card.label}</CardTitle>
                </div>
                {!isLoading && (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Badge
                          variant={card.isHealthy ? "secondary" : "destructive"}
                        >
                          {card.isHealthy ? "باشە" : "هەڵە"}
                        </Badge>
                      }
                    />
                    <TooltipContent>
                      {card.isHealthy
                        ? "ئەم بەشە بە سەرکەوتوویی بارکرا"
                        : "بارکردنی ئەم بەشە سەرکەوتوو نەبوو"}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </CardHeader>
            <CardContent className="py-4">
              <div className="flex items-end justify-between gap-3">
                {isLoading ? (
                  <Skeleton className="h-9 w-16" />
                ) : (
                  <p
                    className={cn(
                      "text-3xl font-semibold tracking-tight",
                      isError ? "text-muted-foreground" : style.count,
                    )}
                  >
                    {isError ? "—" : formatCkbDigits(card.count)}
                  </p>
                )}
                <div className="flex gap-2 text-xs">
                  <Link
                    href={card.href}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    پیشاندان
                  </Link>
                  <span className="text-muted-foreground/50">•</span>
                  <Link
                    href={card.createHref}
                    className="text-primary hover:underline"
                  >
                    زیادکردن
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}
