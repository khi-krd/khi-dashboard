"use client"

import { Badge } from "@/components/reui/badge"
import { NS } from "@/components/news/news-strings"
import type { NewsDto } from "@/types/news"
import { newsRowStatus } from "@/types/news-ui"

export function NewsStatusBadge({
  news,
}: {
  news: Pick<NewsDto, "datePublished">
}) {
  const s = newsRowStatus(news)
  if (s === "scheduled")
    return (
      <Badge variant="primary-light" size="xs" radius="full">
        {NS.status.scheduled}
      </Badge>
    )
  if (s === "draft")
    return (
      <Badge variant="secondary" size="xs" radius="full">
        {NS.status.draft}
      </Badge>
    )
  if (s === "archived")
    return (
      <Badge variant="invert-light" size="xs" radius="full">
        {NS.status.archived}
      </Badge>
    )
  return (
    <Badge variant="primary-light" size="xs" radius="full">
      {NS.status.published}
    </Badge>
  )
}
