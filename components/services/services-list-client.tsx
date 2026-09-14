"use client"

import { Suspense, useMemo, useState } from "react"
import { PencilSquareIcon, PlusIcon } from "@heroicons/react/24/outline"
import { toast } from "sonner"

import {
  ServiceBreadcrumbBar,
  dashboardServicesCrumbHref,
} from "@/components/services/service-breadcrumb"
import {
  ServiceDeleteDialog,
  serviceToDeleteTarget,
} from "@/components/services/service-delete-dialog"
import { ServiceSectionCard } from "@/components/services/service-section-card"
import { ServicesPageHeroEditor } from "@/components/services/services-page-hero-editor"
import { ServicesPagePreview } from "@/components/services/services-page-preview"
import { ServicesErrorState } from "@/components/services/services-error-state"
import { NS } from "@/components/services/services-strings"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useDeleteServiceMutation,
  useServicesListQuery,
} from "@/hooks/useServices"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { toastError } from "@/lib/toast"
import { splitPageHeroAndSections } from "@/lib/services-page-hero"
import type { ServiceDto } from "@/types/services"

function PageSkeleton() {
  return (
    <div className="space-y-4" dir="rtl">
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  )
}

export function ServicesListClient() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ServicesListClientInner />
    </Suspense>
  )
}

function ServicesListClientInner() {
  const listQuery = useServicesListQuery({ page: 0, size: 100, keyword: "" })
  const deleteMut = useDeleteServiceMutation()
  const [pageMode, setPageMode] = useState<"view" | "edit">("view")
  /**
   * One stable id per unsaved draft card, not a count. With a count, saving
   * the *first* of two drafts dropped the last React key (`draft-1`), so the
   * surviving card reused the just-saved card's component instance: the new
   * section showed up a second time as a still-unsaved draft (and saving it
   * again created a duplicate record), while the other draft's typing was
   * thrown away.
   */
  const [draftIds, setDraftIds] = useState<string[]>([])
  const [deleteDlg, setDeleteDlg] = useState<{
    mode: "single"
    item: ReturnType<typeof serviceToDeleteTarget>
  } | null>(null)

  const hasRows = listQuery.data?.success === true

  const { heroRecord, sections } = useMemo(() => {
    const rows =
      listQuery.data?.success === true && listQuery.data.data
        ? (listQuery.data.data.content ?? [])
        : ([] as ServiceDto[])
    const { hero, sections: rest } = splitPageHeroAndSections(rows)
    const sorted = [...rest].sort((a, b) => {
      const ao =
        typeof a.sortOrder === "number" ? a.sortOrder : Number.POSITIVE_INFINITY
      const bo =
        typeof b.sortOrder === "number" ? b.sortOrder : Number.POSITIVE_INFINITY
      return ao - bo
    })
    return { heroRecord: hero, sections: sorted }
  }, [listQuery.data])

  const nextSortOrder = useMemo(() => {
    const orders = sections
      .map((r) => r.sortOrder)
      .filter((n): n is number => typeof n === "number" && Number.isFinite(n))
    if (orders.length === 0) return 0
    return Math.max(...orders) + 1
  }, [sections])

  function handleConfirmDelete() {
    if (!deleteDlg?.item.id) return
    deleteMut.mutate(deleteDlg.item.id, {
      onSuccess: () => {
        toast(NS.toast.deleted)
        setDeleteDlg(null)
        void listQuery.refetch()
      },
      onError: () => toastError(NS.error.generic),
    })
  }

  function startEditing() {
    setPageMode("edit")
  }

  function backToPreview() {
    setDraftIds([])
    setPageMode("view")
  }

  function addDraft() {
    setDraftIds((ids) => [...ids, crypto.randomUUID()])
  }

  function addSection() {
    setPageMode("edit")
    addDraft()
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-16" dir="rtl">
      <ServiceBreadcrumbBar
        segments={[
          { label: NS.breadcrumb.dashboard, href: dashboardServicesCrumbHref() },
          { label: NS.page.title },
        ]}
      />

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{NS.page.title}</h1>
          <p className="text-muted-foreground text-sm">
            {pageMode === "view" ? NS.page.previewHint : NS.page.subtitleSimple}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {pageMode === "view" ? (
            <>
              <Button type="button" variant="outline" onClick={addSection}>
                <PlusIcon className="size-4 rtl:rotate-180" />
                {NS.action.addSection}
              </Button>
              <Button type="button" onClick={startEditing}>
                <PencilSquareIcon className="size-4" />
                {NS.action.editPage}
              </Button>
            </>
          ) : (
            <Button type="button" variant="outline" onClick={backToPreview}>
              {NS.action.backToPreview}
            </Button>
          )}
        </div>
      </header>

      {listQuery.isError && hasRows ? (
        <div className="border-border bg-muted/30 flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2">
          <p className="text-muted-foreground text-xs">
            {NS.error.refreshFailed}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void listQuery.refetch()}
          >
            {NS.error.retry}
          </Button>
        </div>
      ) : null}

      {/*
        A failed *background* refresh must not unmount the editor: every
        section card holds unsaved form state, and swapping the whole subtree
        for an error panel wiped it — which read as "the page reloaded and
        cleared my fields". Only a first load with nothing to show gets the
        full error state; afterwards it degrades to a retry strip.
      */}
      {listQuery.isError && !hasRows ? (
        <ServicesErrorState onRetry={() => void listQuery.refetch()} />
      ) : pageMode === "view" ? (
        <ServicesPagePreview
          hero={heroRecord}
          sections={sections}
          isLoading={listQuery.isLoading}
        />
      ) : (
        <>
          <ServicesPageHeroEditor
            heroDto={heroRecord}
            isLoading={listQuery.isLoading}
            onSaved={() => void listQuery.refetch()}
          />

          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold">{NS.page.sectionsTitle}</h2>
              <p className="text-muted-foreground text-xs">
                {NS.list.totalCount(
                  formatCkbDigits(sections.length + draftIds.length),
                )}
              </p>
            </div>

            {listQuery.isLoading ? (
              <PageSkeleton />
            ) : (
              <div className="space-y-3">
                {sections.map((section, index) => (
                  <ServiceSectionCard
                    key={section.id ?? index}
                    index={index}
                    dto={section}
                    sortOrder={
                      typeof section.sortOrder === "number"
                        ? section.sortOrder
                        : index
                    }
                    onSaved={() => void listQuery.refetch()}
                    onDelete={
                      section.id
                        ? () =>
                            setDeleteDlg({
                              mode: "single",
                              item: serviceToDeleteTarget({
                                ...section,
                                titleCkb:
                                  section.contents.find(
                                    (c) => c.languageCode === "CKB",
                                  )?.title ?? "",
                              }),
                            })
                        : undefined
                    }
                  />
                ))}

                {draftIds.map((draftId, i) => (
                  <ServiceSectionCard
                    key={draftId}
                    index={sections.length + i}
                    sortOrder={nextSortOrder + i}
                    onSaved={() => {
                      setDraftIds((ids) => ids.filter((id) => id !== draftId))
                      void listQuery.refetch()
                    }}
                  />
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={addDraft}
                >
                  <PlusIcon className="size-4 rtl:rotate-180" />
                  {NS.action.addSection}
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      <ServiceDeleteDialog
        open={deleteDlg != null}
        onOpenChange={(open) => {
          if (!open) setDeleteDlg(null)
        }}
        target={deleteDlg}
        onConfirm={handleConfirmDelete}
        isPending={deleteMut.isPending}
      />
    </div>
  )
}
