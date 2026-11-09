"use client"

import {
  ArrowDownIcon,
  ArrowUpIcon,
  PencilSquareIcon,
  PlayCircleIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { useMemo, useState } from "react"

import { DonationArchiveVideoDeleteDialog } from "@/components/donations/donation-archive-video-delete-dialog"
import { DonationArchiveVideoDialog } from "@/components/donations/donation-archive-video-dialog"
import { DonationArchiveVideosErrorState } from "@/components/donations/donation-archive-videos-error-state"
import {
  DAV,
  donationArchiveVideoTitle,
  truncateLabel,
} from "@/components/donations/donation-archive-videos-strings"
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
import { donationArchiveVideoDtoToPayload } from "@/lib/donation-archive-video-form-data"
import {
  isDonationArchiveVideoRow,
  moveDonationArchiveRowWithinKind,
} from "@/lib/donation-archive-media-kind"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { classifyVideoUrl } from "@/lib/video-embed"
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

export function DonationArchiveVideosListClient() {
  // The dashboard always wants hidden rows too, so a video switched off stays
  // editable and can be switched back on.
  const listQuery = useDonationArchiveVideosQuery(true)
  const updateMut = useUpdateDonationArchiveVideo()
  const deleteMut = useDeleteDonationArchiveVideo()
  const reorderMut = useReorderDonationArchiveVideos()

  // `video` deliberately survives the close: the popup fades out before it
  // unmounts, and clearing the selection on close would swap the edit form for
  // a blank create form for the length of that animation.
  const [formDialog, setFormDialog] = useState<{
    open: boolean
    video: DonationArchiveVideoDto | null
  }>({ open: false, video: null })
  const [deleteTarget, setDeleteTarget] =
    useState<DonationArchiveVideoDto | null>(null)
  // The switch is per row, but the mutation is shared — without this every
  // switch on the page would show a pending state while one of them saves.
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const allRows = useMemo(() => listQuery.data ?? [], [listQuery.data])
  const items = useMemo(
    () => allRows.filter(isDonationArchiveVideoRow),
    [allRows]
  )

  const nextDisplayOrder = useMemo(() => {
    if (allRows.length === 0) return 0
    return Math.max(...allRows.map((i) => i.displayOrder ?? 0)) + 1
  }, [allRows])

  function closeFormDialog() {
    setFormDialog((s) => ({ ...s, open: false }))
  }

  function handleMove(from: number, to: number) {
    const next = moveDonationArchiveRowWithinKind(
      allRows,
      isDonationArchiveVideoRow,
      from,
      to
    )
    if (next === allRows) return
    reorderMut.mutate(next, {
      onSuccess: () => toastSuccess(DAV.toast.reordered),
      // A run that failed halfway has written some of its rows, so what the
      // editor needs first is that the list was put back from the server, not
      // the status text. The server's reason rides along underneath.
      onError: (err) =>
        toastError(DAV.error.reorderFailed, extractApiErrorMessage(err)),
    })
  }

  function handleToggleActive(video: DonationArchiveVideoDto, next: boolean) {
    if (video.id == null) return
    setTogglingId(video.id)
    updateMut.mutate(
      {
        id: video.id,
        // The whole row goes back, not just the flag — `PUT` is a replace, so
        // sending `{ active }` alone would blank the titles and the clip.
        payload: donationArchiveVideoDtoToPayload(video, { active: next }),
      },
      {
        onSuccess: () =>
          toastSuccess(next ? DAV.toast.activated : DAV.toast.deactivated),
        onError: (err) => toastApiError(err, DAV.error.generic),
        onSettled: () => setTogglingId(null),
      }
    )
  }

  function handleConfirmDelete() {
    const id = deleteTarget?.id
    if (id == null) return
    deleteMut.mutate(id, {
      onSuccess: () => {
        toastSuccess(DAV.toast.deleted)
        setDeleteTarget(null)
      },
      onError: (err) => {
        toastApiError(err, DAV.error.generic)
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
            label: DAV.breadcrumb.dashboard,
            href: dashboardDonationsCrumbHref(),
          },
          { label: DAV.breadcrumb.donations, href: "/dashboard/donations" },
          { label: DAV.breadcrumb.archiveVideos },
        ]}
      />

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {DAV.page.title}
          </h1>
          <p className="text-sm text-muted-foreground">{DAV.page.subtitle}</p>
        </div>
        <Button
          type="button"
          className="shrink-0"
          onClick={() => setFormDialog({ open: true, video: null })}
        >
          <PlusIcon className="size-4" />
          {DAV.action.new}
        </Button>
      </header>

      <p className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
        <PlayCircleIcon
          className="mt-0.5 size-4 shrink-0 text-primary"
          aria-hidden
        />
        <span>{DAV.order.explainer}</span>
      </p>

      {listQuery.isError ? (
        <DonationArchiveVideosErrorState
          message={extractApiErrorMessage(listQuery.error) ?? DAV.error.generic}
          onRetry={() => void listQuery.refetch()}
        />
      ) : (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold">{DAV.page.itemsTitle}</h2>
            <p className="text-xs text-muted-foreground">
              {DAV.page.totalCount(formatCkbDigits(items.length))}
            </p>
          </div>

          {listQuery.isLoading ? (
            <ListSkeleton />
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground/70">
              {DAV.page.empty}
            </p>
          ) : (
            <ul className="space-y-3">
              {items.map((video, index) => (
                <DonationArchiveVideoRow
                  key={video.id ?? `row-${index}`}
                  video={video}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === items.length - 1}
                  reordering={reorderMut.isPending}
                  toggling={togglingId != null && togglingId === video.id}
                  onMoveUp={() => handleMove(index, index - 1)}
                  onMoveDown={() => handleMove(index, index + 1)}
                  onToggleActive={(next) => handleToggleActive(video, next)}
                  onEdit={() => setFormDialog({ open: true, video })}
                  onDelete={() => setDeleteTarget(video)}
                />
              ))}
            </ul>
          )}
        </div>
      )}

      <DonationArchiveVideoDialog
        open={formDialog.open}
        onOpenChange={(v) => {
          if (!v) closeFormDialog()
        }}
        video={formDialog.video}
        nextDisplayOrder={nextDisplayOrder}
        onSaved={() => {
          closeFormDialog()
          void listQuery.refetch()
        }}
      />

      <DonationArchiveVideoDeleteDialog
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

function DonationArchiveVideoRow({
  video,
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
  video: DonationArchiveVideoDto
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
  const description = video.descriptionCkb ?? video.descriptionKmr ?? ""
  const switchId = `donation-archive-video-row-active-${video.id ?? index}`
  const videoKind = classifyVideoUrl(video.videoUrl)?.kind ?? null

  return (
    <li
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-lg border border-border/60 bg-card/50 p-3 shadow-xs transition-opacity",
        !video.active && "opacity-60"
      )}
    >
      <div className="flex shrink-0 flex-col gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={isFirst || reordering}
          onClick={onMoveUp}
          aria-label={DAV.action.moveUp}
        >
          <ArrowUpIcon className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={isLast || reordering}
          onClick={onMoveDown}
          aria-label={DAV.action.moveDown}
        >
          <ArrowDownIcon className="size-3.5" />
        </Button>
      </div>

      <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-md bg-muted">
        {video.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.posterUrl}
            alt=""
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground/50">
            <PlayCircleIcon className="size-6" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">
            {DAV.page.rowLabel(formatCkbDigits(index + 1))}
          </span>
          {videoKind === "embed" ? (
            <Badge variant="outline">{DAV.field.youtube}</Badge>
          ) : videoKind === "file" ? (
            <Badge variant="outline">{DAV.field.file}</Badge>
          ) : null}
          {!video.active ? (
            <Badge variant="outline">{DAV.field.inactive}</Badge>
          ) : null}
        </div>

        <p className="truncate text-sm font-medium">
          {donationArchiveVideoTitle(video)}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {description.trim() || DAV.dash}
        </p>
        <p
          dir="ltr"
          className="truncate text-left font-mono text-[11px] text-muted-foreground/70"
        >
          {truncateLabel(video.videoUrl, 70)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <div className="me-1 flex items-center gap-1.5">
          <Switch
            id={switchId}
            checked={video.active}
            disabled={toggling}
            onCheckedChange={(v: boolean) => onToggleActive(v)}
            aria-label={DAV.field.active}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={onEdit}
          aria-label={DAV.action.edit}
        >
          <PencilSquareIcon className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={onDelete}
          aria-label={DAV.action.delete}
        >
          <TrashIcon className="size-4" />
        </Button>
      </div>
    </li>
  )
}
