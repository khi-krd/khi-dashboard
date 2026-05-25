"use client"

import {
  ArrowPathIcon,
  ChartBarIcon,
  CheckCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline"

import { DashboardDistributionChart } from "@/components/dashboard/dashboard-distribution-chart"
import { DashboardKpiCards } from "@/components/dashboard/dashboard-kpi-cards"
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions"
import { DashboardRecentActivity } from "@/components/dashboard/dashboard-recent-activity"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useDashboardOverview } from "@/hooks/useDashboardOverview"
import { formatCkbDigits, formatNewsDateLong } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"

type StatCardProps = {
  label: string
  value: string
  hint: string
  Icon: typeof ChartBarIcon
  chip: string
  isLoading: boolean
}

function StatCard({ label, value, hint, Icon, chip, isLoading }: StatCardProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Card size="sm" className="cursor-default">
            <CardContent className="flex items-center gap-3 pt-3">
              <span
                className={cn(
                  "flex size-10 items-center justify-center rounded-xl",
                  chip,
                )}
              >
                <Icon className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-muted-foreground text-xs">{label}</p>
                {isLoading ? (
                  <Skeleton className="mt-1.5 h-6 w-20" />
                ) : (
                  <p className="mt-0.5 truncate text-xl font-semibold">
                    {value}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        }
      />
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  )
}

export function DashboardHomeClient() {
  const overview = useDashboardOverview()

  if (overview.isAllError) {
    return (
      <div dir="rtl" className="px-4 py-6 lg:px-6">
        <Card>
          <CardContent className="grid gap-2 py-12 text-center">
            <p className="text-sm font-medium">
              داگرتنی زانیاری داشبۆرد سەرکەوتوو نەبوو
            </p>
            <p className="text-muted-foreground text-xs">
              تکایە دوبارە هەوڵبدەرەوە
            </p>
            <div>
              <Button
                variant="outline"
                onClick={overview.refetch}
                className="mx-auto"
              >
                <ArrowPathIcon className="size-4" />
                نوێکردنەوە
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const topModule = [...overview.modules]
    .filter((m) => !m.isLoading)
    .sort((a, b) => b.card.count - a.card.count)[0]

  return (
    <div dir="rtl" className="grid gap-4 px-4 py-6 lg:px-6">
      <header className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-gradient-to-l from-primary/10 via-primary/5 to-transparent p-4 ring-1 ring-foreground/5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            داشبۆردی سەرەکی
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            تێڕوانینی گشتی بۆ هەموو بەشەکان و دوایین چالاکییەکان
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={overview.refetch}
          disabled={overview.isFetching}
        >
          {overview.isFetching ? (
            <Spinner className="size-4" />
          ) : (
            <ArrowPathIcon className="size-4" />
          )}
          {overview.isFetching ? "نوێدەکرێتەوە..." : "نوێکردنەوە"}
        </Button>
      </header>

      <section className="grid gap-2 md:grid-cols-3">
        <StatCard
          label="کۆی تۆمارەکان"
          value={formatCkbDigits(overview.totalCount)}
          hint="کۆی گشتی هەموو تۆمارەکان لە هەموو بەشەکاندا"
          Icon={ChartBarIcon}
          chip="bg-primary/10 text-primary"
          isLoading={overview.isInitialLoading}
        />
        <StatCard
          label="باشی مۆدیولەکان"
          value={`${formatCkbDigits(overview.healthyCount)} / ${formatCkbDigits(overview.moduleCount)}`}
          hint="ژمارەی ئەو بەشانەی بە سەرکەوتوویی بارکراون"
          Icon={CheckCircleIcon}
          chip="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          isLoading={overview.isInitialLoading}
        />
        <StatCard
          label="زۆرترین چالاکی"
          value={topModule ? topModule.card.label : "—"}
          hint="ئەو بەشەی زۆرترین ژمارەی تۆماری تێدایە"
          Icon={SparklesIcon}
          chip="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          isLoading={overview.isInitialLoading}
        />
      </section>

      {overview.failedLabels.length > 0 ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs">
          هەندێک بەش بە تەواوی بارنەکراون: {overview.failedLabels.join("، ")}
        </p>
      ) : null}

      <DashboardKpiCards modules={overview.modules} />

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        {overview.isInitialLoading ? (
          <Skeleton className="h-80 w-full rounded-xl" />
        ) : (
          <DashboardRecentActivity items={overview.recentItems} />
        )}
        <div className="grid gap-4">
          <DashboardDistributionChart
            modules={overview.modules}
            isLoading={overview.isInitialLoading}
          />
          <DashboardQuickActions items={overview.quickActions} />
        </div>
      </div>

      {overview.generatedAt ? (
        <>
          <Separator />
          <p className="text-muted-foreground text-xs">
            دوایین نوێکردنەوە: {formatNewsDateLong(overview.generatedAt)}
          </p>
        </>
      ) : null}
    </div>
  )
}
