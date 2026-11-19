"use client"

import {
  ArrowDownIcon,
  ArrowUpIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { useMemo, useState } from "react"
import { Controller, useForm, type Resolver } from "react-hook-form"

import {
  MO,
  OPTION_PAGE,
} from "@/components/writings/options/managed-options-strings"
import { WritingErrorState } from "@/components/writings/writing-error-state"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import {
  useDeleteManagedOption,
  useManagedOptionsQuery,
  useReorderManagedOptions,
  useUpdateManagedOption,
  useCreateManagedOption,
} from "@/hooks/useWritingOptions"
import { extractApiErrorMessage } from "@/lib/api-error"
import {
  bookGenreDtoToPayload,
  bookGenreFormValuesToPayload,
  moveBookGenre,
} from "@/lib/book-genre-form-data"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { permissiveResolver } from "@/lib/permissive-resolver"
import { toastApiError, toastError, toastSuccess } from "@/lib/toast"
import { cn } from "@/lib/utils"
import {
  bookGenreDtoToFormValues,
  bookGenreSchema,
  defaultBookGenreValues,
  type BookGenreFormValues,
} from "@/lib/validations/book-genre"
import {
  bookGenreLabel,
  suggestGenreSlug,
  type ManagedOptionDto,
  type ManagedOptionKind,
} from "@/types/managed-option"

const rowCard =
  "bg-card/50 border-border/60 flex flex-wrap items-center gap-3 rounded-lg border p-3 shadow-xs transition-opacity"

/**
 * One management list for the three writing vocabularies — the genre screen's
 * exact UI (rows + up/down + active switch + edit/delete dialogs) fed by the
 * kind's own endpoints.
 */
export function ManagedOptionsList({ kind }: { kind: ManagedOptionKind }) {
  const copy = OPTION_PAGE[kind]
  const listQuery = useManagedOptionsQuery(kind, true)
  const createMut = useCreateManagedOption(kind)
  const updateMut = useUpdateManagedOption(kind)
  const deleteMut = useDeleteManagedOption(kind)
  const reorderMut = useReorderManagedOptions(kind)

  const [formDialog, setFormDialog] = useState<{
    open: boolean
    option: ManagedOptionDto | null
  }>({ open: false, option: null })
  const [deleteTarget, setDeleteTarget] = useState<ManagedOptionDto | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const items = useMemo(() => listQuery.data ?? [], [listQuery.data])
  const nextDisplayOrder = useMemo(
    () =>
      items.length === 0
        ? 0
        : Math.max(...items.map((i) => i.displayOrder ?? 0)) + 1,
    [items],
  )

  function handleMove(from: number, to: number) {
    const next = moveBookGenre(items, from, to)
    if (next === items) return
    reorderMut.mutate(next, {
      onSuccess: () => toastSuccess(MO.toast.reordered),
      onError: (err) =>
        toastError(MO.error.reorderFailed, extractApiErrorMessage(err)),
    })
  }

  function handleToggleActive(option: ManagedOptionDto, next: boolean) {
    if (option.id == null) return
    setTogglingId(option.id)
    updateMut.mutate(
      { id: option.id, payload: bookGenreDtoToPayload(option, { active: next }) },
      {
        onSuccess: () =>
          toastSuccess(next ? MO.toast.activated : MO.toast.deactivated),
        onError: (err) => toastApiError(err, MO.error.generic),
        onSettled: () => setTogglingId(null),
      },
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {formatCkbDigits(items.length)} {copy.item}
        </p>
        <Button
          type="button"
          size="sm"
          className="gap-1.5"
          onClick={() => setFormDialog({ open: true, option: null })}
        >
          <PlusIcon className="size-4" />
          {MO.action.new}
        </Button>
      </div>

      {listQuery.isError ? (
        <WritingErrorState onRetry={() => void listQuery.refetch()} />
      ) : listQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground/70 py-8 text-center text-sm">
          {MO.dash}
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((option, index) => (
            <li
              key={option.id ?? `row-${index}`}
              className={cn(rowCard, !option.active && "opacity-60")}
            >
              <div className="flex shrink-0 flex-col gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  disabled={index === 0 || reorderMut.isPending}
                  onClick={() => handleMove(index, index - 1)}
                  aria-label={MO.action.moveUp}
                >
                  <ArrowUpIcon className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  disabled={index === items.length - 1 || reorderMut.isPending}
                  onClick={() => handleMove(index, index + 1)}
                  aria-label={MO.action.moveDown}
                >
                  <ArrowDownIcon className="size-3.5" />
                </Button>
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-muted-foreground text-xs">
                    {formatCkbDigits(index + 1)}
                  </span>
                  {!option.active ? (
                    <Badge variant="outline">{MO.field.inactive}</Badge>
                  ) : null}
                  {option.bookCount != null ? (
                    <Badge variant="secondary">
                      {option.bookCount > 0
                        ? MO.field.bookCount(formatCkbDigits(option.bookCount))
                        : MO.field.noBooks}
                    </Badge>
                  ) : null}
                </div>
                <p className="truncate text-sm font-medium">
                  {option.nameCkb?.trim() || MO.dash}
                </p>
                <p className="text-muted-foreground truncate text-xs" dir="ltr">
                  {option.nameKmr?.trim() || MO.dash}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Switch
                  checked={option.active}
                  disabled={togglingId === option.id}
                  onCheckedChange={(v) => handleToggleActive(option, v)}
                  aria-label={MO.field.active}
                  className="me-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setFormDialog({ open: true, option })}
                  aria-label={MO.action.edit}
                >
                  <PencilSquareIcon className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setDeleteTarget(option)}
                  aria-label={MO.action.delete}
                >
                  <TrashIcon className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ManagedOptionDialog
        kind={kind}
        open={formDialog.open}
        onOpenChange={(v) => {
          if (!v) setFormDialog((s) => ({ ...s, open: false }))
        }}
        option={formDialog.option}
        nextDisplayOrder={nextDisplayOrder}
        createMut={createMut}
        updateMut={updateMut}
        onSaved={() => {
          setFormDialog((s) => ({ ...s, open: false }))
          void listQuery.refetch()
        }}
      />

      <ManagedOptionDeleteDialog
        open={deleteTarget != null}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null)
        }}
        target={deleteTarget}
        onConfirm={() => {
          const id = deleteTarget?.id
          if (id == null) return
          deleteMut.mutate(id, {
            onSuccess: () => {
              toastSuccess(MO.toast.deleted)
              setDeleteTarget(null)
            },
            onError: (err) => {
              toastApiError(err, MO.error.generic)
              setDeleteTarget(null)
            },
          })
        }}
        isPending={deleteMut.isPending}
      />
    </div>
  )
}

function ManagedOptionDialog({
  kind,
  open,
  onOpenChange,
  option,
  nextDisplayOrder,
  createMut,
  updateMut,
  onSaved,
}: {
  kind: ManagedOptionKind
  open: boolean
  onOpenChange: (v: boolean) => void
  option: ManagedOptionDto | null
  nextDisplayOrder: number
  createMut: ReturnType<typeof useCreateManagedOption>
  updateMut: ReturnType<typeof useUpdateManagedOption>
  onSaved: () => void
}) {
  const copy = OPTION_PAGE[kind]
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[calc(100dvh-4rem)] gap-0 overflow-y-auto p-0 sm:max-w-lg"
        dir="rtl"
      >
        <ManagedOptionDialogBody
          key={option?.id ?? "new"}
          option={option ?? undefined}
          nextDisplayOrder={nextDisplayOrder}
          title={`${copy.item} — ${copy.title}`}
          createMut={createMut}
          updateMut={updateMut}
          onSaved={onSaved}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function ManagedOptionDialogBody({
  option,
  nextDisplayOrder,
  title,
  createMut,
  updateMut,
  onSaved,
  onCancel,
}: {
  option?: ManagedOptionDto
  nextDisplayOrder: number
  title: string
  createMut: ReturnType<typeof useCreateManagedOption>
  updateMut: ReturnType<typeof useUpdateManagedOption>
  onSaved: () => void
  onCancel: () => void
}) {
  const mode = option?.id ? "edit" : "create"
  const rowId = option?.id ?? null
  const pending = createMut.isPending || updateMut.isPending
  const [blockers, setBlockers] = useState<string[]>([])

  const { control, handleSubmit, register, setValue, getValues } =
    useForm<BookGenreFormValues>({
      resolver: permissiveResolver(
        bookGenreSchema,
      ) as Resolver<BookGenreFormValues>,
      defaultValues: option
        ? bookGenreDtoToFormValues(option)
        : defaultBookGenreValues(nextDisplayOrder),
      mode: "onChange",
    })

  function maybeSuggestSlug(next: { nameKmr?: string; nameCkb?: string }) {
    if (mode === "edit") return
    const kmr = next.nameKmr ?? getValues("nameKmr") ?? ""
    const ckb = next.nameCkb ?? getValues("nameCkb") ?? ""
    setValue("slug", suggestGenreSlug(kmr, ckb), { shouldDirty: true })
  }

  const onSubmit = handleSubmit((values) => {
    const payload = bookGenreFormValuesToPayload(values)
    if (!payload.nameCkb && !payload.nameKmr) {
      setBlockers([MO.error.nameRequired])
      return
    }
    setBlockers([])
    const handleError = (err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response
        ?.status
      toastError(
        status === 403
          ? MO.error.forbidden
          : status === 409
            ? MO.error.duplicateSlug
            : status === 404
              ? MO.error.notFound
              : (extractApiErrorMessage(err) ?? MO.error.generic),
      )
    }
    if (mode === "create") {
      createMut.mutate(payload, {
        onSuccess: () => {
          toastSuccess(MO.toast.created)
          onSaved()
        },
        onError: handleError,
      })
    } else if (rowId) {
      updateMut.mutate(
        { id: rowId, payload },
        {
          onSuccess: () => {
            toastSuccess(MO.toast.saved)
            onSaved()
          },
          onError: handleError,
        },
      )
    }
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void onSubmit()
      }}
    >
      <DialogHeader className="p-4 pb-3 text-start">
        <DialogTitle className="text-start">{title}</DialogTitle>
        <DialogDescription className="text-start">
          {MO.field.nameHint}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 px-4 pb-4">
        <section className="rounded-xl border border-border/60 bg-card/50 space-y-3 p-4 shadow-xs">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">
              {MO.field.nameCkb}
            </Label>
            <Input
              className="h-9"
              {...register("nameCkb", {
                onChange: (e) =>
                  maybeSuggestSlug({ nameCkb: String(e.target.value ?? "") }),
              })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">
              {MO.field.nameKmr}
            </Label>
            <Input
              dir="ltr"
              className="h-9"
              {...register("nameKmr", {
                onChange: (e) =>
                  maybeSuggestSlug({ nameKmr: String(e.target.value ?? "") }),
              })}
            />
          </div>
        </section>

        <div className="rounded-xl border border-border/60 bg-card/50 flex flex-wrap items-center gap-4 p-4 shadow-xs">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">
              {MO.field.displayOrder}
            </Label>
            <Input
              type="number"
              dir="ltr"
              className="h-9 w-24 font-mono text-xs"
              {...register("displayOrder", {
                setValueAs: (v) => {
                  const n = Number(v)
                  return Number.isFinite(n) ? n : 0
                },
              })}
            />
          </div>
          <div className="flex items-center gap-3">
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value !== false}
                  onCheckedChange={field.onChange}
                  aria-label={MO.field.active}
                />
              )}
            />
            <div className="space-y-0.5">
              <Label className="cursor-pointer text-sm font-medium">
                {MO.field.active}
              </Label>
              <p className="text-muted-foreground text-xs">
                {MO.field.activeHint}
              </p>
            </div>
          </div>
        </div>

        {blockers.length > 0 ? (
          <ul className="border-destructive/40 bg-destructive/5 text-destructive space-y-1 rounded-lg border p-3 text-xs leading-relaxed">
            {blockers.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <DialogFooter className="mx-0 mb-0 sm:justify-between">
        <Button type="button" variant="outline" onClick={onCancel}>
          {MO.action.cancel}
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner className="me-2 size-4" aria-hidden /> : null}
          {pending ? MO.action.saving : MO.action.save}
        </Button>
      </DialogFooter>
    </form>
  )
}

function ManagedOptionDeleteDialog({
  open,
  onOpenChange,
  target,
  onConfirm,
  isPending,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  target: ManagedOptionDto | null
  onConfirm: () => void
  isPending?: boolean
}) {
  if (!target) return null
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        size="default"
        className="border-border max-w-md rounded-lg border"
      >
        <AlertDialogHeader className="text-start">
          <AlertDialogTitle className="text-start">
            {MO.dialog.deleteTitle}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground space-y-3 text-start text-sm leading-relaxed">
            <span className="block">
              {target.bookCount == null
                ? MO.dialog.deleteBodyUnknown
                : MO.dialog.deleteBody(
                    MO.field.bookCount(formatCkbDigits(target.bookCount)),
                  )}
            </span>
            <span className="border-border bg-card block rounded-md border p-3">
              <span className="block text-sm font-medium">
                {bookGenreLabel(target)}
              </span>
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-between">
          <AlertDialogCancel className="rounded-md">
            {MO.action.cancel}
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            className="rounded-md"
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
          >
            {isPending ? (
              <Spinner className="me-2 size-4" aria-hidden />
            ) : null}
            {MO.action.delete}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
