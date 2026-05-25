import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatNewsDateShort } from "@/lib/intl-ckb"
import { DASHBOARD_MODULE_STYLE } from "@/lib/dashboard-module-style"
import { cn } from "@/lib/utils"
import type { DashboardRecentItem } from "@/lib/dashboard-overview"

type DashboardRecentActivityProps = {
  items: DashboardRecentItem[]
}

export function DashboardRecentActivity({ items }: DashboardRecentActivityProps) {
  return (
    <Card className="py-0">
      <CardHeader className="border-b py-3">
        <CardTitle className="text-sm">دوایین نوێکارییەکان</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 py-4">
        {items.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            هێشتا هیچ تۆمارێکی تازە نییە
          </p>
        ) : (
          items.map((item) => {
            const style = DASHBOARD_MODULE_STYLE[item.moduleKey]
            const Icon = style.Icon
            return (
              <Link
                key={item.key}
                href={item.href}
                className="hover:bg-muted/60 flex items-center justify-between gap-3 rounded-lg border p-2.5 transition-colors"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg",
                      style.chip,
                    )}
                  >
                    <Icon className="size-4.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {formatNewsDateShort(item.date)}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">{item.moduleLabel}</Badge>
              </Link>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
