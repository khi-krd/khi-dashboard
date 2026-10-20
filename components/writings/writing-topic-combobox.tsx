"use client"

import { NS } from "@/components/writings/writings-strings"
import {
  MultiTopicCombobox,
  type PendingTopic,
} from "@/components/shared/multi-topic-combobox"
import { useWritingTopicsQuery } from "@/hooks/useWritings"
import type { TopicDto } from "@/types/writings"

export function WritingTopicCombobox({
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
  const topicsQ = useWritingTopicsQuery()
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
      ckbPlaceholder={NS.lang.ckb}
      kmrPlaceholder={NS.lang.kmr}
      helperText={NS.field.topic_helper}
    />
  )
}
