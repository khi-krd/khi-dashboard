"use client"

import { ArrowPathIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import type { ChangeEvent } from "react"

import { NS } from "@/components/projects/projects-strings"
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
    case "ongoing":
      return NS.status.ongoing
    case "completed":
      return NS.status.completed
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

const triggerClass =
  "border-border bg-background h-9 w-full min-h-9 rounded-md shadow-sm transition-[box-shadow,border-color] hover:border-primary/30 hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"

const searchInputClass =
  "h-9 min-h-9 border-none bg-transparent px-2 text-sm shadow-none focus-visible:border-transparent focus-visible:ring-0"

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
    <div dir="rtl" className="mb-4 flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:gap-2">
      <div className="border-input bg-background flex h-9 min-h-9 w-full items-center rounded-md border px-2.5 shadow-xs transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/25 md:min-w-0 md:flex-1">
        <MagnifyingGlassIcon
          className="text-muted-foreground size-4 shrink-0 rtl:rotate-180"
          aria-hidden
        />
        <Input
          className={searchInputClass}
          placeholder={NS.filter.search_placeholder}
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onSearchChange(e.target.value)
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-2 md:contents">
        <div className="md:w-40">
          <Select
            value={status}
            onValueChange={(v) => onStatusChange(v as ProjectsUiStatusFilter)}
          >
            <SelectTrigger className={triggerClass}>
              <SelectValue placeholder={NS.filter.all_statuses}>
                {(v: ProjectsUiStatusFilter | null | undefined) =>
                  v != null ? statusTriggerLabel(v) : NS.filter.all_statuses
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="all">{NS.filter.all_statuses}</SelectItem>
              <SelectItem value="ongoing">{NS.status.ongoing}</SelectItem>
              <SelectItem value="completed">{NS.status.completed}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:w-40">
          <Select
            value={language}
            onValueChange={(v) => onLanguageChange(v as ProjectsUiLanguageFilter)}
          >
            <SelectTrigger className={triggerClass}>
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
            <SelectTrigger className={triggerClass}>
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
          {NS.action.reset_filters}
        </Button>
      ) : null}
    </div>
  )
}
