"use client"

import {
  ArrowDownIcon,
  ArrowUpIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  PhotoIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { StarIcon } from "@heroicons/react/24/solid"
import { useMemo, useState } from "react"

import { DonationTypeCardDeleteDialog } from "@/components/donations/donation-type-card-delete-dialog"
import { DonationTypeCardDialog } from "@/components/donations/donation-type-card-dialog"
import { DonationTypeCardsErrorState } from "@/components/donations/donation-type-cards-error-state"
import {
  DTC,
  donationTypeCardTitle,
} from "@/components/donations/donation-type-cards-strings"
import {
  DonationsBreadcrumbBar,
  dashboardDonationsCrumbHref,
} from "@/components/donations/donations-breadcrumb"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  useDeleteDonationTypeCard,
  useDonationTypeCardsQuery,
  useReorderDonationTypeCards,
  useUpdateDonationTypeCard,
} from "@/hooks/useDonationTypeCards"
import { extractApiErrorMessage } from "@/lib/api-error"
import {
  donationTypeCardDtoToPayload,
  moveDonationTypeCard,
} from "@/lib/donation-type-card-form-data"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { toastError, toastSuccess } from "@/lib/toast"
import { cn } from "@/lib/utils"
import {
  isFeaturedCardIndex,
  type DonationTypeCardDto,
} from "@/types/donation-type-card"

function ListSkeleton() {
  return (
    <div className="space-y-3" dir="rtl">
      <Skeleton className="h-24 rounded-lg" />
      <Skeleton className="h-24 rounded-lg" />
      <Skeleton className="h-24 rounded-lg" />
    </div>
  )
}

