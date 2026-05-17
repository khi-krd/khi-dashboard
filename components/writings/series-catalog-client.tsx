"use client"

import { BookOpenIcon } from "@heroicons/react/24/outline"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

import {
  WritingBreadcrumbBar,
  dashboardWritingsCrumbHref,
} from "@/components/writings/writing-breadcrumb"
import { WritingErrorState } from "@/components/writings/writing-error-state"
import { NS } from "@/components/writings/writings-strings"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useSeriesParentsQuery } from "@/hooks/useWritings"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import { getWritingCoverUrl } from "@/types/writings-ui"
import type { WritingDto } from "@/types/writings"

function resolveSeriesId(parent: WritingDto): string | null {
  return (
    parent.seriesId?.trim() ||
    parent.seriesInfo?.seriesId?.trim() ||
    null
  )
}

function seriesTitle(parent: WritingDto): string {
  return (
    parent.seriesName?.trim() ||
    parent.ckbContent?.title?.trim() ||
    parent.kmrContent?.title?.trim() ||
    NS.dash
  )
}

function seriesBookCount(parent: WritingDto): number {
  return parent.seriesInfo?.totalBooks ?? parent.seriesTotalBooks ?? 1
}

function SeriesCard({ parent }: { parent: WritingDto }) {
  const [hovered, setHovered] = useState(false)
  const seriesId = resolveSeriesId(parent)
  const title = seriesTitle(parent)
  const total = seriesBookCount(parent)
  const cover = getWritingCoverUrl(parent)
  const hover = parent.hoverCoverUrl?.trim()
  const displaySrc = hovered && hover ? hover : cover

  if (!seriesId) return null

  return (
    <Link
      href={`/dashboard/writings/series/${encodeURIComponent(seriesId)}`}
      className="group border-border bg-card flex gap-4 overflow-hidden rounded-lg border p-4 transition-colors hover:bg-muted/20"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="bg-muted relative aspect-[2/3] w-[88px] shrink-0 overflow-hidden rounded-md">
        {displaySrc ? (
          <Image
            src={displaySrc}
            alt=""
            fill
            className="object-cover"
            unoptimized={displaySrc.startsWith("http")}
          />
        ) : (
          <div className="text-muted-foreground/50 flex h-full items-center justify-center">
            <BookOpenIcon className="size-8" aria-hidden />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-md text-[10px]">
            {NS.series.parent_badge}
          </Badge>
          <span className="text-muted-foreground text-xs">
            {NS.series.total_books(formatCkbDigits(total))}
          </span>
        </div>
        <h2 className="line-clamp-2 text-base font-semibold leading-snug">
          {title}
        </h2>
        {parent.ckbContent?.writer?.trim() ? (
          <p className="text-muted-foreground line-clamp-1 text-sm">
            {parent.ckbContent.writer}
          </p>
        ) : null}
        <span className="text-primary text-xs font-medium group-hover:underline">
          {NS.action.view_series_short}
        </span>
      </div>
    </Link>
  )
}

function SeriesCatalogSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-36 w-full rounded-lg" />
      ))}
    </div>
  )
}

export function SeriesCatalogClient() {
  const seriesQ = useSeriesParentsQuery()
  const parents = seriesQ.data ?? []

  return (
    <div dir="rtl" className="space-y-8 px-4 py-6 lg:px-6">
      <WritingBreadcrumbBar
        segments={[
          { label: NS.breadcrumb.dashboard, href: dashboardWritingsCrumbHref() },
          { label: NS.breadcrumb.writings, href: "/dashboard/writings" },
          { label: NS.breadcrumb.series },
        ]}
      />

      <header className="border-border/60 space-y-1.5 border-b pb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          {NS.series.page.title}
        </h1>
        <p className="text-muted-foreground max-w-xl text-sm">
          {NS.series.page.subtitle}
        </p>
      </header>

      {seriesQ.isError ? (
        <WritingErrorState onRetry={() => void seriesQ.refetch()} />
      ) : seriesQ.isLoading ? (
        <SeriesCatalogSkeleton />
      ) : parents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h2 className="text-foreground mb-2 text-base font-medium">
            {NS.series.empty.title}
          </h2>
          <p className="text-muted-foreground mb-4 max-w-md text-sm">
            {NS.series.empty.subtitle}
          </p>
          <Link
            href="/dashboard/writings"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-md")}
          >
            {NS.action.back}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {parents.map((parent) => {
            const key = resolveSeriesId(parent) ?? String(parent.id ?? Math.random())
            return <SeriesCard key={key} parent={parent} />
          })}
        </div>
      )}

      <Link
        href="/dashboard/writings"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-md")}
      >
        {NS.action.back}
      </Link>
    </div>
  )
}
