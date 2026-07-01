"use client"

import * as React from "react"
import { Cell, Label, Pie, PieChart } from "recharts"
import { ChartPieIcon } from "@heroicons/react/24/outline"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { DASHBOARD_MODULE_STYLE } from "@/lib/dashboard-module-style"
import { formatCkbDigits } from "@/lib/intl-ckb"
import type { DashboardModuleState } from "@/hooks/useDashboardOverview"

type DashboardDistributionChartProps = {
  modules: DashboardModuleState[]
  isLoading: boolean
}

export function DashboardDistributionChart({
  modules,
  isLoading,
}: DashboardDistributionChartProps) {
  const data = React.useMemo(
    () =>
      modules
        .filter((m) => !m.isError && m.card.count > 0)
        .sort((a, b) => b.card.count - a.card.count)
        .map((m) => ({
          key: m.card.key,
          label: m.card.label,
          count: m.card.count,
          color: DASHBOARD_MODULE_STYLE[m.card.key].color,
        })),
    [modules],
  )

  const total = React.useMemo(
    () => data.reduce((sum, item) => sum + item.count, 0),
    [data],
  )

  const chartConfig = React.useMemo<ChartConfig>(() => {
    const config: ChartConfig = { count: { label: "تۆمارەکان" } }
    for (const item of data) {
      config[item.key] = { label: item.label, color: item.color }
    }
    return config
  }, [data])

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
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <Skeleton className="size-44 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="bg-muted flex size-14 items-center justify-center rounded-2xl">
              <ChartPieIcon className="text-muted-foreground size-6" />
            </div>
            <p className="text-muted-foreground mt-4 text-sm">
              هێشتا هیچ تۆمارێک نییە
            </p>
          </div>
        ) : (
          <>
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[240px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent nameKey="key" hideLabel />}
                />
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="key"
                  innerRadius={68}
                  outerRadius={100}
                  strokeWidth={3}
                  paddingAngle={3}
                >
                  {data.map((item) => (
                    <Cell key={item.key} fill={item.color} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (!viewBox || !("cx" in viewBox)) return null
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-2xl font-semibold"
                          >
                            {formatCkbDigits(total)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0) + 22}
                            className="fill-muted-foreground text-xs"
                          >
                            کۆی گشتی
                          </tspan>
                        </text>
                      )
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            <ul className="mt-4 space-y-2">
              {data.map((item) => (
                <li
                  key={item.key}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate">{item.label}</span>
                  </span>
                  <span className="text-muted-foreground shrink-0 tabular-nums">
                    {formatCkbDigits(item.count)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  )
}
