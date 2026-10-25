"use client"

import { TopicsDataGrid, type TopicRow } from "@/components/shared/topics-data-grid"
import { NS } from "@/components/image-collections/collections-strings"

export function CollectionsTopicsDataGrid({
  rows,
  usageByTopic,
  isLoading,
  onDelete,
  onEdit,
}: {
  rows: TopicRow[]
  usageByTopic: Map<number, number>
  isLoading: boolean
  onDelete: (topic: TopicRow) => void
  onEdit: (topic: TopicRow) => void
}) {
  return (
    <TopicsDataGrid
      rows={rows}
      usageByTopic={usageByTopic}
      isLoading={isLoading}
      onDelete={onDelete}
      onEdit={onEdit}
      filterListHref={(id) => `/dashboard/image-collections?topic=${id}`}
      labels={{
        dash: NS.dash,
        nameCkb: NS.topic.name_ckb,
        nameKmr: NS.topic.name_kmr,
        actions: NS.col.actions,
        delete: NS.action.delete,
        edit: NS.action.edit,
        usage: NS.topic.usage,
        emptyTitle: NS.topics.empty.title,
        emptySubtitle: NS.topics.empty.subtitle,
      }}
    />
  )
}
