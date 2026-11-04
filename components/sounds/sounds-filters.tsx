"use client"

import { NS } from "@/components/sounds/sounds-strings"
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
import type { TopicDto } from "@/types/sounds"
import type {
  SoundsUiLanguageFilter,
  SoundsUiStateFilter,
} from "@/types/sounds-ui"

function stateLabel(v: SoundsUiStateFilter) {
  switch (v) {
    case "all":
      return NS.filter.all_states
    case "single":
      return NS.filter.state_single
    case "multi":
      return NS.filter.state_multi
    case "album_of_memories":
      return NS.filter.state_album
    default:
      return NS.filter.all_states
  }
}

function langLabel(v: SoundsUiLanguageFilter) {
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

export function SoundsFiltersToolbar({
  search,
  onSearchChange,
  stateFilter,
  onStateChange,
  typeFilter,
  typeOptions,
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
  stateFilter: SoundsUiStateFilter
  onStateChange: (v: SoundsUiStateFilter) => void
  typeFilter: string | null
  typeOptions: string[]
  onTypeChange: (v: string | null) => void
  topicId: number | null
  topics: TopicDto[]
  onTopicChange: (id: number | null) => void
  language: SoundsUiLanguageFilter
  onLanguageChange: (v: SoundsUiLanguageFilter) => void
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
        value={stateFilter}
        onValueChange={(v) => onStateChange(v as SoundsUiStateFilter)}
      >
        <SelectTrigger dir="rtl" className={cn(filterSelectTriggerClass(stateFilter !== "all"), "md:w-32")}>
          <SelectValue>{stateLabel(stateFilter)}</SelectValue>
        </SelectTrigger>
        <SelectContent dir="rtl">
          {(
            ["all", "single", "multi", "album_of_memories"] as const
          ).map((s) => (
            <SelectItem key={s} value={s}>
              {stateLabel(s)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={typeFilter ?? "all"}
        onValueChange={(v) => onTypeChange(v === "all" ? null : v)}
      >
        <SelectTrigger dir="rtl" className={cn(filterSelectTriggerClass(typeFilter != null), "md:w-36")}>
          <SelectValue>
            {typeFilter ?? NS.filter.all_types}
          </SelectValue>
        </SelectTrigger>
        <SelectContent dir="rtl">
          <SelectItem value="all">{NS.filter.all_types}</SelectItem>
          {typeOptions.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
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
        <SelectTrigger dir="rtl" className={cn(filterSelectTriggerClass(topicId != null), "md:w-40")}>
          <SelectValue>
            {topicId == null
              ? NS.filter.all_topics
              : topics.find((t) => t.id === topicId)?.nameCkb ??
                NS.filter.all_topics}
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
        onValueChange={(v) => onLanguageChange(v as SoundsUiLanguageFilter)}
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
