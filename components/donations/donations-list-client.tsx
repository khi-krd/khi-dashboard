"use client"

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { Suspense, useCallback, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { DonationStatusFilterSelect } from "@/components/donations/donation-status-select"
import {
  DonationsBreadcrumbBar,
  dashboardDonationsCrumbHref,
} from "@/components/donations/donations-breadcrumb"
import { DonationsArchiveSheet } from "@/components/donations/donations-archive-sheet"
import { DonationsArchiveTable } from "@/components/donations/donations-archive-table"
import { DonationsErrorState } from "@/components/donations/donations-error-state"
import { DonationsFinancialSheet } from "@/components/donations/donations-financial-sheet"
import { DonationsFinancialTable } from "@/components/donations/donations-financial-table"
import { DonationsSettingsPanel } from "@/components/donations/donations-settings-panel"
import { NS } from "@/components/donations/donations-strings"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import {
  useArchiveDonationsListQuery,
  useFinancialDonationsListQuery,
} from "@/hooks/useDonations"
import { formatCkbDigits } from "@/lib/intl-ckb"
import {
  matchesArchiveSearch,
  matchesDonationStatusFilter,
  matchesFinancialSearch,
  toArchiveDonationRow,
  toFinancialDonationRow,
  type DonationUiStatusFilter,
  type DonationUiTab,
} from "@/types/donations-ui"
import type { ArchiveDonationRow, FinancialDonationRow } from "@/types/donations-ui"

const TAB_KEYS: DonationUiTab[] = ["settings", "archive", "financial"]

function isDonationTab(value: string | null): value is DonationUiTab {
  return value != null && TAB_KEYS.includes(value as DonationUiTab)
}

function InboxSkeleton() {
  return (
    <div className="border-border overflow-hidden rounded-xl border">
      <Skeleton className="h-10 w-full rounded-none" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-none" />
      ))}
    </div>
  )
}

function DonationsListInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeTab = useMemo(() => {
    const raw = searchParams.get("tab")
    return isDonationTab(raw) ? raw : "settings"
  }, [searchParams])

  const setActiveTab = useCallback(
    (tab: DonationUiTab) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("tab", tab)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  const [searchRaw, setSearchRaw] = useState("")
  const debouncedKw = useDebouncedValue(searchRaw.trim(), 300)
  const [statusFilter, setStatusFilter] = useState<DonationUiStatusFilter>("all")
  const [pageIndex, setPageIndex] = useState(0)
  const pageSize = 20

  const [archiveSheetRow, setArchiveSheetRow] = useState<ArchiveDonationRow | null>(
    null,
  )
  const [financialSheetRow, setFinancialSheetRow] =
    useState<FinancialDonationRow | null>(null)

  const archiveQ = useArchiveDonationsListQuery({
    page: pageIndex,
    size: pageSize,
  })
  const financialQ = useFinancialDonationsListQuery({
    page: pageIndex,
    size: pageSize,
  })

  const archiveRows = useMemo(() => {
    return (archiveQ.data?.content ?? [])
      .map(toArchiveDonationRow)
      .filter((r): r is ArchiveDonationRow => r != null)
      .filter(
        (r) =>
          matchesDonationStatusFilter(r.status, statusFilter) &&
          matchesArchiveSearch(r, debouncedKw),
      )
  }, [archiveQ.data?.content, statusFilter, debouncedKw])

  const financialRows = useMemo(() => {
    return (financialQ.data?.content ?? [])
      .map(toFinancialDonationRow)
      .filter((r): r is FinancialDonationRow => r != null)
      .filter(
        (r) =>
          matchesDonationStatusFilter(r.status, statusFilter) &&
          matchesFinancialSearch(r, debouncedKw),
      )
  }, [financialQ.data?.content, statusFilter, debouncedKw])

  const showInboxFilters = activeTab === "archive" || activeTab === "financial"
  const anyFilterActive = statusFilter !== "all" || debouncedKw.length > 0

  function resetFilters() {
    setSearchRaw("")
    setStatusFilter("all")
    setPageIndex(0)
  }

  const archiveTotal = archiveQ.data?.totalElements ?? archiveRows.length
  const financialTotal = financialQ.data?.totalElements ?? financialRows.length

  return (
    <div dir="rtl" className="mx-auto max-w-5xl space-y-8 px-4 py-6 lg:px-6">
      <DonationsBreadcrumbBar
        segments={[
          { label: NS.breadcrumb.dashboard, href: dashboardDonationsCrumbHref() },
          { label: NS.breadcrumb.donations },
        ]}
      />

      <header className="border-border/60 border-b pb-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">{NS.page.title}</h1>
          <p className="text-muted-foreground max-w-2xl text-sm">{NS.page.subtitle}</p>
        </div>
      </header>

      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          if (isDonationTab(v)) {
            setActiveTab(v)
            resetFilters()
          }
        }}
        className="gap-6"
      >
        <TabsList
          variant="line"
          className="h-auto w-full flex-wrap justify-start gap-1"
        >
          {TAB_KEYS.map((key) => (
            <TabsTrigger key={key} value={key} className="text-sm">
              {NS.tab[key]}
            </TabsTrigger>
          ))}
        </TabsList>

        {showInboxFilters ? (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1">
              <MagnifyingGlassIcon className="text-muted-foreground absolute end-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                value={searchRaw}
                onChange={(e) => {
                  setSearchRaw(e.target.value)
                  setPageIndex(0)
                }}
                placeholder={
                  activeTab === "archive"
                    ? NS.archive.search
                    : NS.financial.search
                }
                className="border-border bg-background h-9 pe-10 ps-3"
              />
            </div>
            <DonationStatusFilterSelect
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v)
                setPageIndex(0)
              }}
            />
            {anyFilterActive ? (
              <button
                type="button"
                onClick={resetFilters}
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
              >
                <XMarkIcon className="size-3.5" />
                {NS.filter.clear}
              </button>
            ) : null}
          </div>
        ) : null}

        <TabsContent value="settings">
          {activeTab === "settings" ? <DonationsSettingsPanel /> : null}
        </TabsContent>

        <TabsContent value="archive" className="space-y-4">
          {activeTab === "archive" ? (
            <>
              <div>
                <h2 className="text-base font-semibold">{NS.archive.title}</h2>
                <p className="text-muted-foreground text-sm">{NS.archive.subtitle}</p>
                <p className="text-muted-foreground/70 mt-1 font-mono text-xs">
                  {formatCkbDigits(archiveTotal)}
                </p>
              </div>
              {archiveQ.isError ? (
                <DonationsErrorState onRetry={() => void archiveQ.refetch()} />
              ) : archiveQ.isLoading ? (
                <InboxSkeleton />
              ) : (
                <DonationsArchiveTable
                  rows={archiveRows}
                  pageIndex={pageIndex}
                  pageSize={pageSize}
                  totalElements={archiveTotal}
                  onPageChange={setPageIndex}
                  onView={setArchiveSheetRow}
                />
              )}
            </>
          ) : null}
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          {activeTab === "financial" ? (
            <>
              <div>
                <h2 className="text-base font-semibold">{NS.financial.title}</h2>
                <p className="text-muted-foreground text-sm">{NS.financial.subtitle}</p>
                <p className="text-muted-foreground/70 mt-1 font-mono text-xs">
                  {formatCkbDigits(financialTotal)}
                </p>
              </div>
              {financialQ.isError ? (
                <DonationsErrorState onRetry={() => void financialQ.refetch()} />
              ) : financialQ.isLoading ? (
                <InboxSkeleton />
              ) : (
                <DonationsFinancialTable
                  rows={financialRows}
                  pageIndex={pageIndex}
                  pageSize={pageSize}
                  totalElements={financialTotal}
                  onPageChange={setPageIndex}
                  onView={setFinancialSheetRow}
                />
              )}
            </>
          ) : null}
        </TabsContent>
      </Tabs>

      <DonationsArchiveSheet
        open={archiveSheetRow != null}
        onOpenChange={(open) => {
          if (!open) setArchiveSheetRow(null)
        }}
        row={archiveSheetRow}
        onStatusUpdated={() => void archiveQ.refetch()}
      />

      <DonationsFinancialSheet
        open={financialSheetRow != null}
        onOpenChange={(open) => {
          if (!open) setFinancialSheetRow(null)
        }}
        row={financialSheetRow}
        onStatusUpdated={() => void financialQ.refetch()}
      />
    </div>
  )
}

export function DonationsListClient() {
  return (
    <Suspense fallback={<InboxSkeleton />}>
      <DonationsListInner />
    </Suspense>
  )
}
