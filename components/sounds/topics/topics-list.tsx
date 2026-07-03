"use client"

import { PlusIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import {
  SoundBreadcrumbBar,
  dashboardSoundsCrumbHref,
} from "@/components/sounds/sound-breadcrumb"
import { SoundsErrorState } from "@/components/sounds/sound-error-state"
import { TopicCreateDialog } from "@/components/sounds/topics/topic-create-dialog"
import { TopicDeleteDialog } from "@/components/sounds/topics/topic-delete-dialog"
import { SoundsTopicsDataGrid } from "@/components/sounds/topics/topics-data-grid"
import { NS } from "@/components/sounds/sounds-strings"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  useDeleteTopicMutation,
  useSoundTopicsQuery,
  useSoundsListQuery,
} from "@/hooks/useSounds"
import { cn } from "@/lib/utils"
import type { TopicDto } from "@/types/sounds"
import type { SoundsListQueryKeyParts } from "@/types/sounds-ui"

const listParams: SoundsListQueryKeyParts = {
  page: 0,
  size: 500,
  keyword: "",
  stateFilter: "all",
  typeFilter: null,
  topicId: null,
  languageFilter: "all",
}

export function TopicsList() {
  const topicsQ = useSoundTopicsQuery()
  const soundsQ = useSoundsListQuery(listParams)

  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<TopicDto | null>(null)
  const deleteMut = useDeleteTopicMutation()

  const usageByTopic = useMemo(() => {
    const map = new Map<number, number>()
    for (const s of soundsQ.data?.content ?? []) {
      if (s.topicId == null) continue
      map.set(s.topicId, (map.get(s.topicId) ?? 0) + 1)
    }
    return map
  }, [soundsQ.data?.content])

  const topics = topicsQ.data ?? []
  const isLoading = topicsQ.isLoading || topicsQ.isFetching

  return (
    <div dir="rtl" className="space-y-8 px-4 py-6 lg:px-6">
      <SoundBreadcrumbBar
        segments={[
          { label: NS.breadcrumb.dashboard, href: dashboardSoundsCrumbHref() },
          { label: NS.breadcrumb.sounds, href: "/dashboard/sounds" },
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
        <SoundsErrorState onRetry={() => void topicsQ.refetch()} />
      ) : (
        <>
          {!isLoading && topics.length === 0 ? (
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
            <SoundsTopicsDataGrid
              rows={topics}
              usageByTopic={usageByTopic}
              isLoading={isLoading}
              onDelete={setDeleteTarget}
            />
          )}
        </>
      )}

      <Link
        href="/dashboard/sounds"
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
        soundCount={deleteTarget ? (usageByTopic.get(deleteTarget.id) ?? 0) : 0}
        isPending={deleteMut.isPending}
        onConfirm={() => {
          if (!deleteTarget) return
          const id = deleteTarget.id
          deleteMut.mutate(id, {
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
