"use client"

import { TopicsDataGrid, type TopicRow } from "@/components/shared/topics-data-grid"
import { NS } from "@/components/sounds/sounds-strings"

export function SoundsTopicsDataGrid({
  rows,
  usageByTopic,
  isLoading,
  onDelete,
}: {
  rows: TopicRow[]
  usageByTopic: Map<number, number>
  isLoading: boolean
  onDelete: (topic: TopicRow) => void
}) {
  return (
    <TopicsDataGrid
      rows={rows}
      usageByTopic={usageByTopic}
      isLoading={isLoading}
      onDelete={onDelete}
      filterListHref={(id) => `/dashboard/sounds?topic=${id}`}
      labels={{
        dash: NS.dash,
        nameCkb: NS.topic.name_ckb,
        nameKmr: NS.topic.name_kmr,
        actions: NS.col.actions,
        delete: NS.action.delete,
        usage: NS.topic.usage,
        emptyTitle: NS.topics.empty.title,
        emptySubtitle: NS.topics.empty.subtitle,
      }}
    />
  )
}
