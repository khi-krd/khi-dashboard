"use client"

import { ArrowPathIcon } from "@heroicons/react/24/outline"

import { DashboardKpiCards } from "@/components/dashboard/dashboard-kpi-cards"
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions"
import { DashboardRecentActivity } from "@/components/dashboard/dashboard-recent-activity"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboardOverviewQuery } from "@/hooks/useDashboardOverview"
import { formatCkbDigits, formatNewsDateLong } from "@/lib/intl-ckb"

function DashboardHomeSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Skeleton className="h-7 w-60" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <Skeleton className="h-80 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    </div>
  )
}

export function DashboardHomeClient() {
  const overviewQuery = useDashboardOverviewQuery()
  const data = overviewQuery.data

  const topModule = data?.cards.length
    ? [...data.cards].sort((a, b) => b.count - a.count)[0] ?? null
    : null

  if (overviewQuery.isLoading) {
    return <DashboardHomeSkeleton />
  }

  if (overviewQuery.isError || !data) {
    return (
      <Card>
        <CardContent className="grid gap-2 py-12 text-center">
          <p className="text-sm font-medium">داگرتنی زانیاری داشبۆرد سەرکەوتوو نەبوو</p>
          <p className="text-muted-foreground text-xs">
            تکایە دوبارە هەوڵبدەرەوە
          </p>
          <div>
            <Button
              variant="outline"
              onClick={() => void overviewQuery.refetch()}
              className="mx-auto"
            >
              <ArrowPathIcon className="size-4" />
              نوێکردنەوە
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isPartialFailure = data.failedModules.length > 0
  const failedLabels = data.cards
    .filter((card) => data.failedModules.includes(card.key))
    .map((card) => card.label)

  return (
    <div dir="rtl" className="grid gap-4 px-4 py-6 lg:px-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">داشبۆردی سەرەکی</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            تێڕوانینی گشتی بۆ هەموو بەشەکان و دوایین چالاکییەکان
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void overviewQuery.refetch()}
          disabled={overviewQuery.isFetching}
        >
          <ArrowPathIcon className="size-4" />
          {overviewQuery.isFetching ? "نوێدەکرێتەوە..." : "نوێکردنەوە"}
        </Button>
      </header>

      <section className="grid gap-2 md:grid-cols-3">
        <Card size="sm">
          <CardContent className="pt-3">
            <p className="text-muted-foreground text-xs">کۆی تۆمارەکان</p>
            <p className="mt-1 text-xl font-semibold">
              {formatCkbDigits(data.totalCount)}
            </p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="pt-3">
            <p className="text-muted-foreground text-xs">باشی مۆدیولەکان</p>
            <p className="mt-1 text-xl font-semibold">
              {formatCkbDigits(data.healthyCount)} / {formatCkbDigits(data.cards.length)}
            </p>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="pt-3">
            <p className="text-muted-foreground text-xs">زۆرترین چالاکی</p>
            <p className="mt-1 text-xl font-semibold">
              {topModule ? topModule.label : "—"}
            </p>
          </CardContent>
        </Card>
      </section>

      {isPartialFailure ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs">
          هەندێک بەش بە تەواوی بارنەکراون:{" "}
          {failedLabels.join("، ")}
        </p>
      ) : null}

      <DashboardKpiCards cards={data.cards} />

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <DashboardRecentActivity items={data.recentItems} />
        <DashboardQuickActions items={data.quickActions} />
      </div>

      <p className="text-muted-foreground text-xs">
        دوایین نوێکردنەوە: {formatNewsDateLong(data.generatedAt)}
      </p>
    </div>
  )
}
