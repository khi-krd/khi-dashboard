"use client"

import { ArrowPathIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"

import { NS } from "@/components/sounds/sounds-strings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

const triggerClass =
  "border-border bg-background h-9 w-full min-h-9 rounded-md shadow-sm transition-[box-shadow,border-color] hover:border-primary/30 hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"

const searchInputClass =
  "h-9 min-h-9 border-none bg-transparent px-2 text-sm shadow-none focus-visible:border-transparent focus-visible:ring-0"

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
    <div
      className={cn(
        "flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center",
      )}
    >
      <div className="border-border bg-background flex min-h-9 min-w-0 flex-1 items-center gap-2 rounded-md border px-2 shadow-sm md:min-w-[12rem]">
        <MagnifyingGlassIcon
          className="text-muted-foreground size-4 shrink-0"
          aria-hidden
        />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={NS.filter.search_placeholder}
          className={searchInputClass}
        />
      </div>
      <Select
        value={stateFilter}
        onValueChange={(v) => onStateChange(v as SoundsUiStateFilter)}
      >
        <SelectTrigger dir="rtl" className={cn(triggerClass, "md:w-32")}>
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
        <SelectTrigger dir="rtl" className={cn(triggerClass, "md:w-36")}>
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
        <SelectTrigger dir="rtl" className={cn(triggerClass, "md:w-40")}>
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
        <SelectTrigger dir="rtl" className={cn(triggerClass, "md:w-32")}>
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
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground h-9 shrink-0 gap-1.5"
          onClick={onReset}
        >
          <ArrowPathIcon className="size-4" aria-hidden />
          {NS.action.reset_filters}
        </Button>
      ) : null}
    </div>
  )
}
