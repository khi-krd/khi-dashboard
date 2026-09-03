"use client"

import {
  ArrowDownIcon,
  ArrowUpIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"
import { useMemo, useState } from "react"

import { BookGenreDeleteDialog } from "@/components/writings/genres/book-genre-delete-dialog"
import { BookGenreDialog } from "@/components/writings/genres/book-genre-dialog"
import { BG } from "@/components/writings/genres/book-genres-strings"
import {
  WritingBreadcrumbBar,
  dashboardWritingsCrumbHref,
} from "@/components/writings/writing-breadcrumb"
import { WritingErrorState } from "@/components/writings/writing-error-state"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  useBookGenresQuery,
  useDeleteBookGenre,
  useReorderBookGenres,
  useUpdateBookGenre,
} from "@/hooks/useBookGenres"
import { useWritingsListQuery } from "@/hooks/useWritings"
import { extractApiErrorMessage } from "@/lib/api-error"
import {
  bookGenreDtoToPayload,
  moveBookGenre,
} from "@/lib/book-genre-form-data"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { toastError, toastSuccess } from "@/lib/toast"
import { cn } from "@/lib/utils"
import { normalizeGenreSlug, type BookGenreDto } from "@/types/book-genre"
import type { WritingsListQueryKeyParts } from "@/types/writings-ui"

/**
 * Same trick the topics screen uses: one wide page of books, counted client
 * side, so the delete dialog can say how many books a genre is on even when the
 * genres endpoint does not send `bookCount` itself.
 */
const listParams: WritingsListQueryKeyParts = {
  page: 0,
  size: 500,
  keyword: "",
  searchMode: "keyword",
  topicId: null,
  languageFilter: "all",
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-16 rounded-lg" />
      <Skeleton className="h-16 rounded-lg" />
      <Skeleton className="h-16 rounded-lg" />
    </div>
  )
}

export function BookGenresList() {
  // The dashboard always wants hidden rows too, so a genre switched off stays
  // editable and can be switched back on.
  const listQuery = useBookGenresQuery(true)
  const writingsQ = useWritingsListQuery(listParams)
  const updateMut = useUpdateBookGenre()
  const deleteMut = useDeleteBookGenre()
  const reorderMut = useReorderBookGenres()

  // `genre` deliberately survives the close: the popup fades out before it
  // unmounts, and clearing the selection on close would swap the edit form for
  // a blank create form for the length of that animation.
  const [formDialog, setFormDialog] = useState<{
    open: boolean
    genre: BookGenreDto | null
  }>({ open: false, genre: null })
  const [deleteTarget, setDeleteTarget] = useState<BookGenreDto | null>(null)
  // The switch is per row, but the mutation is shared — without this every
  // switch on the page would show a pending state while one of them saves.
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const items = useMemo(() => listQuery.data ?? [], [listQuery.data])

  const usageBySlug = useMemo(() => {
    const map = new Map<string, number>()
    for (const w of writingsQ.data?.content ?? []) {
      for (const slug of w.bookGenres ?? []) {
        const key = normalizeGenreSlug(slug)
        map.set(key, (map.get(key) ?? 0) + 1)
      }
    }
    return map
  }, [writingsQ.data?.content])

  /** The API's own count wins; the books we happen to hold are the fallback. */
  function bookCountFor(genre: BookGenreDto): number | undefined {
    if (genre.bookCount != null) return genre.bookCount
    if (writingsQ.data == null) return undefined
    return usageBySlug.get(normalizeGenreSlug(genre.slug)) ?? 0
  }

  const nextDisplayOrder = useMemo(() => {
    if (items.length === 0) return 0
    return Math.max(...items.map((i) => i.displayOrder ?? 0)) + 1
  }, [items])

  const dialogGenre = formDialog.genre

  function closeFormDialog() {
    setFormDialog((s) => ({ ...s, open: false }))
  }

  function handleMove(from: number, to: number) {
    const next = moveBookGenre(items, from, to)
    if (next === items) return
    reorderMut.mutate(next, {
      onSuccess: () => toastSuccess(BG.toast.reordered),
      // A run that failed halfway has written some of its rows, so what the
      // editor needs first is that the list was put back from the server, not
      // the status text. The server's reason rides along underneath.
      onError: (err) =>
        toastError(BG.error.reorderFailed, extractApiErrorMessage(err)),
    })
  }

  function handleToggleActive(genre: BookGenreDto, next: boolean) {
    if (genre.id == null) return
    setTogglingId(genre.id)
    updateMut.mutate(
      {
        id: genre.id,
        // The whole row goes back, not just the flag — `PUT` is a replace, so
        // sending `{ active }` alone would blank the names and the slug.
        payload: bookGenreDtoToPayload(genre, { active: next }),
      },
      {
        onSuccess: () =>
          toastSuccess(next ? BG.toast.activated : BG.toast.deactivated),
        onError: (err) =>
          toastError(extractApiErrorMessage(err) ?? BG.error.generic),
        onSettled: () => setTogglingId(null),
      },
    )
  }

  function handleConfirmDelete() {
    const id = deleteTarget?.id
    if (id == null) return
    deleteMut.mutate(id, {
      onSuccess: () => {
        toastSuccess(BG.toast.deleted)
        setDeleteTarget(null)
      },
      onError: (err) => {
        toastError(extractApiErrorMessage(err) ?? BG.error.generic)
        setDeleteTarget(null)
      },
    })
  }

  return (
    <div dir="rtl" className="space-y-8 px-4 py-6 lg:px-6">
      <WritingBreadcrumbBar
        segments={[
          {
            label: BG.breadcrumb.dashboard,
            href: dashboardWritingsCrumbHref(),
          },
          { label: BG.breadcrumb.writings, href: "/dashboard/writings" },
          { label: BG.breadcrumb.genres },
        ]}
      />

      <header className="border-border/60 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            {BG.page.title}
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm">
            {BG.page.subtitle}
          </p>
        </div>
        <Button
          type="button"
          className="shrink-0 gap-1.5"
          onClick={() => setFormDialog({ open: true, genre: null })}
        >
          <PlusIcon className="size-4" />
          {BG.action.new}
        </Button>
      </header>

      <div className="border-border/60 bg-muted/40 text-muted-foreground space-y-2 rounded-lg border p-3 text-xs leading-relaxed">
        <p className="flex items-start gap-2">
          <InformationCircleIcon
            className="mt-0.5 size-4 shrink-0"
            aria-hidden
          />
          <span>{BG.hint.verbs}</span>
        </p>
        <p className="ps-6">{BG.hint.websitePending}</p>
      </div>

      {listQuery.isError ? (
        <WritingErrorState onRetry={() => void listQuery.refetch()} />
      ) : (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold">{BG.page.itemsTitle}</h2>
            <p className="text-muted-foreground text-xs">
              {BG.page.totalCount(formatCkbDigits(items.length))}
            </p>
          </div>

          {listQuery.isLoading ? (
            <ListSkeleton />
          ) : items.length === 0 ? (
            <p className="text-muted-foreground/70 py-8 text-center text-sm">
              {BG.page.empty}
            </p>
          ) : (
            <ul className="space-y-3">
              {items.map((genre, index) => (
                <BookGenreRow
                  key={genre.id ?? `row-${index}`}
                  genre={genre}
                  index={index}
                  bookCount={bookCountFor(genre)}
                  isFirst={index === 0}
                  isLast={index === items.length - 1}
                  reordering={reorderMut.isPending}
                  toggling={togglingId != null && togglingId === genre.id}
                  onMoveUp={() => handleMove(index, index - 1)}
                  onMoveDown={() => handleMove(index, index + 1)}
                  onToggleActive={(next) => handleToggleActive(genre, next)}
                  onEdit={() => setFormDialog({ open: true, genre })}
                  onDelete={() => setDeleteTarget(genre)}
                />
              ))}
            </ul>
          )}
        </div>
      )}

      <Link
        href="/dashboard/writings"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "rounded-md",
        )}
      >
        {BG.action.back}
      </Link>

      <BookGenreDialog
        open={formDialog.open}
        onOpenChange={(v) => {
          if (!v) closeFormDialog()
        }}
        genre={dialogGenre}
        nextDisplayOrder={nextDisplayOrder}
        onSaved={() => {
          closeFormDialog()
          void listQuery.refetch()
        }}
      />

      <BookGenreDeleteDialog
        open={deleteTarget != null}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null)
        }}
        target={deleteTarget}
        bookCount={deleteTarget ? bookCountFor(deleteTarget) : undefined}
        onConfirm={handleConfirmDelete}
        isPending={deleteMut.isPending}
      />
    </div>
  )
}

