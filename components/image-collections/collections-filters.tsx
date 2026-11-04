"use client"

import { NS } from "@/components/image-collections/collections-strings"
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
import type { TopicDto } from "@/types/image-collections"
import type {
  CollectionsUiLanguageFilter,
  CollectionsUiTypeFilter,
} from "@/types/image-collections-ui"

function typeLabel(v: CollectionsUiTypeFilter) {
  switch (v) {
    case "all":
      return NS.filter.all_types
    case "SINGLE":
      return NS.type.single
    case "GALLERY":
      return NS.type.gallery
    case "PHOTO_STORY":
      return NS.type.photo_story
    default:
      return NS.filter.all_types
  }
}

function langLabel(v: CollectionsUiLanguageFilter) {
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

export function CollectionsFiltersToolbar({
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
  typeFilter: CollectionsUiTypeFilter
  onTypeChange: (v: CollectionsUiTypeFilter) => void
  topicId: number | null
  topics: TopicDto[]
  onTopicChange: (id: number | null) => void
  language: CollectionsUiLanguageFilter
  onLanguageChange: (v: CollectionsUiLanguageFilter) => void
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
        onValueChange={(v) => onTypeChange(v as CollectionsUiTypeFilter)}
      >
        <SelectTrigger dir="rtl" className={cn(filterSelectTriggerClass(typeFilter !== "all"), "md:w-40")}>
          <SelectValue>{typeLabel(typeFilter)}</SelectValue>
        </SelectTrigger>
        <SelectContent dir="rtl">
          {(["all", "SINGLE", "GALLERY", "PHOTO_STORY"] as const).map((t) => (
            <SelectItem key={t} value={t}>
              {typeLabel(t)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={topicId == null ? "all" : String(topicId)}
        onValueChange={(v) => onTopicChange(v === "all" ? null : Number(v))}
      >
        <SelectTrigger dir="rtl" className={cn(filterSelectTriggerClass(topicId != null), "md:w-40")}>
          <SelectValue>
            {topicId == null
              ? NS.filter.all_topics
              : (topics.find((t) => t.id === topicId)?.nameCkb ??
                NS.filter.all_topics)}
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
        onValueChange={(v) => onLanguageChange(v as CollectionsUiLanguageFilter)}
      >
        <SelectTrigger dir="rtl" className={cn(filterSelectTriggerClass(language !== "all"), "md:w-32")}>
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
