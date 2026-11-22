"use client"

import { ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { useMemo, useState } from "react"

import { GENRE_LABEL_CKB, NS } from "@/components/writings/writings-strings"
import {
  FilterBar,
  FilterReset,
  FilterSearch,
  FilterSegmented,
  filterSelectTriggerClass,
} from "@/components/shared/filter-bar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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

const SEARCH_MODES: WritingsSearchMode[] = ["title", "writer", "tag", "keyword"]

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
              filterSelectTriggerClass(selected.length > 0),
              "inline-flex w-full items-center justify-between gap-2 md:w-40",
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

function WritersMultiSelect({
  selected,
  writers,
  onChange,
}: {
  selected: string[]
  writers: string[]
  onChange: (writers: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return writers
    return writers.filter((w) => w.toLowerCase().includes(q))
  }, [query, writers])

  const toggle = (w: string) => {
    if (selected.includes(w)) {
      onChange(selected.filter((x) => x !== w))
    } else {
      onChange([...selected, w])
    }
  }

  const label =
    selected.length === 0
      ? NS.filter.all_writers
      : NS.filter.writer_count(formatCkbDigits(selected.length))

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) setQuery("")
      }}
    >
      <PopoverTrigger
        render={
          <button
            type="button"
            className={cn(
              filterSelectTriggerClass(selected.length > 0),
              "inline-flex w-full items-center justify-between gap-2 md:w-40",
            )}
          >
            <span className="truncate">{label}</span>
            <ChevronDownIcon className="text-muted-foreground size-4 shrink-0" />
          </button>
        }
      />
      <PopoverContent dir="rtl" className="w-64 p-2" align="start">
        <div className="border-border/70 bg-background mb-2 flex h-8 items-center gap-2 rounded-md border px-2">
          <MagnifyingGlassIcon
            className="text-muted-foreground size-4 shrink-0"
            aria-hidden
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={NS.filter.search_writers}
            className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-60 space-y-0.5 overflow-y-auto">
          {visible.map((w) => (
            <label
              key={w}
              className="hover:bg-muted/60 flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm"
            >
              <Checkbox
                checked={selected.includes(w)}
                onCheckedChange={() => toggle(w)}
              />
              <span className="line-clamp-1">{w}</span>
            </label>
          ))}
          {visible.length === 0 ? (
            <p className="text-muted-foreground px-2 py-3 text-center text-xs">
              {NS.filter.no_writers_found}
            </p>
          ) : null}
        </div>
        {selected.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground mt-2 h-8 w-full text-xs"
            onClick={() => onChange([])}
          >
            {NS.filter.all_writers}
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
  writer: string[]
  writers: string[]
  onWriterChange: (writers: string[]) => void
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
    <FilterBar>
      <FilterSearch
        value={search}
        onChange={onSearchChange}
        placeholder={NS.filter.search_placeholder}
      />
      <FilterSegmented
        value={searchMode}
        onChange={onSearchModeChange}
        options={SEARCH_MODES.map((mode) => ({
          value: mode,
          label: searchModeLabel(mode),
        }))}
      />

      <WritersMultiSelect
        selected={writer}
        writers={writers}
        onChange={onWriterChange}
      />

      <GenresMultiSelect selected={genres} onChange={onGenresChange} />

      <Select
        value={topicId == null ? "all" : String(topicId)}
        onValueChange={(v) => onTopicChange(v === "all" ? null : Number(v))}
      >
        <SelectTrigger
          dir="rtl"
          className={cn(filterSelectTriggerClass(topicId != null), "md:w-40")}
        >
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
        <SelectTrigger
          dir="rtl"
          className={cn(filterSelectTriggerClass(language !== "all"), "md:w-32")}
        >
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
        <SelectTrigger
          dir="rtl"
          className={cn(filterSelectTriggerClass(institute !== "all"), "md:w-40")}
        >
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
        <FilterReset onClick={onReset} label={NS.action.reset_filters} />
      ) : null}
    </FilterBar>
  )
}
