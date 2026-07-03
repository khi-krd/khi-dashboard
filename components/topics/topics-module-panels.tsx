"use client"

import { PlusIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { CollectionErrorState } from "@/components/image-collections/collection-error-state"
import { NS as CollectionsNS } from "@/components/image-collections/collections-strings"
import { TopicCreateDialog as CollectionTopicCreateDialog } from "@/components/image-collections/topics/topic-create-dialog"
import { TopicDeleteDialog as CollectionTopicDeleteDialog } from "@/components/image-collections/topics/topic-delete-dialog"
import { CollectionsTopicsDataGrid } from "@/components/image-collections/topics/topics-data-grid"
import { SoundsErrorState } from "@/components/sounds/sound-error-state"
import { NS as SoundsNS } from "@/components/sounds/sounds-strings"
import { TopicCreateDialog as SoundTopicCreateDialog } from "@/components/sounds/topics/topic-create-dialog"
import { TopicDeleteDialog as SoundTopicDeleteDialog } from "@/components/sounds/topics/topic-delete-dialog"
import { SoundsTopicsDataGrid } from "@/components/sounds/topics/topics-data-grid"
import { TOPICS_NS } from "@/components/topics/topics-strings"
import { VideosErrorState } from "@/components/videos/video-error-state"
import { NS as VideosNS } from "@/components/videos/videos-strings"
import { TopicCreateDialog as VideoTopicCreateDialog } from "@/components/videos/topics/topic-create-dialog"
import { TopicDeleteDialog as VideoTopicDeleteDialog } from "@/components/videos/topics/topic-delete-dialog"
import { VideosTopicsDataGrid } from "@/components/videos/topics/topics-data-grid"
import { WritingErrorState } from "@/components/writings/writing-error-state"
import { NS as WritingsNS } from "@/components/writings/writings-strings"
import { TopicCreateDialog as WritingTopicCreateDialog } from "@/components/writings/topics/topic-create-dialog"
import { TopicDeleteDialog as WritingTopicDeleteDialog } from "@/components/writings/topics/topic-delete-dialog"
import { WritingsTopicsDataGrid } from "@/components/writings/topics/topics-data-grid"
import { Button } from "@/components/ui/button"
import {
  useCollectionTopicsQuery,
  useCollectionsListQuery,
  useDeleteTopicMutation as useDeleteCollectionTopicMutation,
} from "@/hooks/useImageCollections"
import {
  useDeleteTopicMutation as useDeleteSoundTopicMutation,
  useSoundTopicsQuery,
  useSoundsListQuery,
} from "@/hooks/useSounds"
import {
  useDeleteTopicMutation as useDeleteVideoTopicMutation,
  useVideoTopicsQuery,
  useVideosListQuery,
} from "@/hooks/useVideos"
import {
  useDeleteTopicMutation as useDeleteWritingTopicMutation,
  useWritingTopicsQuery,
  useWritingsListQuery,
} from "@/hooks/useWritings"
import type { TopicDto as CollectionTopicDto } from "@/types/image-collections"
import type { CollectionsListQueryKeyParts } from "@/types/image-collections-ui"
import type { TopicDto as SoundTopicDto } from "@/types/sounds"
import type { SoundsListQueryKeyParts } from "@/types/sounds-ui"
import type { TopicDto as VideoTopicDto } from "@/types/videos"
import type { TopicDto as WritingTopicDto } from "@/types/writings"
import type { WritingsListQueryKeyParts } from "@/types/writings-ui"

const soundsListParams: SoundsListQueryKeyParts = {
  page: 0,
  size: 500,
  keyword: "",
  stateFilter: "all",
  typeFilter: null,
  topicId: null,
  languageFilter: "all",
}

const writingsListParams: WritingsListQueryKeyParts = {
  page: 0,
  size: 500,
  keyword: "",
  searchMode: "keyword",
  topicId: null,
  languageFilter: "all",
}

const collectionsListParams: CollectionsListQueryKeyParts = {
  page: 0,
  size: 500,
  typeFilter: "all",
  topicId: null,
  languageFilter: "all",
}

function TopicsModuleToolbar({
  listHref,
  onCreate,
  createLabel,
}: {
  listHref: string
  onCreate: () => void
  createLabel: string
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link
        href={listHref}
        className="text-muted-foreground hover:text-foreground text-xs transition-colors"
      >
        {TOPICS_NS.link.open_module}
      </Link>
      <Button type="button" onClick={onCreate} size="sm" className="gap-1.5">
        <PlusIcon className="size-4" />
        {createLabel}
      </Button>
    </div>
  )
}

export function VideoTopicsModulePanel() {
  const topicsQ = useVideoTopicsQuery()
  const videosQ = useVideosListQuery({
    page: 0,
    size: 500,
    keyword: "",
    searchMode: "default",
  })
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<VideoTopicDto | null>(null)
  const deleteMut = useDeleteVideoTopicMutation()

  const usageByTopic = useMemo(() => {
    const map = new Map<number, number>()
    for (const v of videosQ.data?.content ?? []) {
      if (v.topicId == null) continue
      map.set(v.topicId, (map.get(v.topicId) ?? 0) + 1)
    }
    return map
  }, [videosQ.data?.content])

  const topics = topicsQ.data ?? []
  const isLoading = topicsQ.isLoading || topicsQ.isFetching

  return (
    <div className="space-y-4">
      <TopicsModuleToolbar
        listHref="/dashboard/videos"
        onCreate={() => setCreateOpen(true)}
        createLabel={VideosNS.action.new_topic}
      />
      {topicsQ.isError ? (
        <VideosErrorState onRetry={() => void topicsQ.refetch()} />
      ) : !isLoading && topics.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <h3 className="text-foreground mb-2 text-sm font-medium">
            {VideosNS.topics.empty.title}
          </h3>
          <p className="text-muted-foreground mb-4 max-w-md text-sm">
            {VideosNS.topics.empty.subtitle}
          </p>
          <Button type="button" onClick={() => setCreateOpen(true)}>
            {VideosNS.action.new_topic}
          </Button>
        </div>
      ) : (
        <VideosTopicsDataGrid
          rows={topics}
          usageByTopic={usageByTopic}
          isLoading={isLoading}
          onDelete={setDeleteTarget}
        />
      )}
      <VideoTopicCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <VideoTopicDeleteDialog
        open={deleteTarget != null}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null)
        }}
        target={deleteTarget}
        videoCount={deleteTarget ? (usageByTopic.get(deleteTarget.id) ?? 0) : 0}
        isPending={deleteMut.isPending}
        onConfirm={() => {
          if (!deleteTarget) return
          deleteMut.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success(VideosNS.toast.topic_deleted)
              setDeleteTarget(null)
            },
            onError: () => toast.error(VideosNS.error.generic),
          })
        }}
      />
    </div>
  )
}

