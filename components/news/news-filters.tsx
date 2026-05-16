"use client"

import { ArrowPathIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"

import type { ChangeEvent } from "react"

import { NS } from "@/components/news/news-strings"
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

import type { NewsUiLanguageFilter, NewsUiStatusFilter } from "@/types/news-ui"

export type NewsCategoryFilterOption = {
  label: string
  value: string | null
}

/** Category option value needs to survive SelectItem quirks — use prefixed keys when needed */
function catKey(raw: string) {
  return `c:${encodeURIComponent(raw)}`
}
function catDecode(key: string) {
  if (key.startsWith("c:")) return decodeURIComponent(key.slice(2))
  return key
}

function statusTriggerLabel(v: NewsUiStatusFilter): string {
  switch (v) {
    case "all":
      return NS.filter.all_statuses
    case "published":
      return NS.status.published
    case "draft":
      return NS.status.draft
    case "scheduled":
      return NS.status.scheduled
    case "archived":
      return NS.status.archived
    default:
      return String(v)
  }
}

function languageTriggerLabel(v: NewsUiLanguageFilter): string {
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
      return String(v)
  }
}

const triggerClass =
  "border-border bg-background h-9 w-full min-h-9 rounded-md shadow-sm transition-[box-shadow,border-color] hover:border-primary/30 hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"

export function NewsFiltersToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  language,
  onLanguageChange,
  category,
  categoryOptions,
  onCategoryChange,
  showReset,
  onReset,
}: {
  search: string
  onSearchChange: (v: string) => void
  status: NewsUiStatusFilter
  onStatusChange: (v: NewsUiStatusFilter) => void
  language: NewsUiLanguageFilter
  onLanguageChange: (v: NewsUiLanguageFilter) => void
  category: string | null
  categoryOptions: NewsCategoryFilterOption[]
  onCategoryChange: (categoryCkb: string | null) => void
  showReset: boolean
  onReset: () => void
}) {
  const categoryValue = category == null ? "ALL" : catKey(category)

  const showDraftArchivedNote =
    status === "draft" || status === "archived"

  function categoryTriggerLabel(raw: string): string {
    if (raw === "ALL") return NS.filter.all_categories
    const decoded = catDecode(raw)
    const match = categoryOptions.find(
      (c) => typeof c.value === "string" && c.value === decoded,
    )
    return match?.label ?? decoded
  }

  return (
    <div dir="rtl" className="mb-4 flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:gap-2">
      <div className="border-input bg-background flex h-9 min-h-9 w-full items-center rounded-md border px-2.5 shadow-xs transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25 md:min-w-0 md:flex-1">
        <MagnifyingGlassIcon
          className="text-muted-foreground size-4 shrink-0 rtl:rotate-180"
          aria-hidden
        />
        <Input
          id="news-filter-search"
          className="h-9 border-none bg-transparent px-2 text-sm shadow-none focus-visible:border-transparent focus-visible:ring-0 md:text-sm"
          placeholder={NS.filter.search_placeholder}
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onSearchChange(e.target.value)
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-2 md:contents">
        <div className="flex min-w-0 flex-col gap-1 md:w-40">
          <Select
            value={status}
            onValueChange={(v) => onStatusChange(v as NewsUiStatusFilter)}
          >
            <SelectTrigger id="news-filter-status" className={triggerClass}>
              <SelectValue placeholder={NS.filter.all_statuses}>
                {(v: NewsUiStatusFilter | null | undefined) =>
                  v != null ? statusTriggerLabel(v) : NS.filter.all_statuses
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="all">{NS.filter.all_statuses}</SelectItem>
              <SelectItem value="published">{NS.status.published}</SelectItem>
              <SelectItem value="draft">{NS.status.draft}</SelectItem>
              <SelectItem value="scheduled">{NS.status.scheduled}</SelectItem>
              <SelectItem value="archived">{NS.status.archived}</SelectItem>
            </SelectContent>
          </Select>
          {showDraftArchivedNote ? (
            <p className="text-muted-foreground text-[0.65rem] leading-snug">
              {NS.filter.draft_archived_hint}
            </p>
          ) : null}
        </div>

        <div className="md:w-40">
          <Select
            value={language}
            onValueChange={(v) => onLanguageChange(v as NewsUiLanguageFilter)}
          >
            <SelectTrigger id="news-filter-language" className={triggerClass}>
              <SelectValue placeholder={NS.filter.all_languages}>
                {(v: NewsUiLanguageFilter | null | undefined) =>
                  v != null
                    ? languageTriggerLabel(v)
                    : NS.filter.all_languages
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="all">{NS.filter.all_languages}</SelectItem>
              <SelectItem value="ckb_only">{NS.filter.lang_ckb_only}</SelectItem>
              <SelectItem value="kmr_only">{NS.filter.lang_kmr_only}</SelectItem>
              <SelectItem value="both">{NS.filter.lang_both}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 md:col-span-1 md:w-44">
          <Select
            value={categoryValue}
            onValueChange={(v) => {
              if (v == null || v === "ALL") {
                onCategoryChange(null)
                return
              }
              onCategoryChange(catDecode(v))
            }}
          >
            <SelectTrigger id="news-filter-category" className={triggerClass}>
              <SelectValue placeholder={NS.filter.all_categories}>
                {(v: string | null | undefined) =>
                  v != null
                    ? categoryTriggerLabel(v)
                    : NS.filter.all_categories
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent dir="rtl" className="max-h-72">
              <SelectItem value="ALL">{NS.filter.all_categories}</SelectItem>
              {categoryOptions
                .filter(
                  (c): c is NewsCategoryFilterOption & { value: string } =>
                    typeof c.value === "string" && c.value.length > 0,
                )
                .map((c) => (
                  <SelectItem key={c.value} value={catKey(c.value)}>
                    {c.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {showReset ? (
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "text-muted-foreground hover:text-foreground inline-flex h-9 shrink-0 items-center gap-1.5 px-3",
            "md:ms-auto",
          )}
          onClick={onReset}
        >
          <ArrowPathIcon className="size-4 rtl:rotate-180" />
          {NS.filter.reset}
        </Button>
      ) : null}
    </div>
  )
}