export function DonationTypeCardsListClient() {
  // The dashboard always wants hidden rows too, so a card switched off stays
  // editable and can be switched back on.
  const listQuery = useDonationTypeCardsQuery(true)
  const updateMut = useUpdateDonationTypeCard()
  const deleteMut = useDeleteDonationTypeCard()
  const reorderMut = useReorderDonationTypeCards()

  // `card` deliberately survives the close: the popup fades out before it
  // unmounts, and clearing the selection on close would swap the edit form for
  // a blank create form for the length of that animation.
  const [formDialog, setFormDialog] = useState<{
    open: boolean
    card: DonationTypeCardDto | null
  }>({ open: false, card: null })
  const [deleteTarget, setDeleteTarget] = useState<DonationTypeCardDto | null>(
    null,
  )
  // The switch is per row, but the mutation is shared — without this every
  // switch on the page would show a pending state while one of them saves.
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const items = useMemo(() => listQuery.data ?? [], [listQuery.data])

  const nextDisplayOrder = useMemo(() => {
    if (items.length === 0) return 0
    return Math.max(...items.map((i) => i.displayOrder ?? 0)) + 1
  }, [items])

  const dialogCard = formDialog.card

  function closeFormDialog() {
    setFormDialog((s) => ({ ...s, open: false }))
  }

  function handleMove(from: number, to: number) {
    const next = moveDonationTypeCard(items, from, to)
    if (next === items) return
    reorderMut.mutate(next, {
      onSuccess: () => toastSuccess(DTC.toast.reordered),
      // A run that failed halfway has written some of its rows, so what the
      // editor needs first is that the list was put back from the server, not
      // the status text. The server's reason rides along underneath.
      onError: (err) =>
        toastError(DTC.error.reorderFailed, extractApiErrorMessage(err)),
    })
  }

  function handleToggleActive(card: DonationTypeCardDto, next: boolean) {
    if (card.id == null) return
    setTogglingId(card.id)
    updateMut.mutate(
      {
        id: card.id,
        // The whole row goes back, not just the flag — `PUT` is a replace, so
        // sending `{ active }` alone would blank the titles and the picture.
        payload: donationTypeCardDtoToPayload(card, { active: next }),
      },
      {
        onSuccess: () =>
          toastSuccess(next ? DTC.toast.activated : DTC.toast.deactivated),
        onError: (err) =>
          toastError(extractApiErrorMessage(err) ?? DTC.error.generic),
        onSettled: () => setTogglingId(null),
      },
    )
  }

  function handleConfirmDelete() {
    const id = deleteTarget?.id
    if (id == null) return
    deleteMut.mutate(id, {
      onSuccess: () => {
        toastSuccess(DTC.toast.deleted)
        setDeleteTarget(null)
      },
      onError: (err) => {
        toastError(extractApiErrorMessage(err) ?? DTC.error.generic)
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
            label: DTC.breadcrumb.dashboard,
            href: dashboardDonationsCrumbHref(),
          },
          { label: DTC.breadcrumb.donations, href: "/dashboard/donations" },
          { label: DTC.breadcrumb.typeCards },
        ]}
      />

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {DTC.page.title}
          </h1>
          <p className="text-muted-foreground text-sm">{DTC.page.subtitle}</p>
        </div>
        <Button
          type="button"
          className="shrink-0"
          onClick={() => setFormDialog({ open: true, card: null })}
        >
          <PlusIcon className="size-4" />
          {DTC.action.new}
        </Button>
      </header>

      <p className="border-border/60 bg-muted/40 text-muted-foreground flex items-start gap-2 rounded-lg border p-3 text-xs leading-relaxed">
        <StarIcon className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
        <span>{DTC.featured.explainer}</span>
      </p>

      {listQuery.isError ? (
        <DonationTypeCardsErrorState
          message={extractApiErrorMessage(listQuery.error) ?? DTC.error.generic}
          onRetry={() => void listQuery.refetch()}
        />
      ) : (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold">{DTC.page.itemsTitle}</h2>
            <p className="text-muted-foreground text-xs">
              {DTC.page.totalCount(formatCkbDigits(items.length))}
            </p>
          </div>

          {listQuery.isLoading ? (
            <ListSkeleton />
          ) : items.length === 0 ? (
            <p className="text-muted-foreground/70 py-8 text-center text-sm">
              {DTC.page.empty}
            </p>
          ) : (
            <ul className="space-y-3">
              {items.map((card, index) => (
                <DonationTypeCardRow
                  key={card.id ?? `row-${index}`}
                  card={card}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === items.length - 1}
                  reordering={reorderMut.isPending}
                  toggling={togglingId != null && togglingId === card.id}
                  onMoveUp={() => handleMove(index, index - 1)}
                  onMoveDown={() => handleMove(index, index + 1)}
                  onToggleActive={(next) => handleToggleActive(card, next)}
                  onEdit={() => setFormDialog({ open: true, card })}
                  onDelete={() => setDeleteTarget(card)}
                />
              ))}
            </ul>
          )}
        </div>
      )}

      <DonationTypeCardDialog
        open={formDialog.open}
        onOpenChange={(v) => {
          if (!v) closeFormDialog()
        }}
        card={formDialog.card}
        nextDisplayOrder={nextDisplayOrder}
        isFeatured={
          dialogCard != null
            ? isFeaturedCardIndex(items.findIndex((i) => i.id === dialogCard.id))
            : // A new card lands at the end of the rail, never as the big one —
              // unless it is the very first card the section has.
              items.length === 0
        }
        onSaved={() => {
          closeFormDialog()
          void listQuery.refetch()
        }}
      />

      <DonationTypeCardDeleteDialog
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

function DonationTypeCardRow({
  card,
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
  card: DonationTypeCardDto
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
  const featured = isFeaturedCardIndex(index)
  const description = card.descriptionCkb ?? card.descriptionKmr ?? ""
  // Only the big card shows a description on the site, so only there is a blank
  // one worth pointing at.
  const missingFeaturedDescription = featured && !description.trim()
  const switchId = `donation-type-card-row-active-${card.id ?? index}`

  return (
    <li
      className={cn(
        "bg-card/50 flex flex-wrap items-center gap-3 rounded-lg border p-3 shadow-xs transition-opacity",
        featured ? "border-primary/40" : "border-border/60",
        !card.active && "opacity-60",
      )}
    >
      <div className="flex shrink-0 flex-col gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={isFirst || reordering}
          onClick={onMoveUp}
          aria-label={DTC.action.moveUp}
        >
          <ArrowUpIcon className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={isLast || reordering}
          onClick={onMoveDown}
          aria-label={DTC.action.moveDown}
        >
          <ArrowDownIcon className="size-3.5" />
        </Button>
      </div>

      <div
        className={cn(
          "bg-muted size-16 shrink-0 overflow-hidden rounded-md",
          featured && "ring-primary/40 size-20 ring-2",
        )}
      >
        {card.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.imageUrl}
            alt=""
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="text-muted-foreground/50 flex size-full items-center justify-center">
            <PhotoIcon className="size-6" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-muted-foreground text-xs">
            {DTC.page.rowLabel(formatCkbDigits(index + 1))}
          </span>
          {featured ? (
            <Badge variant="default" className="gap-1">
              <StarIcon aria-hidden />
              {DTC.featured.badge}
            </Badge>
          ) : null}
          {!card.active ? (
            <Badge variant="outline">{DTC.field.inactive}</Badge>
          ) : null}
        </div>

        <p className="truncate text-sm font-medium">
          {donationTypeCardTitle(card)}
        </p>
        <p className="text-muted-foreground truncate text-xs">
          {card.titleKmr?.trim() || DTC.dash}
        </p>

        {missingFeaturedDescription ? (
          <p className="text-destructive flex items-start gap-1.5 text-xs">
            <ExclamationTriangleIcon
              className="mt-0.5 size-3.5 shrink-0"
              aria-hidden
            />
            <span>{DTC.featured.missingDescription}</span>
          </p>
        ) : (
          <p
            className={cn(
              "line-clamp-1 text-xs",
              featured ? "text-muted-foreground" : "text-muted-foreground/60",
            )}
          >
            {description.trim() || DTC.dash}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <div className="me-1 flex items-center gap-1.5">
          <Switch
            id={switchId}
            checked={card.active}
            disabled={toggling}
            onCheckedChange={(v: boolean) => onToggleActive(v)}
            aria-label={DTC.field.active}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={onEdit}
          aria-label={DTC.action.edit}
        >
          <PencilSquareIcon className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={onDelete}
          aria-label={DTC.action.delete}
        >
          <TrashIcon className="size-4" />
        </Button>
      </div>
    </li>
  )
}
