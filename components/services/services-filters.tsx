"use client"

import { ArrowPathIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import type { ChangeEvent } from "react"

import { NS } from "@/components/services/services-strings"
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
  ServicesUiActiveFilter,
  ServicesUiStatusFilter,
} from "@/types/services-ui"

const triggerClass =
  "border-border bg-background h-9 w-full min-h-9 rounded-md shadow-sm transition-[box-shadow,border-color] hover:border-primary/30 hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"

const searchInputClass =
  "h-9 min-h-9 border-none bg-transparent px-2 text-sm shadow-none focus-visible:border-transparent focus-visible:ring-0"

export function ServicesFiltersToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  typeFilter,
  typeOptions,
  onTypeChange,
  activeFilter,
  onActiveFilterChange,
  showReset,
  onReset,
}: {
  search: string
  onSearchChange: (v: string) => void
  status: ServicesUiStatusFilter
  onStatusChange: (v: ServicesUiStatusFilter) => void
  typeFilter: string | null
  typeOptions: string[]
  onTypeChange: (type: string | null) => void
  activeFilter: ServicesUiActiveFilter
  onActiveFilterChange: (v: ServicesUiActiveFilter) => void
  showReset: boolean
  onReset: () => void
}) {
  const typeValue = typeFilter ?? "ALL"

  return (
    <div
      dir="rtl"
      className="mb-4 flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:gap-2"
    >
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
            onValueChange={(v) => onStatusChange(v as ServicesUiStatusFilter)}
          >
            <SelectTrigger className={triggerClass}>
              <SelectValue placeholder={NS.filter.all_statuses}>
                {(v: ServicesUiStatusFilter | null | undefined) => {
                  if (v === "published") return NS.filter.published
                  if (v === "draft") return NS.filter.draft
                  return NS.filter.all_statuses
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="all">{NS.filter.all_statuses}</SelectItem>
              <SelectItem value="published">{NS.filter.published}</SelectItem>
              <SelectItem value="draft">{NS.filter.draft}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:w-44">
          <Select
            value={typeValue}
            onValueChange={(v) => {
              if (v == null || v === "ALL") {
                onTypeChange(null)
                return
              }
              onTypeChange(v)
            }}
          >
            <SelectTrigger className={triggerClass}>
              <SelectValue placeholder={NS.filter.all_types}>
                {(v: string | null | undefined) =>
                  v && v !== "ALL" ? v : NS.filter.all_types
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent dir="rtl" className="max-h-72">
              <SelectItem value="ALL">{NS.filter.all_types}</SelectItem>
              {typeOptions.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 md:col-span-1 md:w-32">
          <Select
            value={activeFilter}
            onValueChange={(v) =>
              onActiveFilterChange(v as ServicesUiActiveFilter)
            }
          >
            <SelectTrigger className={triggerClass}>
              <SelectValue placeholder={NS.filter.all_active}>
                {(v: ServicesUiActiveFilter | null | undefined) => {
                  if (v === "active") return NS.filter.only_active
                  if (v === "inactive") return NS.filter.only_inactive
                  return NS.filter.all_active
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="all">{NS.filter.all_active}</SelectItem>
              <SelectItem value="active">{NS.filter.only_active}</SelectItem>
              <SelectItem value="inactive">{NS.filter.only_inactive}</SelectItem>
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
