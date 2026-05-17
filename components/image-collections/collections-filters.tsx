"use client"

import { ArrowPathIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"

import { NS } from "@/components/image-collections/collections-strings"
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
import type { TopicDto } from "@/types/image-collections"
import type {
  CollectionsUiLanguageFilter,
  CollectionsUiTypeFilter,
} from "@/types/image-collections-ui"

const triggerClass =
  "border-border bg-background h-9 w-full min-h-9 rounded-md shadow-sm transition-[box-shadow,border-color] hover:border-primary/30 hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"

const searchInputClass =
  "h-9 min-h-9 border-none bg-transparent px-2 text-sm shadow-none focus-visible:border-transparent focus-visible:ring-0"

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
    <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center">
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
        value={typeFilter}
        onValueChange={(v) => onTypeChange(v as CollectionsUiTypeFilter)}
      >
        <SelectTrigger dir="rtl" className={cn(triggerClass, "md:w-40")}>
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
        <SelectTrigger dir="rtl" className={cn(triggerClass, "md:w-40")}>
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
