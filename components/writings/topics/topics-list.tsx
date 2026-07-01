"use client"

import Link from "next/link"
import { useMemo } from "react"

import {
  WritingBreadcrumbBar,
  dashboardWritingsCrumbHref,
} from "@/components/writings/writing-breadcrumb"
import { WritingErrorState } from "@/components/writings/writing-error-state"
import { NS } from "@/components/writings/writings-strings"
import { buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useWritingTopicsQuery, useWritingsListQuery } from "@/hooks/useWritings"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type { WritingsListQueryKeyParts } from "@/types/writings-ui"

const listParams: WritingsListQueryKeyParts = {
  page: 0,
  size: 500,
  keyword: "",
  searchMode: "keyword",
  topicId: null,
  languageFilter: "all",
}

function TopicsTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-md" />
      ))}
    </div>
  )
}

export function TopicsList() {
  const topicsQ = useWritingTopicsQuery()
  const writingsQ = useWritingsListQuery(listParams)

  const usageByTopic = useMemo(() => {
    const map = new Map<number, number>()
    for (const w of writingsQ.data?.content ?? []) {
      if (w.topicId == null) continue
      map.set(w.topicId, (map.get(w.topicId) ?? 0) + 1)
    }
    return map
  }, [writingsQ.data?.content])

  const topics = topicsQ.data ?? []
  const isLoading = topicsQ.isLoading

  return (
    <div dir="rtl" className="space-y-8 px-4 py-6 lg:px-6">
      <WritingBreadcrumbBar
        segments={[
          { label: NS.breadcrumb.dashboard, href: dashboardWritingsCrumbHref() },
          { label: NS.breadcrumb.writings, href: "/dashboard/writings" },
          { label: NS.breadcrumb.topics },
        ]}
      />

      <header className="border-border/60 flex flex-col gap-4 border-b pb-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            {NS.topics.page.title}
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm">
            {NS.topics.page.subtitle}
          </p>
          <p className="text-muted-foreground max-w-xl text-xs">
            {NS.topics.page.readonly_note}
          </p>
        </div>
      </header>

      {topicsQ.isError ? (
        <WritingErrorState onRetry={() => void topicsQ.refetch()} />
      ) : isLoading ? (
        <TopicsTableSkeleton />
      ) : topics.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h2 className="text-foreground mb-2 text-base font-medium">
            {NS.topics.empty.title}
          </h2>
          <p className="text-muted-foreground mb-4 max-w-md text-sm">
            {NS.topics.empty.subtitle}
          </p>
        </div>
      ) : (
        <div className="border-border overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground text-xs">
              <tr>
                <th className="px-4 py-2 text-start font-medium">
                  {NS.topic.name_ckb}
                </th>
                <th className="px-4 py-2 text-start font-medium">
                  {NS.topic.name_kmr}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {topics.map((topic) => {
                const count = usageByTopic.get(topic.id) ?? 0
                return (
                  <tr key={topic.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/writings?topic=${topic.id}`}
                        className="text-primary font-medium hover:underline"
                      >
                        {topic.nameCkb || NS.dash}
                      </Link>
                      <p className="text-muted-foreground mt-0.5 text-xs">
                        {NS.topic.usage(formatCkbDigits(count))}
                      </p>
                    </td>
                    <td className="text-muted-foreground px-4 py-3" dir="ltr">
                      {topic.nameKmr || NS.dash}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
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
