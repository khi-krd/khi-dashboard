"use client"

import {
  ArrowPathIcon,
  ChartBarIcon,
  ChevronDownIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { useMemo, useState } from "react"

import { DS, monthLabel } from "@/components/dashboard/dashboard-stats-strings"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboardStats } from "@/hooks/useDashboardStats"
import { DASHBOARD_MODULE_STYLE } from "@/lib/dashboard-module-style"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type {
  StatsBreakdownItem,
  StatsDimension,
  StatsModule,
  StatsOtherEntity,
} from "@/types/dashboard-stats"

const trendConfig = {
  total: { label: DS.trend.total, color: "var(--primary)" },
} satisfies ChartConfig

function pct(part: number, whole: number): number {
  if (whole <= 0) return 0
  return Math.round((part / whole) * 100)
}

/** Resolve a breakdown item's display label — DB names win, keys map to Kurdish. */
function breakdownLabel(
  moduleKey: string | null,
  dimKey: string,
  item: StatsBreakdownItem,
): string {
  if (item.nameCkb?.trim()) return item.nameCkb
  const key = item.key

  if (moduleKey === "news" && dimKey === "featured") {
    return key === "true" ? DS.breakdown.featuredTrue : DS.breakdown.featuredFalse
  }
  if (moduleKey === "news" && dimKey === "category" && key === "none") {
    return DS.breakdown.none
  }
  if (moduleKey === "projects" && dimKey === "status") {
    return DS.breakdown.status[key as keyof typeof DS.breakdown.status] ?? key
  }
  if (moduleKey === "videos" && dimKey === "type") {
    return DS.breakdown.videoType[key as keyof typeof DS.breakdown.videoType] ?? key
  }
  if (moduleKey === "sounds" && dimKey === "state") {
    return DS.breakdown.trackState[key as keyof typeof DS.breakdown.trackState] ?? key
  }
  if (moduleKey === "writings" && dimKey === "kind") {
    return DS.breakdown.writingKind[key as keyof typeof DS.breakdown.writingKind] ?? key
  }
  if (moduleKey === "collections" && dimKey === "type") {
    return (
      DS.breakdown.collectionType[key as keyof typeof DS.breakdown.collectionType] ?? key
    )
  }
  if (dimKey === "entityType") {
    return DS.breakdown.topicEntity[key as keyof typeof DS.breakdown.topicEntity] ?? key
  }
  if (dimKey === "status") {
    return (
      DS.breakdown.submissionStatus[key as keyof typeof DS.breakdown.submissionStatus] ??
      key
    )
  }
  if (dimKey === "soundType") return key
  return key
}

