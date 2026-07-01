"use client"

import {
  ArrowPathIcon,
  ChartBarIcon,
  CheckCircleIcon,
  SparklesIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline"

import { DashboardDistributionChart } from "@/components/dashboard/dashboard-distribution-chart-lazy"
import { DashboardKpiCards } from "@/components/dashboard/dashboard-kpi-cards"
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions"
import { DashboardRecentActivity } from "@/components/dashboard/dashboard-recent-activity"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { useDashboardOverview } from "@/hooks/useDashboardOverview"
import { formatCkbDigits, formatNewsDateLong } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/auth.store"

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "بەیانی باش"
  if (hour < 17) return "ڕۆژی باش"
  return "ئێوارەی باش"
}

type HeroStatProps = {
  label: string
  value: string
  Icon: typeof ChartBarIcon
  accent: string
  isLoading: boolean
}

function HeroStat({ label, value, Icon, accent, isLoading }: HeroStatProps) {
  return (
    <div className="bg-background/60 flex items-center gap-3 rounded-xl border border-white/20 px-4 py-3 backdrop-blur-sm dark:border-white/10">
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          accent,
        )}
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-muted-foreground text-xs">{label}</p>
        {isLoading ? (
          <Skeleton className="mt-1.5 h-7 w-24" />
        ) : (
          <p className="mt-0.5 truncate text-xl font-semibold tracking-tight">
            {value}
          </p>
        )}
      </div>
    </div>
  )
}

export function DashboardHomeClient() {
  const overview = useDashboardOverview()
  const userName = useAuthStore((s) => s.user?.name)

  if (overview.isAllError) {
    return (
      <div dir="rtl" className="px-4 py-6 lg:px-6">
        <Card className="overflow-hidden rounded-2xl">
          <CardContent className="grid gap-4 py-16 text-center">
            <div className="bg-destructive/10 text-destructive mx-auto flex size-14 items-center justify-center rounded-2xl">
              <Squares2X2Icon className="size-7" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">داگرتنی زانیاری داشبۆرد سەرکەوتوو نەبوو</p>
              <p className="text-muted-foreground text-sm">
                تکایە دوبارە هەوڵبدەرەوە
              </p>
            </div>
            <Button variant="outline" onClick={overview.refetch} className="mx-auto">
              <ArrowPathIcon className="size-4" />
              نوێکردنەوە
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const topModule = [...overview.modules]
    .filter((m) => !m.isLoading)
    .sort((a, b) => b.card.count - a.card.count)[0]

  return (
    <div dir="rtl" className="space-y-8 px-4 py-6 lg:px-6">
      {/* Hero */}
      <header className="from-primary/15 via-primary/5 relative overflow-hidden rounded-2xl border bg-gradient-to-bl to-transparent p-6 sm:p-8">
        <div className="relative z-[1] space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <div className="text-primary flex items-center gap-2">
                <SparklesIcon className="size-5" aria-hidden />
                <span className="text-sm font-medium tracking-wide">
                  {getGreeting()}
                  {userName ? `، ${userName}` : ""}
                </span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                داشبۆردی سەرەکی
              </h1>
              <p className="text-muted-foreground max-w-xl text-sm sm:text-base">
                تێڕوانینی گشتی بۆ هەموو بەشەکان، ئامارەکان و دوایین چالاکییەکان
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={overview.refetch}
              disabled={overview.isFetching}
              className="bg-background/60 shrink-0 backdrop-blur-sm"
            >
              {overview.isFetching ? (
                <Spinner className="size-4" />
              ) : (
                <ArrowPathIcon className="size-4" />
              )}
              {overview.isFetching ? "نوێدەکرێتەوە..." : "نوێکردنەوە"}
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <HeroStat
              label="کۆی تۆمارەکان"
              value={formatCkbDigits(overview.totalCount)}
              Icon={ChartBarIcon}
              accent="bg-primary/15 text-primary"
              isLoading={overview.isInitialLoading}
            />
            <HeroStat
              label="باشی مۆدیولەکان"
              value={`${formatCkbDigits(overview.healthyCount)} / ${formatCkbDigits(overview.moduleCount)}`}
              Icon={CheckCircleIcon}
              accent="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              isLoading={overview.isInitialLoading}
            />
            <HeroStat
              label="زۆرترین چالاکی"
              value={topModule ? topModule.card.label : "—"}
              Icon={SparklesIcon}
              accent="bg-amber-500/15 text-amber-600 dark:text-amber-400"
              isLoading={overview.isInitialLoading}
            />
          </div>
        </div>

        <div
          className="pointer-events-none absolute -start-16 -top-16 size-56 rounded-full bg-primary/15 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -end-8 bottom-0 size-40 rounded-full bg-primary/10 blur-2xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute start-1/3 top-1/2 size-24 rounded-full bg-emerald-500/10 blur-2xl"
          aria-hidden
        />
      </header>

      {overview.failedLabels.length > 0 ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
          <CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <p className="text-sm">
            <span className="font-medium">هەندێک بەش بارنەکراون: </span>
            <span className="text-muted-foreground">
              {overview.failedLabels.join("، ")}
            </span>
          </p>
        </div>
      ) : null}

      {/* Module cards */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">بەشەکان</h2>
            <p className="text-muted-foreground mt-0.5 text-sm">
              ژمارەی تۆمارەکان لە هەر بەشێکدا
            </p>
          </div>
        </div>
        <DashboardKpiCards modules={overview.modules} />
      </section>

      {/* Activity + sidebar */}
      <section className="grid gap-6 xl:grid-cols-[1fr_340px]">
        {overview.isInitialLoading ? (
          <Skeleton className="h-[28rem] w-full rounded-2xl" />
        ) : (
          <DashboardRecentActivity items={overview.recentItems} />
        )}
        <div className="grid gap-6">
          <DashboardDistributionChart
            modules={overview.modules}
            isLoading={overview.isInitialLoading}
          />
          <DashboardQuickActions items={overview.quickActions} />
        </div>
      </section>

      {overview.generatedAt ? (
        <p className="text-muted-foreground text-center text-xs">
          دوایین نوێکردنەوە: {formatNewsDateLong(overview.generatedAt)}
        </p>
      ) : null}
    </div>
  )
}
