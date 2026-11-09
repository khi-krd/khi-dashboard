"use client"

import {
  ArrowDownIcon,
  ArrowUpIcon,
  PencilSquareIcon,
  PhotoIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { useMemo, useState } from "react"

import { DonationArchiveImageDeleteDialog } from "@/components/donations/donation-archive-image-delete-dialog"
import { DonationArchiveImageDialog } from "@/components/donations/donation-archive-image-dialog"
import { DonationArchiveImagesErrorState } from "@/components/donations/donation-archive-images-error-state"
import {
  DAI,
  donationArchiveImageTitle,
  truncateLabel,
} from "@/components/donations/donation-archive-images-strings"
import {
  DonationsBreadcrumbBar,
  dashboardDonationsCrumbHref,
} from "@/components/donations/donations-breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  useDeleteDonationArchiveVideo,
  useDonationArchiveVideosQuery,
  useReorderDonationArchiveVideos,
  useUpdateDonationArchiveVideo,
} from "@/hooks/useDonationArchiveVideos"
import { extractApiErrorMessage } from "@/lib/api-error"
import {
  isDonationArchiveImageRow,
  moveDonationArchiveRowWithinKind,
} from "@/lib/donation-archive-media-kind"
import { donationArchiveVideoDtoToPayload } from "@/lib/donation-archive-video-form-data"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { toastApiError, toastError, toastSuccess } from "@/lib/toast"
import { cn } from "@/lib/utils"
import type { DonationArchiveVideoDto } from "@/types/donation-archive-video"

function ListSkeleton() {
  return (
    <div className="space-y-3" dir="rtl">
      <Skeleton className="h-24 rounded-lg" />
      <Skeleton className="h-24 rounded-lg" />
      <Skeleton className="h-24 rounded-lg" />
    </div>
  )
}

