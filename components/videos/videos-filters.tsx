"use client"

import { NS } from "@/components/videos/videos-strings"
import {
  FilterBar,
  FilterReset,
  FilterSearch,
  filterSelectTriggerClass,
} from "@/components/shared/filter-bar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { TopicDto } from "@/types/videos"
import type {
  VideosUiLanguageFilter,
  VideosUiTypeFilter,
} from "@/types/videos-ui"

function typeLabel(v: VideosUiTypeFilter) {
  switch (v) {
    case "all":
      return NS.filter.all_types
    case "film":
      return NS.filter.type_film
    case "clip":
      return NS.filter.type_clip
    case "album":
      return NS.filter.type_album
    default:
      return NS.filter.all_types
  }
}

function langLabel(v: VideosUiLanguageFilter) {
  switch (v) {
    case "all":
      return NS.filter.all_languages
    case "ckb_only":
      return NS.filter.lang_ckb_only
    case "kmr_only":
      return NS.filter.lang_kmr_only
    case "both":
      return NS.filter.lang_both
    default:
      return NS.filter.all_languages
  }
}

export function VideosFiltersToolbar({
  search,
  onSearchChange,
  typeFilter,
  onTypeChange,
  topicId,
  topics,
  onTopicChange,
  language,
  onLanguageChange,
  showReset,
  onReset,
}: {
  search: string
  onSearchChange: (v: string) => void
  typeFilter: VideosUiTypeFilter
  onTypeChange: (v: VideosUiTypeFilter) => void
  topicId: number | null
  topics: TopicDto[]
  onTopicChange: (id: number | null) => void
  language: VideosUiLanguageFilter
  onLanguageChange: (v: VideosUiLanguageFilter) => void
  showReset: boolean
  onReset: () => void
}) {
  return (
    <FilterBar>
      <FilterSearch
        value={search}
        onChange={onSearchChange}
        placeholder={NS.filter.search_placeholder}
      />
      <Select
        value={typeFilter}
        onValueChange={(v) => onTypeChange(v as VideosUiTypeFilter)}
      >
        <SelectTrigger dir="rtl" className={cn(filterSelectTriggerClass(typeFilter !== "all"), "md:w-36")}>
          <SelectValue>{typeLabel(typeFilter)}</SelectValue>
        </SelectTrigger>
        <SelectContent dir="rtl">
          {(["all", "film", "clip", "album"] as const).map((t) => (
            <SelectItem key={t} value={t}>
              {typeLabel(t)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={topicId == null ? "all" : String(topicId)}
        onValueChange={(v) =>
          onTopicChange(v === "all" ? null : Number(v))
        }
      >
        <SelectTrigger dir="rtl" className={cn(filterSelectTriggerClass(topicId != null), "md:w-44")}>
          <SelectValue>
            {topicId == null
              ? NS.filter.all_topics
              : topics.find((t) => t.id === topicId)?.nameCkb ?? NS.filter.all_topics}
          </SelectValue>
        </SelectTrigger>
        <SelectContent dir="rtl">
          <SelectItem value="all">{NS.filter.all_topics}</SelectItem>
          {topics.map((t) => (
            <SelectItem key={t.id} value={String(t.id)}>
              <span className="block">{t.nameCkb ?? NS.dash}</span>
              {t.nameKmr ? (
                <span className="text-muted-foreground block text-xs">
                  {t.nameKmr}
                </span>
              ) : null}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={language}
        onValueChange={(v) => onLanguageChange(v as VideosUiLanguageFilter)}
      >
        <SelectTrigger dir="rtl" className={cn(filterSelectTriggerClass(language !== "all"), "md:w-36")}>
          <SelectValue>{langLabel(language)}</SelectValue>
        </SelectTrigger>
        <SelectContent dir="rtl">
          {(["all", "ckb_only", "kmr_only", "both"] as const).map((l) => (
            <SelectItem key={l} value={l}>
              {langLabel(l)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showReset ? (
        <FilterReset onClick={onReset} label={NS.action.reset_filters} />
      ) : null}
    </FilterBar>
  )
}
