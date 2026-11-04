"use client"

import { NS } from "@/components/news/news-strings"
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
    <div dir="rtl" className="mb-4">
      <FilterBar>
        <FilterSearch
          id="news-filter-search"
          value={search}
          onChange={onSearchChange}
          placeholder={NS.filter.search_placeholder}
        />

        <div className="grid grid-cols-2 gap-1.5 md:contents">
        <div className="flex min-w-0 flex-col gap-1 md:w-40">
          <Select
            value={status}
            onValueChange={(v) => onStatusChange(v as NewsUiStatusFilter)}
          >
            <SelectTrigger id="news-filter-status" className={filterSelectTriggerClass(status !== "all")}>
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
            <SelectTrigger id="news-filter-language" className={filterSelectTriggerClass(language !== "all")}>
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
            <SelectTrigger id="news-filter-category" className={filterSelectTriggerClass(category != null)}>
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
          <FilterReset onClick={onReset} label={NS.filter.reset} />
        ) : null}
      </FilterBar>
    </div>
  )
}
