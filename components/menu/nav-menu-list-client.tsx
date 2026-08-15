"use client"

import { PlusIcon } from "@heroicons/react/24/outline"
import { useMemo, useRef, useState } from "react"

import { NavMenuDeleteDialog } from "@/components/menu/nav-menu-delete-dialog"
import { NavMenuErrorState } from "@/components/menu/nav-menu-error-state"
import { NavMenuItemCard } from "@/components/menu/nav-menu-item-card"
import { NM } from "@/components/menu/nav-menu-strings"
import {
  ServiceBreadcrumbBar,
  dashboardServicesCrumbHref,
} from "@/components/services/service-breadcrumb"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDeleteNavMenuItem, useNavMenuListQuery } from "@/hooks/useNavMenu"
import { extractApiErrorMessage } from "@/lib/api-error"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { toastError, toastSuccess } from "@/lib/toast"
import type { NavMenuItemDto } from "@/types/nav-menu"

function ListSkeleton() {
  return (
    <div className="space-y-3" dir="rtl">
      <Skeleton className="h-16 rounded-lg" />
      <Skeleton className="h-16 rounded-lg" />
      <Skeleton className="h-16 rounded-lg" />
    </div>
  )
}

export function NavMenuListClient() {
  // The dashboard always wants hidden rows too, so they stay editable (§3.3).
  const listQuery = useNavMenuListQuery(true)
  const deleteMut = useDeleteNavMenuItem()
  // Drafts carry stable ids rather than being an index range: keying them by
  // position makes discarding the first of two wipe the second one's content,
  // because React reuses the surviving key's state.
  const [drafts, setDrafts] = useState<number[]>([])
  const draftSeq = useRef(0)
  const [deleteTarget, setDeleteTarget] = useState<NavMenuItemDto | null>(null)

  const addDraft = () => {
    draftSeq.current += 1
    const id = draftSeq.current
    setDrafts((d) => [...d, id])
  }
  const removeDraft = (id: number) =>
    setDrafts((d) => d.filter((x) => x !== id))

  const items = useMemo(() => listQuery.data ?? [], [listQuery.data])

  const nextDisplayOrder = useMemo(() => {
    if (items.length === 0) return 0
    return Math.max(...items.map((i) => i.displayOrder ?? 0)) + 1
  }, [items])

  function handleConfirmDelete() {
    const id = deleteTarget?.id
    if (!id) return
    deleteMut.mutate(id, {
      onSuccess: () => {
        toastSuccess(NM.toast.deleted)
        setDeleteTarget(null)
      },
      onError: (err) => {
        toastError(extractApiErrorMessage(err) ?? NM.error.generic)
        setDeleteTarget(null)
      },
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-16" dir="rtl">
      <ServiceBreadcrumbBar
        segments={[
          { label: NM.breadcrumb.dashboard, href: dashboardServicesCrumbHref() },
          { label: NM.breadcrumb.menu },
        ]}
      />

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {NM.page.title}
          </h1>
          <p className="text-muted-foreground text-sm">{NM.page.subtitle}</p>
        </div>
        <Button type="button" className="shrink-0" onClick={addDraft}>
          <PlusIcon className="size-4 rtl:rotate-180" />
          {NM.action.new}
        </Button>
      </header>

      {listQuery.isError ? (
        <NavMenuErrorState
          message={
            extractApiErrorMessage(listQuery.error) ?? NM.error.generic
          }
          onRetry={() => void listQuery.refetch()}
        />
      ) : (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold">{NM.page.itemsTitle}</h2>
            <p className="text-muted-foreground text-xs">
              {NM.page.totalCount(
                formatCkbDigits(items.length + drafts.length),
              )}
            </p>
          </div>

          {listQuery.isLoading ? (
            <ListSkeleton />
          ) : (
            <div className="space-y-3">
              {items.length === 0 && drafts.length === 0 ? (
                <p className="text-muted-foreground/70 py-8 text-center text-sm">
                  {NM.page.empty}
                </p>
              ) : null}

              {items.map((item, index) => (
                <NavMenuItemCard
                  key={item.id ?? `row-${index}`}
                  index={index}
                  dto={item}
                  nextDisplayOrder={item.displayOrder}
                  onSaved={() => void listQuery.refetch()}
                  onDelete={
                    item.id ? () => setDeleteTarget(item) : undefined
                  }
                />
              ))}

              {drafts.map((draftId, i) => (
                <NavMenuItemCard
                  key={`draft-${draftId}`}
                  index={items.length + i}
                  nextDisplayOrder={nextDisplayOrder + i}
                  defaultOpen
                  onSaved={() => {
                    removeDraft(draftId)
                    void listQuery.refetch()
                  }}
                  onDiscard={() => removeDraft(draftId)}
                />
              ))}

              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={addDraft}
              >
                <PlusIcon className="size-4 rtl:rotate-180" />
                {NM.action.new}
              </Button>
            </div>
          )}
        </div>
      )}

      <NavMenuDeleteDialog
        open={deleteTarget != null}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null)
        }}
        target={deleteTarget}
        onConfirm={handleConfirmDelete}
        isPending={deleteMut.isPending}
      />
    </div>
  )
}
