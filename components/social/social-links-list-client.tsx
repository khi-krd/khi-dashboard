"use client"

import {
  InformationCircleIcon,
  PlusIcon,
} from "@heroicons/react/24/outline"
import { useMemo, useRef, useState } from "react"

import {
  ServiceBreadcrumbBar,
  dashboardServicesCrumbHref,
} from "@/components/services/service-breadcrumb"
import { SocialLinkCard } from "@/components/social/social-link-card"
import { SocialLinkDeleteDialog } from "@/components/social/social-link-delete-dialog"
import { SocialLinksErrorState } from "@/components/social/social-links-error-state"
import { SL } from "@/components/social/social-links-strings"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDeleteSocialLink, useSocialLinksQuery } from "@/hooks/useSocialLinks"
import { extractApiErrorMessage } from "@/lib/api-error"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { toastError, toastSuccess } from "@/lib/toast"
import { normalizePlatformKey, type SocialLinkDto } from "@/types/social-links"

function ListSkeleton() {
  return (
    <div className="space-y-3" dir="rtl">
      <Skeleton className="h-40 rounded-lg" />
      <Skeleton className="h-40 rounded-lg" />
    </div>
  )
}

export function SocialLinksListClient() {
  // The dashboard always wants hidden rows too, so a link switched off stays
  // editable and can be switched back on (§1).
  const listQuery = useSocialLinksQuery(true)
  const deleteMut = useDeleteSocialLink()
  // Drafts carry stable ids rather than being an index range: keying them by
  // position makes discarding the first of two wipe the second one's content,
  // because React reuses the surviving key's state.
  const [drafts, setDrafts] = useState<number[]>([])
  const draftSeq = useRef(0)
  const [deleteTarget, setDeleteTarget] = useState<SocialLinkDto | null>(null)

  const addDraft = () => {
    draftSeq.current += 1
    setDrafts((d) => [...d, draftSeq.current])
  }
  const removeDraft = (id: number) =>
    setDrafts((d) => d.filter((x) => x !== id))

  const items = useMemo(() => listQuery.data ?? [], [listQuery.data])

  const nextDisplayOrder = useMemo(() => {
    if (items.length === 0) return 0
    return Math.max(...items.map((i) => i.displayOrder ?? 0)) + 1
  }, [items])

  // §7 rule 1 — one row per platform. Greying out the ones already spoken for
  // turns the 409 into something the editor never has to see; the card still
  // handles it, because another admin can save between this render and ours.
  const takenPlatforms = useMemo(
    () => items.map((i) => normalizePlatformKey(i.platform)).filter(Boolean),
    [items],
  )

  function handleConfirmDelete() {
    const id = deleteTarget?.id
    if (!id) return
    deleteMut.mutate(id, {
      onSuccess: () => {
        toastSuccess(SL.toast.deleted)
        setDeleteTarget(null)
      },
      onError: (err) => {
        toastError(extractApiErrorMessage(err) ?? SL.error.generic)
        setDeleteTarget(null)
      },
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-16" dir="rtl">
      <ServiceBreadcrumbBar
        segments={[
          { label: SL.breadcrumb.dashboard, href: dashboardServicesCrumbHref() },
          { label: SL.breadcrumb.social },
        ]}
      />

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {SL.page.title}
          </h1>
          <p className="text-muted-foreground text-sm">{SL.page.subtitle}</p>
        </div>
        <Button type="button" className="shrink-0" onClick={addDraft}>
          <PlusIcon className="size-4 rtl:rotate-180" />
          {SL.action.new}
        </Button>
      </header>

      <div className="border-border/60 bg-muted/40 text-muted-foreground space-y-2 rounded-lg border p-3 text-xs leading-relaxed">
        <p className="flex items-start gap-2">
          <InformationCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{SL.warn.publicRead}</span>
        </p>
        <p className="ps-6">{SL.warn.footerPending}</p>
      </div>

      {listQuery.isError ? (
        <SocialLinksErrorState
          message={extractApiErrorMessage(listQuery.error) ?? SL.error.generic}
          onRetry={() => void listQuery.refetch()}
        />
      ) : (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold">{SL.page.itemsTitle}</h2>
            <p className="text-muted-foreground text-xs">
              {SL.page.totalCount(
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
                  {SL.page.empty}
                </p>
              ) : null}

              {items.map((item, index) => (
                <SocialLinkCard
                  key={item.id ?? `row-${index}`}
                  index={index}
                  dto={item}
                  nextDisplayOrder={item.displayOrder}
                  takenPlatforms={takenPlatforms.filter(
                    (p) => p !== normalizePlatformKey(item.platform),
                  )}
                  onSaved={() => void listQuery.refetch()}
                  onDelete={item.id ? () => setDeleteTarget(item) : undefined}
                />
              ))}

              {drafts.map((draftId, i) => (
                <SocialLinkCard
                  key={`draft-${draftId}`}
                  index={items.length + i}
                  nextDisplayOrder={nextDisplayOrder + i}
                  takenPlatforms={takenPlatforms}
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
                {SL.action.new}
              </Button>
            </div>
          )}
        </div>
      )}

      <SocialLinkDeleteDialog
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