export function SoundTopicsModulePanel() {
  const topicsQ = useSoundTopicsQuery()
  const soundsQ = useSoundsListQuery(soundsListParams)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<SoundTopicDto | null>(null)
  const deleteMut = useDeleteSoundTopicMutation()

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
    <div className="space-y-4">
      <TopicsModuleToolbar
        listHref="/dashboard/sounds"
        onCreate={() => setCreateOpen(true)}
        createLabel={SoundsNS.action.new_topic}
      />
      {topicsQ.isError ? (
        <SoundsErrorState onRetry={() => void topicsQ.refetch()} />
      ) : !isLoading && topics.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <h3 className="text-foreground mb-2 text-sm font-medium">
            {SoundsNS.topics.empty.title}
          </h3>
          <p className="text-muted-foreground mb-4 max-w-md text-sm">
            {SoundsNS.topics.empty.subtitle}
          </p>
          <Button type="button" onClick={() => setCreateOpen(true)}>
            {SoundsNS.action.new_topic}
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
      <SoundTopicCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <SoundTopicDeleteDialog
        open={deleteTarget != null}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null)
        }}
        target={deleteTarget}
        soundCount={deleteTarget ? (usageByTopic.get(deleteTarget.id) ?? 0) : 0}
        isPending={deleteMut.isPending}
        onConfirm={() => {
          if (!deleteTarget) return
          deleteMut.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success(SoundsNS.toast.topic_deleted)
              setDeleteTarget(null)
            },
            onError: () => toast.error(SoundsNS.error.generic),
          })
        }}
      />
    </div>
  )
}

