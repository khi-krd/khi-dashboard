"use client"

import { Suspense, useMemo, useState } from "react"
import Link from "next/link"
import {
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"

import { AboutsTable } from "@/components/about/abouts-table"
import { AboutDeleteDialog } from "@/components/about/about-delete-dialog"
import { AboutErrorState } from "@/components/about/about-error-state"
import { NS } from "@/components/about/about-strings"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import {
  useAboutListQuery,
  useDeleteAboutMutation,
} from "@/hooks/useAbout"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import { toastError } from "@/lib/toast"
import { toast } from "sonner"
import type {
  AboutUiActiveFilter,
  AboutUiLanguageFilter,
} from "@/types/about-ui"
import {
  matchesAboutActiveFilter,
  matchesAboutClientSearchFilter,
  matchesAboutLanguageFilter,
  toAboutAdminRow,
} from "@/types/about-ui"
import type { AboutAdminTableRow } from "@/types/about-ui"

function ListSkeleton() {
  return (
    <div className="border-border overflow-hidden rounded-xl border">
      <Skeleton className="h-10 w-full rounded-none" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-none" />
      ))}
    </div>
  )
}

export function AboutListClient() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <AboutListClientInner />
    </Suspense>
  )
}

function AboutListClientInner() {
  const [searchRaw, setSearchRaw] = useState("")
  const debouncedKw = useDebouncedValue(searchRaw.trim(), 300)
  const [activeFilter, setActiveFilter] = useState<AboutUiActiveFilter>("all")
  const [language, setLanguage] = useState<AboutUiLanguageFilter>("all")
  const [pageIndex, setPageIndex] = useState(0)
  const pageSize = 20
  const [deleteTarget, setDeleteTarget] = useState<AboutAdminTableRow | null>(
    null,
  )

  const listQ = useAboutListQuery({ page: pageIndex, size: pageSize })
  const deleteMut = useDeleteAboutMutation()

  const filtered = useMemo(() => {
    const rows = (listQ.data?.content ?? []).map(toAboutAdminRow)
    return rows.filter(
      (r) =>
        matchesAboutActiveFilter(r, activeFilter) &&
        matchesAboutLanguageFilter(r, language) &&
        matchesAboutClientSearchFilter(r, debouncedKw),
    )
  }, [listQ.data?.content, activeFilter, language, debouncedKw])

  const anyFilterActive =
    activeFilter !== "all" || language !== "all" || debouncedKw.length > 0

  function resetFilters() {
    setSearchRaw("")
    setActiveFilter("all")
    setLanguage("all")
    setPageIndex(0)
  }

  const total = listQ.data?.totalElements ?? filtered.length

  return (
    <div dir="rtl" className="px-4 py-6 lg:px-6">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{NS.title}</h1>
          <p className="text-muted-foreground mt-1 text-sm">{NS.subtitle}</p>
          <p className="text-muted-foreground/70 mt-1.5 font-mono text-xs">
            {NS.count(formatCkbDigits(total))}
          </p>
        </div>
        <Link
          href="/dashboard/about/new"
          className={cn(
            buttonVariants({ variant: "default" }),
            "bg-primary text-primary-foreground hover:bg-primary/90 shrink-0",
          )}
        >
          <PlusIcon className="me-1 size-4" />
          {NS.new}
        </Link>
      </header>

      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="text-muted-foreground absolute end-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            value={searchRaw}
            onChange={(e) => {
              setSearchRaw(e.target.value)
              setPageIndex(0)
            }}
            placeholder={NS.search_placeholder}
            className="border-border bg-background h-9 pe-10 ps-3"
          />
        </div>
        <Select
          value={activeFilter}
          onValueChange={(v) => {
            setActiveFilter(v as AboutUiActiveFilter)
            setPageIndex(0)
          }}
        >
          <SelectTrigger className="bg-background h-9 w-32">
            <SelectValue placeholder={NS.filter.status_all} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{NS.filter.status_all}</SelectItem>
            <SelectItem value="active">{NS.filter.active}</SelectItem>
            <SelectItem value="inactive">{NS.filter.inactive}</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={language}
          onValueChange={(v) => {
            setLanguage(v as AboutUiLanguageFilter)
            setPageIndex(0)
          }}
        >
          <SelectTrigger className="bg-background h-9 w-32">
            <SelectValue placeholder={NS.filter.lang_all} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{NS.filter.lang_all}</SelectItem>
            <SelectItem value="CKB">{NS.lang.ckb}</SelectItem>
            <SelectItem value="KMR">{NS.lang.kmr}</SelectItem>
          </SelectContent>
        </Select>
        {anyFilterActive ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground h-9"
            onClick={resetFilters}
          >
            <XMarkIcon className="me-1 size-3.5" />
            {NS.filter.reset}
          </Button>
        ) : null}
      </div>

      {listQ.isLoading ? (
        <ListSkeleton />
      ) : listQ.isError ? (
        <AboutErrorState onRetry={() => void listQ.refetch()} />
      ) : filtered.length === 0 ? (
        <div className="text-muted-foreground py-16 text-center text-sm">
          هیچ پەرەیەک نەدۆزرایەوە
        </div>
      ) : (
        <AboutsTable
          rows={filtered}
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalElements={listQ.data?.totalElements ?? filtered.length}
          onPageChange={setPageIndex}
          onDelete={setDeleteTarget}
        />
      )}

      <AboutDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        target={deleteTarget}
        isPending={deleteMut.isPending}
        onConfirm={async () => {
          if (!deleteTarget?.id) return
          try {
            await deleteMut.mutateAsync(deleteTarget.id)
            toast.success(NS.toast.deleted)
            setDeleteTarget(null)
          } catch {
            toastError(NS.error.validation)
          }
        }}
      />
    </div>
  )
}
