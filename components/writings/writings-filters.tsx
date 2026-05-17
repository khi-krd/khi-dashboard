"use client"

import { ArrowPathIcon, ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { useState } from "react"

import { GENRE_LABEL_CKB, NS } from "@/components/writings/writings-strings"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GENRE_GROUPS } from "@/lib/writings-genres"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type { BookGenre, TopicDto } from "@/types/writings"
import type {
  WritingsSearchMode,
  WritingsUiInstituteFilter,
  WritingsUiLanguageFilter,
} from "@/types/writings-ui"

const triggerClass =
  "border-border bg-background h-9 w-full min-h-9 rounded-md shadow-sm transition-[box-shadow,border-color] hover:border-primary/30 hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"

const searchInputClass =
  "h-9 min-h-9 border-none bg-transparent px-2 text-sm shadow-none focus-visible:border-transparent focus-visible:ring-0"

const SEARCH_MODES: WritingsSearchMode[] = ["writer", "tag", "keyword"]

function searchModeLabel(mode: WritingsSearchMode) {
  return NS.filter.search_mode[mode]
}

function langLabel(v: WritingsUiLanguageFilter) {
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

function instituteLabel(v: WritingsUiInstituteFilter) {
  switch (v) {
    case "all":
      return NS.filter.all_institute
    case "institute_only":
      return NS.filter.only_institute
    case "external_only":
      return NS.filter.only_external
    default:
      return NS.filter.all_institute
  }
}

function GenresMultiSelect({
  selected,
  onChange,
}: {
  selected: BookGenre[]
  onChange: (genres: BookGenre[]) => void
}) {
  const [open, setOpen] = useState(false)

  const toggle = (g: BookGenre) => {
    if (selected.includes(g)) {
      onChange(selected.filter((x) => x !== g))
    } else {
      onChange([...selected, g])
    }
  }

  const label =
    selected.length === 0
      ? NS.filter.all_genres
      : NS.filter.genre_count(formatCkbDigits(selected.length))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className={cn(
              triggerClass,
              "inline-flex w-full items-center justify-between gap-2 px-3 text-sm md:w-40",
            )}
          >
            <span className="truncate">{label}</span>
            <ChevronDownIcon className="text-muted-foreground size-4 shrink-0" />
          </button>
        }
      />
      <PopoverContent dir="rtl" className="max-h-80 w-72 overflow-y-auto p-2" align="start">
        <div className="space-y-3">
          {GENRE_GROUPS.map((group) => (
            <div key={group.family} className="space-y-1.5">
              <p className="text-muted-foreground px-1 text-[10px] font-medium uppercase tracking-wide">
                {NS.genre.group[group.family]}
              </p>
              <div className="space-y-0.5">
                {group.genres.map((g) => (
                  <label
                    key={g}
                    className="hover:bg-muted/60 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
                  >
                    <Checkbox
                      checked={selected.includes(g)}
                      onCheckedChange={() => toggle(g)}
                    />
                    <span className="line-clamp-1">{GENRE_LABEL_CKB[g]}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        {selected.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground mt-2 h-8 w-full text-xs"
            onClick={() => onChange([])}
          >
            {NS.filter.all_genres}
          </Button>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

export function WritingsFiltersToolbar({
  search,
  onSearchChange,
  searchMode,
  onSearchModeChange,
  writer,
  writers,
  onWriterChange,
  genres,
  onGenresChange,
  topicId,
  topics,
  onTopicChange,
  language,
  onLanguageChange,
  institute,
  onInstituteChange,
  showReset,
  onReset,
}: {
  search: string
  onSearchChange: (v: string) => void
  searchMode: WritingsSearchMode
  onSearchModeChange: (mode: WritingsSearchMode) => void
  writer: string | null
  writers: string[]
  onWriterChange: (writer: string | null) => void
  genres: BookGenre[]
  onGenresChange: (genres: BookGenre[]) => void
  topicId: number | null
  topics: TopicDto[]
  onTopicChange: (id: number | null) => void
  language: WritingsUiLanguageFilter
  onLanguageChange: (v: WritingsUiLanguageFilter) => void
  institute: WritingsUiInstituteFilter
  onInstituteChange: (v: WritingsUiInstituteFilter) => void
  showReset: boolean
  onReset: () => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center">
        <div className="border-border bg-background flex min-h-9 min-w-0 flex-1 flex-col gap-2 rounded-md border shadow-sm md:min-w-[14rem]">
          <div className="flex items-center gap-2 px-2">
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
          <div className="border-border/60 flex flex-wrap gap-1 border-t px-2 py-1.5">
            {SEARCH_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => onSearchModeChange(mode)}
                className={cn(
                  "rounded-md px-2 py-0.5 text-xs font-medium transition-colors",
                  searchMode === mode
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {searchModeLabel(mode)}
              </button>
            ))}
          </div>
        </div>

        <Select
          value={writer ?? "all"}
          onValueChange={(v) => onWriterChange(v === "all" ? null : v)}
        >
          <SelectTrigger dir="rtl" className={cn(triggerClass, "md:w-40")}>
            <SelectValue>
              {writer ?? NS.filter.all_writers}
            </SelectValue>
          </SelectTrigger>
          <SelectContent dir="rtl">
            <SelectItem value="all">{NS.filter.all_writers}</SelectItem>
            {writers.map((w) => (
              <SelectItem key={w} value={w}>
                {w}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <GenresMultiSelect selected={genres} onChange={onGenresChange} />

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
          onValueChange={(v) => onLanguageChange(v as WritingsUiLanguageFilter)}
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

        <Select
          value={institute}
          onValueChange={(v) =>
            onInstituteChange(v as WritingsUiInstituteFilter)
          }
        >
          <SelectTrigger dir="rtl" className={cn(triggerClass, "md:w-40")}>
            <SelectValue>{instituteLabel(institute)}</SelectValue>
          </SelectTrigger>
          <SelectContent dir="rtl">
            {(["all", "institute_only", "external_only"] as const).map((i) => (
              <SelectItem key={i} value={i}>
                {instituteLabel(i)}
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
    </div>
  )
}
