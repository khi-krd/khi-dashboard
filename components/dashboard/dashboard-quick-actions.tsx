import Link from "next/link"
import { PlusIcon } from "@heroicons/react/24/outline"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import type { DashboardQuickAction } from "@/lib/dashboard-overview"
import { cn } from "@/lib/utils"

type DashboardQuickActionsProps = {
  items: readonly DashboardQuickAction[]
}

export function DashboardQuickActions({ items }: DashboardQuickActionsProps) {
  return (
    <Card className="h-full py-0">
      <CardHeader className="border-b py-3">
        <CardTitle className="text-sm">کردارە خێراکان</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 py-4">
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "justify-between",
            )}
          >
            <span className="truncate">{item.label}</span>
            <PlusIcon className="size-3.5" />
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
