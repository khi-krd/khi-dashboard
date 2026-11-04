"use client"

import { NS } from "@/components/projects/projects-strings"
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
import type {
  ProjectsUiLanguageFilter,
  ProjectsUiStatusFilter,
} from "@/types/projects-ui"

export type ProjectTypeFilterOption = {
  label: string
  value: string
}

function typeKey(raw: string) {
  return `t:${encodeURIComponent(raw)}`
}
function typeDecode(key: string) {
  if (key.startsWith("t:")) return decodeURIComponent(key.slice(2))
  return key
}

function statusTriggerLabel(v: ProjectsUiStatusFilter): string {
  switch (v) {
    case "all":
      return NS.filter.all_statuses
    case "active":
      return NS.status.active
    case "completed":
      return NS.status.completed
    case "archived":
      return NS.status.archived
    default:
      return NS.filter.all_statuses
  }
}

function languageTriggerLabel(v: ProjectsUiLanguageFilter): string {
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

export function ProjectsFiltersToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  language,
  onLanguageChange,
  typeFilter,
  typeOptions,
  onTypeChange,
  showReset,
  onReset,
}: {
  search: string
  onSearchChange: (v: string) => void
  status: ProjectsUiStatusFilter
  onStatusChange: (v: ProjectsUiStatusFilter) => void
  language: ProjectsUiLanguageFilter
  onLanguageChange: (v: ProjectsUiLanguageFilter) => void
  typeFilter: string | null
  typeOptions: ProjectTypeFilterOption[]
  onTypeChange: (typeCkb: string | null) => void
  showReset: boolean
  onReset: () => void
}) {
  const typeValue = typeFilter == null ? "ALL" : typeKey(typeFilter)

  function typeTriggerLabel(raw: string): string {
    if (raw === "ALL") return NS.filter.all_types
    const decoded = typeDecode(raw)
    const match = typeOptions.find((c) => c.value === decoded)
    return match?.label ?? decoded
  }

  return (
    <div dir="rtl" className="mb-4">
      <FilterBar>
        <FilterSearch
          value={search}
          onChange={onSearchChange}
          placeholder={NS.filter.search_placeholder}
        />

        <div className="grid grid-cols-2 gap-1.5 md:contents">
        <div className="md:w-40">
          <Select
            value={status}
            onValueChange={(v) => onStatusChange(v as ProjectsUiStatusFilter)}
          >
            <SelectTrigger className={filterSelectTriggerClass(status !== "all")}>
              <SelectValue placeholder={NS.filter.all_statuses}>
                {(v: ProjectsUiStatusFilter | null | undefined) =>
                  v != null ? statusTriggerLabel(v) : NS.filter.all_statuses
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="all">{NS.filter.all_statuses}</SelectItem>
              <SelectItem value="active">{NS.status.active}</SelectItem>
              <SelectItem value="completed">{NS.status.completed}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:w-40">
          <Select
            value={language}
            onValueChange={(v) => onLanguageChange(v as ProjectsUiLanguageFilter)}
          >
            <SelectTrigger className={filterSelectTriggerClass(language !== "all")}>
              <SelectValue placeholder={NS.filter.all_languages}>
                {(v: ProjectsUiLanguageFilter | null | undefined) =>
                  v != null ? languageTriggerLabel(v) : NS.filter.all_languages
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
            value={typeValue}
            onValueChange={(v) => {
              if (v == null || v === "ALL") {
                onTypeChange(null)
                return
              }
              onTypeChange(typeDecode(v))
            }}
          >
            <SelectTrigger className={filterSelectTriggerClass(typeFilter != null)}>
              <SelectValue placeholder={NS.filter.all_types}>
                {(v: string | null | undefined) =>
                  v != null ? typeTriggerLabel(v) : NS.filter.all_types
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent dir="rtl" className="max-h-72">
              <SelectItem value="ALL">{NS.filter.all_types}</SelectItem>
              {typeOptions.map((c) => (
                <SelectItem key={c.value} value={typeKey(c.value)}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

        {showReset ? (
          <FilterReset onClick={onReset} label={NS.action.reset_filters} />
        ) : null}
      </FilterBar>
    </div>
  )
}
