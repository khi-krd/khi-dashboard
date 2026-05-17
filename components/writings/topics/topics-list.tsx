"use client"

import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { TopicCreateDialog } from "@/components/writings/topics/topic-create-dialog"
import { TopicDeleteDialog } from "@/components/writings/topics/topic-delete-dialog"
import {
  WritingBreadcrumbBar,
  dashboardWritingsCrumbHref,
} from "@/components/writings/writing-breadcrumb"
import { WritingErrorState } from "@/components/writings/writing-error-state"
import { NS } from "@/components/writings/writings-strings"
import { Button, buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useDeleteTopicMutation,
  useWritingTopicsQuery,
  useWritingsListQuery,
} from "@/hooks/useWritings"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type { TopicDto } from "@/types/writings"
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

  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<TopicDto | null>(null)
  const deleteMut = useDeleteTopicMutation()

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

      <header className="border-border/60 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            {NS.topics.page.title}
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm">
            {NS.topics.page.subtitle}
          </p>
        </div>
        <Button type="button" onClick={() => setCreateOpen(true)} className="gap-1.5">
          <PlusIcon className="size-4" />
          {NS.action.new_topic}
        </Button>
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
          <Button type="button" onClick={() => setCreateOpen(true)}>
            {NS.action.new_topic}
          </Button>
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
                <th className="px-4 py-2 text-start font-medium">
                  {NS.col.actions}
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
                    <td className="px-4 py-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteTarget(topic)}
                      >
                        <TrashIcon className="size-4" />
                        {NS.action.delete}
                      </Button>
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

      <TopicCreateDialog open={createOpen} onOpenChange={setCreateOpen} />

      <TopicDeleteDialog
        open={deleteTarget != null}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null)
        }}
        target={deleteTarget}
        writingCount={deleteTarget ? (usageByTopic.get(deleteTarget.id) ?? 0) : 0}
        isPending={deleteMut.isPending}
        onConfirm={() => {
          if (!deleteTarget) return
          deleteMut.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success(NS.toast.topic_deleted)
              setDeleteTarget(null)
            },
            onError: () => toast.error(NS.error.generic),
          })
        }}
      />
    </div>
  )
}
