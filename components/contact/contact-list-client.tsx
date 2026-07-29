"use client"

import { Suspense, useMemo, useState } from "react"
import { PencilSquareIcon, PlusIcon } from "@heroicons/react/24/outline"
import { toast } from "sonner"

import {
  ContactBreadcrumbBar,
  dashboardContactCrumbHref,
} from "@/components/contact/contact-breadcrumb"
import { ContactDeleteDialog } from "@/components/contact/contact-delete-dialog"
import { ContactErrorState } from "@/components/contact/contact-error-state"
import { ContactOfficeSectionCard } from "@/components/contact/contact-office-section-card"
import { ContactPagePreview } from "@/components/contact/contact-page-preview"
import { NS } from "@/components/contact/contact-strings"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useContactListQuery,
  useDeleteContactMutation,
} from "@/hooks/useContact"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { toastError } from "@/lib/toast"
import type { ContactDto } from "@/types/contact"

function PageSkeleton() {
  return (
    <div className="space-y-4" dir="rtl">
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  )
}

export function ContactListClient() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ContactListClientInner />
    </Suspense>
  )
}

function ContactListClientInner() {
  const listQuery = useContactListQuery({ page: 0, size: 100 })
  const deleteMut = useDeleteContactMutation()
  const [pageMode, setPageMode] = useState<"view" | "edit">("view")
  const [draftCount, setDraftCount] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState<ContactDto | null>(null)

  const offices = useMemo(() => {
    const rows = listQuery.data?.content ?? []
    return [...rows]
      .filter((row) => (row.id ?? 0) > 0)
      .sort((a, b) => {
        const ao =
          typeof a.displayOrder === "number"
            ? a.displayOrder
            : Number.POSITIVE_INFINITY
        const bo =
          typeof b.displayOrder === "number"
            ? b.displayOrder
            : Number.POSITIVE_INFINITY
        return ao - bo
      })
  }, [listQuery.data?.content])

  const isEditing = pageMode === "edit"

  function startEditing() {
    setPageMode("edit")
  }

  function backToPreview() {
    setDraftCount(0)
    setPageMode("view")
  }

  function addOffice() {
    setPageMode("edit")
    setDraftCount((n) => n + 1)
  }

  function handleSaved() {
    setDraftCount((n) => Math.max(0, n - 1))
    void listQuery.refetch()
  }

  function handleConfirmDelete() {
    if (!deleteTarget?.id) return
    deleteMut.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(NS.toast.deleted)
        setDeleteTarget(null)
        void listQuery.refetch()
      },
      onError: () => toastError(NS.error.validation),
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-16" dir="rtl">
      <ContactBreadcrumbBar
        segments={[
          { label: NS.breadcrumb.dashboard, href: dashboardContactCrumbHref() },
          { label: NS.page.title },
        ]}
      />

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{NS.page.title}</h1>
          <p className="text-muted-foreground text-sm">
            {isEditing ? NS.page.subtitleSimple : NS.page.previewHint}
          </p>
          {!isEditing && offices.length > 0 ? (
            <p className="text-muted-foreground/70 font-mono text-xs">
              {NS.count(formatCkbDigits(offices.length))}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-2">
          {!isEditing ? (
            <>
              <Button type="button" variant="outline" onClick={addOffice}>
                <PlusIcon className="size-4 rtl:rotate-180" />
                {NS.action.addOffice}
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

      {listQuery.isError ? (
        <ContactErrorState onRetry={() => void listQuery.refetch()} />
      ) : !isEditing ? (
        <ContactPagePreview
          offices={offices}
          isLoading={listQuery.isLoading}
        />
      ) : (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold">{NS.page.sectionsTitle}</h2>
            <p className="text-muted-foreground text-xs">
              {NS.count(formatCkbDigits(offices.length + draftCount))}
            </p>
          </div>

          {listQuery.isLoading ? (
            <PageSkeleton />
          ) : (
            <div className="space-y-3">
              {offices.map((office, index) => (
                <ContactOfficeSectionCard
                  key={office.id ?? index}
                  index={index}
                  dto={office}
                  onSaved={handleSaved}
                  onDelete={
                    office.id
                      ? () => setDeleteTarget(office)
                      : undefined
                  }
                />
              ))}

              {Array.from({ length: draftCount }).map((_, i) => (
                <ContactOfficeSectionCard
                  key={`draft-${i}`}
                  index={offices.length + i}
                  onSaved={handleSaved}
                />
              ))}

              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={() => setDraftCount((n) => n + 1)}
              >
                <PlusIcon className="size-4 rtl:rotate-180" />
                {NS.action.addOffice}
              </Button>
            </div>
          )}
        </div>
      )}

      <ContactDeleteDialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        target={deleteTarget}
        onConfirm={handleConfirmDelete}
        isPending={deleteMut.isPending}
      />
    </div>
  )
}
