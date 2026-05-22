import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCkbDigits } from "@/lib/intl-ckb"
import type { DashboardModuleCard } from "@/lib/dashboard-overview"

type DashboardKpiCardsProps = {
  cards: DashboardModuleCard[]
}

export function DashboardKpiCards({ cards }: DashboardKpiCardsProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.key} className="py-0">
          <CardHeader className="border-b py-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm">{card.label}</CardTitle>
              <Badge variant={card.isHealthy ? "secondary" : "destructive"}>
                {card.isHealthy ? "باشە" : "هەڵە"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="py-4">
            <div className="flex items-end justify-between gap-3">
              <p className="text-3xl font-semibold tracking-tight">
                {formatCkbDigits(card.count)}
              </p>
              <div className="flex gap-2 text-xs">
                <Link href={card.href} className="text-muted-foreground hover:text-foreground">
                  پیشاندان
                </Link>
                <span className="text-muted-foreground/50">•</span>
                <Link href={card.createHref} className="text-primary hover:underline">
                  زیادکردن
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
