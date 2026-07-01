"use client"

import dynamic from "next/dynamic"
import { ChartPieIcon } from "@heroicons/react/24/outline"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function ChartSkeleton() {
  return (
    <Card className="overflow-hidden rounded-2xl py-0">
      <CardHeader className="border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
            <ChartPieIcon className="size-4" />
          </span>
          <CardTitle className="text-sm">دابەشبوونی تۆمارەکان</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-5 py-5">
        <div className="flex flex-col items-center gap-3">
          <Skeleton className="size-44 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </CardContent>
    </Card>
  )
}

export const DashboardDistributionChart = dynamic(
  () =>
    import("@/components/dashboard/dashboard-distribution-chart").then(
      (m) => m.DashboardDistributionChart,
    ),
  { ssr: false, loading: () => <ChartSkeleton /> },
)
