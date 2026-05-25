"use client"

import * as React from "react"
import { Cell, Label, Pie, PieChart } from "recharts"

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
import { cn } from "@/lib/utils"
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
    <Card className="py-0">
      <CardHeader className="border-b py-3">
        <CardTitle className="text-sm">دابەشبوونی تۆمارەکان</CardTitle>
      </CardHeader>
      <CardContent className="py-4">
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <Skeleton className="size-40 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : data.length === 0 ? (
          <p className="text-muted-foreground py-10 text-center text-sm">
            هێشتا هیچ تۆمارێک نییە
          </p>
        ) : (
          <>
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[220px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent nameKey="key" hideLabel />
                  }
                />
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="key"
                  innerRadius={60}
                  strokeWidth={4}
                  paddingAngle={2}
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

            <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
              {data.map((item) => (
                <li
                  key={item.key}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span
                      className={cn("size-2.5 shrink-0 rounded-[3px]")}
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate">{item.label}</span>
                  </span>
                  <span className="text-muted-foreground tabular-nums">
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
