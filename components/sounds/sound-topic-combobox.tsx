"use client"

import { NS } from "@/components/sounds/sounds-strings"
import {
  MultiTopicCombobox,
  type PendingTopic,
} from "@/components/shared/multi-topic-combobox"
import { useSoundTopicsQuery } from "@/hooks/useSounds"
import type { TopicDto } from "@/types/sounds"

export function SoundTopicCombobox({
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
  const topicsQ = useSoundTopicsQuery()
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
      helperText={NS.topic.helper}
    />
  )
}