export function DonationArchiveImagesListClient() {
  // The dashboard always wants hidden rows too, so an image switched off stays
  // editable and can be switched back on. Shares the one archive-videos query
  // with the video page — both lists filter the same rows by kind.
  const listQuery = useDonationArchiveVideosQuery(true)
  const updateMut = useUpdateDonationArchiveVideo()
  const deleteMut = useDeleteDonationArchiveVideo()
  const reorderMut = useReorderDonationArchiveVideos()

  const [formDialog, setFormDialog] = useState<{
    open: boolean
    image: DonationArchiveVideoDto | null
  }>({ open: false, image: null })
  const [deleteTarget, setDeleteTarget] =
    useState<DonationArchiveVideoDto | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const allRows = useMemo(() => listQuery.data ?? [], [listQuery.data])
  const items = useMemo(
    () => allRows.filter(isDonationArchiveImageRow),
    [allRows]
  )

  const nextDisplayOrder = useMemo(() => {
    if (allRows.length === 0) return 0
    return Math.max(...allRows.map((i) => i.displayOrder ?? 0)) + 1
  }, [allRows])

  function closeFormDialog() {
    setFormDialog((s) => ({ ...s, open: false }))
  }

  function handleMove(fromKindIndex: number, toKindIndex: number) {
    const next = moveDonationArchiveRowWithinKind(
      allRows,
      isDonationArchiveImageRow,
      fromKindIndex,
      toKindIndex
    )
    if (next === allRows) return
    reorderMut.mutate(next, {
      onSuccess: () => toastSuccess(DAI.toast.reordered),
      onError: (err) =>
        toastError(DAI.error.reorderFailed, extractApiErrorMessage(err)),
    })
  }

  function handleToggleActive(image: DonationArchiveVideoDto, next: boolean) {
    if (image.id == null) return
    setTogglingId(image.id)
    updateMut.mutate(
      {
        id: image.id,
        payload: donationArchiveVideoDtoToPayload(image, { active: next }),
      },
      {
        onSuccess: () =>
          toastSuccess(next ? DAI.toast.activated : DAI.toast.deactivated),
        onError: (err) => toastApiError(err, DAI.error.generic),
        onSettled: () => setTogglingId(null),
      }
    )
  }

  function handleConfirmDelete() {
    const id = deleteTarget?.id
    if (id == null) return
    deleteMut.mutate(id, {
      onSuccess: () => {
        toastSuccess(DAI.toast.deleted)
        setDeleteTarget(null)
      },
      onError: (err) => {
        toastApiError(err, DAI.error.generic)
        setDeleteTarget(null)
      },
    })
  }

  return (
    <div
      className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-16"
      dir="rtl"
    >
      <DonationsBreadcrumbBar
        segments={[
          {
            label: DAI.breadcrumb.dashboard,
            href: dashboardDonationsCrumbHref(),
          },
          { label: DAI.breadcrumb.donations, href: "/dashboard/donations" },
          { label: DAI.breadcrumb.archiveImages },
        ]}
      />

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {DAI.page.title}
          </h1>
          <p className="text-sm text-muted-foreground">{DAI.page.subtitle}</p>
        </div>
        <Button
          type="button"
          className="shrink-0"
          onClick={() => setFormDialog({ open: true, image: null })}
        >
          <PlusIcon className="size-4" />
          {DAI.action.new}
        </Button>
      </header>

      <p className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
        <PhotoIcon
          className="mt-0.5 size-4 shrink-0 text-primary"
          aria-hidden
        />
        <span>{DAI.order.explainer}</span>
      </p>

      {listQuery.isError ? (
        <DonationArchiveImagesErrorState
          message={extractApiErrorMessage(listQuery.error) ?? DAI.error.generic}
          onRetry={() => void listQuery.refetch()}
        />
      ) : (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold">{DAI.page.itemsTitle}</h2>
            <p className="text-xs text-muted-foreground">
              {DAI.page.totalCount(formatCkbDigits(items.length))}
            </p>
          </div>

          {listQuery.isLoading ? (
            <ListSkeleton />
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground/70">
              {DAI.page.empty}
            </p>
          ) : (
            <ul className="space-y-3">
              {items.map((image, index) => (
                <DonationArchiveImageRow
                  key={image.id ?? `row-${index}`}
                  image={image}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === items.length - 1}
                  reordering={reorderMut.isPending}
                  toggling={togglingId != null && togglingId === image.id}
                  onMoveUp={() => handleMove(index, index - 1)}
                  onMoveDown={() => handleMove(index, index + 1)}
                  onToggleActive={(next) => handleToggleActive(image, next)}
                  onEdit={() => setFormDialog({ open: true, image })}
                  onDelete={() => setDeleteTarget(image)}
                />
              ))}
            </ul>
          )}
        </div>
      )}

      <DonationArchiveImageDialog
        open={formDialog.open}
        onOpenChange={(v) => {
          if (!v) closeFormDialog()
        }}
        image={formDialog.image}
        nextDisplayOrder={nextDisplayOrder}
        onSaved={() => {
          closeFormDialog()
          void listQuery.refetch()
        }}
      />

      <DonationArchiveImageDeleteDialog
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

function DonationArchiveImageRow({
  image,
  index,
  isFirst,
  isLast,
  reordering,
  toggling,
  onMoveUp,
  onMoveDown,
  onToggleActive,
  onEdit,
  onDelete,
}: {
  image: DonationArchiveVideoDto
  index: number
  isFirst: boolean
  isLast: boolean
  reordering: boolean
  toggling: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onToggleActive: (next: boolean) => void
  onEdit: () => void
  onDelete: () => void
}) {
  const description = image.descriptionCkb ?? image.descriptionKmr ?? ""
  const switchId = `donation-archive-image-row-active-${image.id ?? index}`

  return (
    <li
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-lg border border-border/60 bg-card/50 p-3 shadow-xs transition-opacity",
        !image.active && "opacity-60"
      )}
    >
      <div className="flex shrink-0 flex-col gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={isFirst || reordering}
          onClick={onMoveUp}
          aria-label={DAI.action.moveUp}
        >
          <ArrowUpIcon className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={isLast || reordering}
          onClick={onMoveDown}
          aria-label={DAI.action.moveDown}
        >
          <ArrowDownIcon className="size-3.5" />
        </Button>
      </div>

      <div className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-md bg-muted">
        {image.videoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.videoUrl}
            alt=""
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground/50">
            <PhotoIcon className="size-6" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">
            {DAI.page.rowLabel(formatCkbDigits(index + 1))}
          </span>
          {!image.active ? (
            <Badge variant="outline">{DAI.field.inactive}</Badge>
          ) : null}
        </div>

        <p className="truncate text-sm font-medium">
          {donationArchiveImageTitle(image)}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {description.trim() || DAI.dash}
        </p>
        <p
          dir="ltr"
          className="truncate text-left font-mono text-[11px] text-muted-foreground/70"
        >
          {truncateLabel(image.videoUrl, 70)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <div className="me-1 flex items-center gap-1.5">
          <Switch
            id={switchId}
            checked={image.active}
            disabled={toggling}
            onCheckedChange={(v: boolean) => onToggleActive(v)}
            aria-label={DAI.field.active}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={onEdit}
          aria-label={DAI.action.edit}
        >
          <PencilSquareIcon className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={onDelete}
          aria-label={DAI.action.delete}
        >
          <TrashIcon className="size-4" />
        </Button>
      </div>
    </li>
  )
}
