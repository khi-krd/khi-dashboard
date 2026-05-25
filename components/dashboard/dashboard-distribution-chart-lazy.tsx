"use client"

import dynamic from "next/dynamic"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/** Card-shaped placeholder matching the chart's own loading state — no layout shift. */
function ChartSkeleton() {
  return (
    <Card className="py-0">
      <CardHeader className="border-b py-3">
        <CardTitle className="text-sm">دابەشبوونی تۆمارەکان</CardTitle>
      </CardHeader>
      <CardContent className="py-4">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="size-40 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Code-split distribution chart. Keeps `recharts` (~heavy) out of the dashboard
 * route's initial JS — fetched after first paint. Drop-in for the eager export.
 */
export const DashboardDistributionChart = dynamic(
  () =>
    import("@/components/dashboard/dashboard-distribution-chart").then(
      (m) => m.DashboardDistributionChart,
    ),
  { ssr: false, loading: () => <ChartSkeleton /> },
)