export function WritingTopicsModulePanel() {
  const topicsQ = useWritingTopicsQuery()
  const writingsQ = useWritingsListQuery(writingsListParams)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<WritingTopicDto | null>(null)
  const deleteMut = useDeleteWritingTopicMutation()

  const usageByTopic = useMemo(() => {
    const map = new Map<number, number>()
    for (const w of writingsQ.data?.content ?? []) {
      if (w.topicId == null) continue
      map.set(w.topicId, (map.get(w.topicId) ?? 0) + 1)
    }
    return map
  }, [writingsQ.data?.content])

  const topics = topicsQ.data ?? []
  const isLoading = topicsQ.isLoading || topicsQ.isFetching

  return (
    <div className="space-y-4">
      <TopicsModuleToolbar
        listHref="/dashboard/writings"
        onCreate={() => setCreateOpen(true)}
        createLabel={WritingsNS.action.new_topic}
      />
      {topicsQ.isError ? (
        <WritingErrorState onRetry={() => void topicsQ.refetch()} />
      ) : !isLoading && topics.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <h3 className="text-foreground mb-2 text-sm font-medium">
            {WritingsNS.topics.empty.title}
          </h3>
          <p className="text-muted-foreground mb-4 max-w-md text-sm">
            {WritingsNS.topics.empty.subtitle}
          </p>
          <Button type="button" onClick={() => setCreateOpen(true)}>
            {WritingsNS.action.new_topic}
          </Button>
        </div>
      ) : (
        <WritingsTopicsDataGrid
          rows={topics}
          usageByTopic={usageByTopic}
          isLoading={isLoading}
          onDelete={setDeleteTarget}
        />
      )}
      <WritingTopicCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <WritingTopicDeleteDialog
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
              toast.success(WritingsNS.toast.topic_deleted)
              setDeleteTarget(null)
            },
            onError: () => toast.error(WritingsNS.error.generic),
          })
        }}
      />
    </div>
  )
}

export function CollectionTopicsModulePanel() {
  const topicsQ = useCollectionTopicsQuery()
  const collectionsQ = useCollectionsListQuery(collectionsListParams)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CollectionTopicDto | null>(null)
  const deleteMut = useDeleteCollectionTopicMutation()

  const usageByTopic = useMemo(() => {
    const map = new Map<number, number>()
    for (const c of collectionsQ.data?.content ?? []) {
      if (c.topicId == null) continue
      map.set(c.topicId, (map.get(c.topicId) ?? 0) + 1)
    }
    return map
  }, [collectionsQ.data?.content])

  const topics = topicsQ.data ?? []
  const isLoading = topicsQ.isLoading || topicsQ.isFetching

  return (
    <div className="space-y-4">
      <TopicsModuleToolbar
        listHref="/dashboard/image-collections"
        onCreate={() => setCreateOpen(true)}
        createLabel={CollectionsNS.action.new_topic}
      />
      {topicsQ.isError ? (
        <CollectionErrorState onRetry={() => void topicsQ.refetch()} />
      ) : !isLoading && topics.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <h3 className="text-foreground mb-2 text-sm font-medium">
            {CollectionsNS.topics.empty.title}
          </h3>
          <p className="text-muted-foreground mb-4 max-w-md text-sm">
            {CollectionsNS.topics.empty.subtitle}
          </p>
          <Button type="button" onClick={() => setCreateOpen(true)}>
            {CollectionsNS.action.new_topic}
          </Button>
        </div>
      ) : (
        <CollectionsTopicsDataGrid
          rows={topics}
          usageByTopic={usageByTopic}
          isLoading={isLoading}
          onDelete={setDeleteTarget}
        />
      )}
      <CollectionTopicCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <CollectionTopicDeleteDialog
        open={deleteTarget != null}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null)
        }}
        target={deleteTarget}
        collectionCount={
          deleteTarget ? (usageByTopic.get(deleteTarget.id) ?? 0) : 0
        }
        isPending={deleteMut.isPending}
        onConfirm={() => {
          if (!deleteTarget) return
          deleteMut.mutate(deleteTarget.id, {
            onSuccess: () => {
              toast.success(CollectionsNS.toast.topic_deleted)
              setDeleteTarget(null)
            },
            onError: () => toast.error(CollectionsNS.error.generic),
          })
        }}
      />
    </div>
  )
}