function BookGenreRow({
  genre,
  index,
  bookCount,
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
  genre: BookGenreDto
  index: number
  bookCount?: number
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
  const switchId = `book-genre-row-active-${genre.id ?? index}`

  return (
    <li
      className={cn(
        "bg-card/50 border-border/60 flex flex-wrap items-center gap-3 rounded-lg border p-3 shadow-xs transition-opacity",
        !genre.active && "opacity-60",
      )}
    >
      <div className="flex shrink-0 flex-col gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={isFirst || reordering}
          onClick={onMoveUp}
          aria-label={BG.action.moveUp}
        >
          <ArrowUpIcon className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={isLast || reordering}
          onClick={onMoveDown}
          aria-label={BG.action.moveDown}
        >
          <ArrowDownIcon className="size-3.5" />
        </Button>
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-muted-foreground text-xs">
            {BG.page.rowLabel(formatCkbDigits(index + 1))}
          </span>
          <span
            className="text-muted-foreground/80 font-mono text-xs"
            dir="ltr"
          >
            {genre.slug}
          </span>
          {!genre.active ? (
            <Badge variant="outline">{BG.field.inactive}</Badge>
          ) : null}
          {bookCount != null ? (
            <Badge variant="secondary">
              {bookCount > 0
                ? BG.field.bookCount(formatCkbDigits(bookCount))
                : BG.field.noBooks}
            </Badge>
          ) : null}
        </div>

        <p className="truncate text-sm font-medium">
          {genre.nameCkb?.trim() || BG.dash}
        </p>
        <p className="text-muted-foreground truncate text-xs" dir="ltr">
          {genre.nameKmr?.trim() || BG.dash}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Switch
          id={switchId}
          checked={genre.active}
          disabled={toggling}
          onCheckedChange={(v: boolean) => onToggleActive(v)}
          aria-label={BG.field.active}
          className="me-1"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={onEdit}
          aria-label={BG.action.edit}
        >
          <PencilSquareIcon className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={onDelete}
          aria-label={BG.action.delete}
        >
          <TrashIcon className="size-4" />
        </Button>
      </div>
    </li>
  )
}
