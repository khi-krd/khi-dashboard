"use client"

import { NS } from "@/components/videos/videos-strings"
import {
  MultiTopicCombobox,
  type PendingTopic,
} from "@/components/shared/multi-topic-combobox"
import { useVideoTopicsQuery } from "@/hooks/useVideos"
import type { TopicDto } from "@/types/videos"

export function VideoTopicCombobox({
  selectedIds,
  pending,
  onToggle,
  onRemovePending,
  onCreateInline,
  onClearAll,
}: {
  selectedIds: number[]
  pending: PendingTopic[]
  onToggle: (t: TopicDto) => void
  onRemovePending: (index: number) => void
  onCreateInline: (names: { nameCkb: string; nameKmr: string }) => void
  onClearAll: () => void
}) {
  const topicsQ = useVideoTopicsQuery()
  return (
    <MultiTopicCombobox
      topics={topicsQ.data ?? []}
      loading={topicsQ.isLoading}
      selectedIds={selectedIds}
      pending={pending}
      onToggle={onToggle}
      onRemovePending={onRemovePending}
      onCreateInline={onCreateInline}
      onClearAll={onClearAll}
      triggerPlaceholder={NS.filter.all_topics}
      addLabel={NS.action.new_topic}
      applyLabel={NS.action.add}
      ckbPlaceholder={NS.topic.name_ckb}
      kmrPlaceholder={NS.topic.name_kmr}
      helperText={NS.field.topic_helper}
    />
  )
}
