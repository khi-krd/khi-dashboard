import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatNewsDateShort } from "@/lib/intl-ckb"
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
          items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="hover:bg-muted/60 flex items-start justify-between gap-3 rounded-lg border p-2.5 transition-colors"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {formatNewsDateShort(item.date)}
                </p>
              </div>
              <Badge variant="outline">{item.moduleLabel}</Badge>
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  )
}