function DimensionBlock({
  moduleKey,
  dim,
  base,
}: {
  moduleKey: string | null
  dim: StatsDimension
  base: number
}) {
  const denom = base > 0 ? base : dim.items.reduce((s, i) => s + i.count, 0)
  return (
    <div className="space-y-1.5">
      <p className="text-muted-foreground text-[11px] font-medium">
        {DS.dimensions[dim.key as keyof typeof DS.dimensions] ?? dim.key}
      </p>
      <ul className="space-y-1">
        {dim.items.map((item) => {
          const share = pct(item.count, denom)
          return (
            <li key={item.key} className="space-y-0.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate">{breakdownLabel(moduleKey, dim.key, item)}</span>
                <span className="text-muted-foreground shrink-0 tabular-nums">
                  {formatCkbDigits(item.count)}
                  <span className="ms-1 text-[10px]">({formatCkbDigits(share)}٪)</span>
                </span>
              </div>
              <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                <div
                  className="bg-primary/70 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(share, 100)}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function ModuleCard({ module }: { module: StatsModule }) {
  const style = DASHBOARD_MODULE_STYLE[
    module.key as keyof typeof DASHBOARD_MODULE_STYLE
  ]
  const title = DS.modules[module.key as keyof typeof DS.modules] ?? module.key
  const Icon = style?.Icon ?? ChartBarIcon

  return (
    <Card className="overflow-hidden rounded-2xl py-0">
      <div className={cn("h-1 w-full", style?.bar ?? "bg-primary/60")} />
      <CardHeader className="px-5 pt-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl",
                style?.chip ?? "bg-primary/10 text-primary",
              )}
            >
              <Icon className="size-5" />
            </span>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              <p className={cn("text-2xl font-semibold tracking-tight", style?.count)}>
                {formatCkbDigits(module.total)}
              </p>
            </div>
          </div>
        </div>
        <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[11px]">
          <span>
            {DS.cards.thisMonth}: <b className="text-foreground">{formatCkbDigits(module.createdThisMonth)}</b>
          </span>
          <span>
            {DS.cards.thisYear}: <b className="text-foreground">{formatCkbDigits(module.createdThisYear)}</b>
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-5">
        {module.dimensions.map((dim) => (
          <DimensionBlock
            key={dim.key}
            moduleKey={module.key}
            dim={dim}
            base={module.total}
          />
        ))}
        {module.dimensions.length === 0 ? (
          <p className="text-muted-foreground text-xs">{DS.states.empty}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}

function TrendChart({ points }: { points: { month: string; total: number }[] }) {
  const data = useMemo(
    () =>
      points.map((p) => ({
        month: monthLabel(p.month),
        total: p.total,
      })),
    [points],
  )
  const grand = points.reduce((s, p) => s + p.total, 0)

  return (
    <Card className="overflow-hidden rounded-2xl py-0">
      <CardHeader className="border-b px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">{DS.trend.title}</CardTitle>
            <p className="text-muted-foreground mt-0.5 text-xs">{DS.trend.subtitle}</p>
          </div>
          <span className="bg-primary/10 text-primary rounded-lg px-3 py-1.5 text-sm font-semibold tabular-nums">
            {DS.trend.total}: {formatCkbDigits(grand)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-3 py-4 sm:px-5">
        <ChartContainer config={trendConfig} className="h-56 w-full">
          <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              width={44}
              className="text-xs"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="total" fill="var(--color-total)" radius={[6, 6, 0, 0]} maxBarSize={56} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function OtherEntityCard({ entity }: { entity: StatsOtherEntity }) {
  const [open, setOpen] = useState(false)
  const label = DS.otherLabels[entity.key] ?? entity.key
  const hasDims = (entity.dimensions?.length ?? 0) > 0

  return (
    <div className="border-border/60 bg-card/50 rounded-xl border px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs font-medium">{label}</span>
        <span className="shrink-0 text-sm font-semibold tabular-nums">
          {formatCkbDigits(entity.total)}
        </span>
      </div>
      <p className="text-muted-foreground mt-0.5 text-[10px]">
        {entity.active != null
          ? DS.other.active(formatCkbDigits(entity.total), formatCkbDigits(entity.active))
          : DS.other.totalOnly(formatCkbDigits(entity.total))}
      </p>
      {hasDims ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-muted-foreground hover:text-foreground mt-1 inline-flex items-center gap-1 text-[10px] transition-colors"
        >
          <ChevronDownIcon className={cn("size-3 transition-transform", open && "rotate-180")} />
          {entity.dimensions!.map((d) => DS.dimensions[d.key as keyof typeof DS.dimensions] ?? d.key).join("، ")}
        </button>
      ) : null}
      {open && hasDims ? (
        <div className="mt-2 space-y-2 border-t pt-2">
          {entity.dimensions!.map((dim) => (
            <DimensionBlock
              key={dim.key}
              moduleKey={null}
              dim={dim}
              base={entity.total}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function DashboardStatsSection() {
  const stats = useDashboardStats()

  if (stats.isLoading) {
    return (
      <section className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-2xl" />
          ))}
        </div>
      </section>
    )
  }

  if (stats.isError) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <Squares2X2Icon className="text-muted-foreground size-8" />
          <p className="text-sm font-medium">{DS.states.error}</p>
          <Button variant="outline" size="sm" onClick={() => void stats.refetch()}>
            <ArrowPathIcon className="size-4" />
            {DS.states.retry}
          </Button>
        </CardContent>
      </Card>
    )
  }

  const data = stats.data
  if (!data) return null // 403 — stats are admin-only, hide quietly

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{DS.section.title}</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">{DS.section.subtitle}</p>
        </div>
        <span className="bg-primary/10 text-primary shrink-0 rounded-lg px-3 py-1.5 text-sm font-semibold tabular-nums">
          {DS.cards.total}: {formatCkbDigits(data.grandTotal)}
        </span>
      </div>

      <TrendChart points={data.monthlyTrend} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {data.modules.map((m) => (
          <ModuleCard key={m.key} module={m} />
        ))}
      </div>

      <Card className="overflow-hidden rounded-2xl py-0">
        <CardHeader className="border-b px-5 py-4">
          <CardTitle className="text-base">{DS.other.title}</CardTitle>
          <p className="text-muted-foreground mt-0.5 text-xs">{DS.other.subtitle}</p>
        </CardHeader>
        <CardContent className="px-5 py-4">
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {data.otherEntities.map((e) => (
              <OtherEntityCard key={e.key} entity={e} />
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
