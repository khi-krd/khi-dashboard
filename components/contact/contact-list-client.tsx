"use client"

import { Suspense, useMemo, useState } from "react"
import Link from "next/link"
import {
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"

import { ContactsTable } from "@/components/contact/contacts-table"
import { ContactDeleteDialog } from "@/components/contact/contact-delete-dialog"
import { ContactErrorState } from "@/components/contact/contact-error-state"
import { NS } from "@/components/contact/contact-strings"
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
  useContactListQuery,
  useDeleteContactMutation,
} from "@/hooks/useContact"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import { toastError } from "@/lib/toast"
import { toast } from "sonner"
import type {
  ContactUiActiveFilter,
  ContactUiLanguageFilter,
} from "@/types/contact-ui"
import {
  matchesContactActiveFilter,
  matchesContactClientSearchFilter,
  matchesContactLanguageFilter,
  toContactAdminRow,
} from "@/types/contact-ui"
import type { ContactAdminTableRow } from "@/types/contact-ui"

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

export function ContactListClient() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <ContactListClientInner />
    </Suspense>
  )
}

function ContactListClientInner() {
  const [searchRaw, setSearchRaw] = useState("")
  const debouncedKw = useDebouncedValue(searchRaw.trim(), 300)
  const [activeFilter, setActiveFilter] = useState<ContactUiActiveFilter>("all")
  const [language, setLanguage] = useState<ContactUiLanguageFilter>("all")
  const [pageIndex, setPageIndex] = useState(0)
  const pageSize = 20
  const [deleteTarget, setDeleteTarget] = useState<ContactAdminTableRow | null>(
    null,
  )

  const listQ = useContactListQuery({ page: pageIndex, size: pageSize })
  const deleteMut = useDeleteContactMutation()

  const filtered = useMemo(() => {
    const rows = (listQ.data?.content ?? []).map(toContactAdminRow)
    return rows.filter(
      (r) =>
        matchesContactActiveFilter(r, activeFilter) &&
        matchesContactLanguageFilter(r, language) &&
        matchesContactClientSearchFilter(r, debouncedKw),
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
          href="/dashboard/contact/new"
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
            setActiveFilter(v as ContactUiActiveFilter)
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
            setLanguage(v as ContactUiLanguageFilter)
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
        <ContactErrorState onRetry={() => void listQ.refetch()} />
      ) : filtered.length === 0 ? (
        <div className="text-muted-foreground py-16 text-center text-sm">
          {NS.empty}
        </div>
      ) : (
        <ContactsTable
          rows={filtered}
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalElements={listQ.data?.totalElements ?? filtered.length}
          onPageChange={setPageIndex}
          onDelete={setDeleteTarget}
        />
      )}

      <ContactDeleteDialog
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
