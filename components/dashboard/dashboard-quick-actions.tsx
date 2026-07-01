import Link from "next/link"
import { BoltIcon, PlusIcon } from "@heroicons/react/24/outline"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DASHBOARD_MODULE_STYLE } from "@/lib/dashboard-module-style"
import type { DashboardQuickAction } from "@/lib/dashboard-overview"
import { cn } from "@/lib/utils"

type DashboardQuickActionsProps = {
  items: readonly DashboardQuickAction[]
}

export function DashboardQuickActions({ items }: DashboardQuickActionsProps) {
  return (
    <Card className="overflow-hidden rounded-2xl py-0">
      <CardHeader className="border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 flex size-8 items-center justify-center rounded-lg">
            <BoltIcon className="size-4" />
          </span>
          <CardTitle className="text-sm">کردارە خێراکان</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3 xl:grid-cols-2">
        {items.map((item) => {
          const style = DASHBOARD_MODULE_STYLE[item.key as keyof typeof DASHBOARD_MODULE_STYLE]
          const Icon = style?.Icon ?? PlusIcon

          return (
            <Link
              key={item.key}
              href={item.href}
              className="group hover:bg-muted/60 flex flex-col items-center gap-2 rounded-xl border border-transparent p-3 text-center transition-all hover:border-border hover:shadow-sm"
            >
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                  style?.chip ?? "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="size-4.5" />
              </span>
              <span className="text-muted-foreground group-hover:text-foreground line-clamp-2 text-[11px] leading-tight font-medium transition-colors">
                {item.label.replace("زیادکردنی ", "")}
              </span>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}
