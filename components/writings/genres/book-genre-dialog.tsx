"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { LockClosedIcon } from "@heroicons/react/24/outline"
import { useState } from "react"
import { Controller, useForm, type Resolver } from "react-hook-form"

import { BG } from "@/components/writings/genres/book-genres-strings"
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
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { useCreateBookGenre, useUpdateBookGenre } from "@/hooks/useBookGenres"
import { extractApiErrorMessage } from "@/lib/api-error"
import { bookGenreFormValuesToPayload } from "@/lib/book-genre-form-data"
import { toastError, toastSuccess } from "@/lib/toast"
import { cn } from "@/lib/utils"
import {
  bookGenreDtoToFormValues,
  bookGenreSchema,
  defaultBookGenreValues,
  type BookGenreFormValues,
} from "@/lib/validations/book-genre"
import { suggestGenreSlug, type BookGenreDto } from "@/types/book-genre"

const sectionCard =
  "rounded-xl border border-border/60 bg-card/50 p-4 shadow-xs"

/**
 * `403` comes back with an empty body, so `extractApiErrorMessage` finds nothing
 * to read. `409` does carry one, but its text is the generic "A record with this
 * data already exists"; a duplicate `slug` is the only way this endpoint
 * conflicts, so naming it — and saying what to do instead — is more useful. A
 * `400` on edit is the server refusing a changed slug for a genre books use,
 * which only happens to a client whose page predates someone else's save.
 */
function bookGenreErrorMessage(err: unknown, mode: "create" | "edit"): string {
  const status = (err as { response?: { status?: number } })?.response?.status
  if (status === 403) return BG.error.forbidden
  if (status === 409) return BG.error.duplicateSlug
  if (status === 404) return BG.error.notFound
  if (status === 400 && mode === "edit") return BG.error.slugImmutable
  return extractApiErrorMessage(err) ?? BG.error.generic
}

export function BookGenreDialog({
  open,
  onOpenChange,
  genre,
  nextDisplayOrder,
  onSaved,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  /** Absent for a new genre. */
  genre?: BookGenreDto | null
  /** Where a new genre lands — the end of the list. */
  nextDisplayOrder: number
  onSaved: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[calc(100dvh-4rem)] gap-0 overflow-y-auto p-0 sm:max-w-lg"
        dir="rtl"
      >
        {/* Keyed by row, so each genre gets a fresh mount and `defaultValues`
            are already right — no reset-on-open effect chasing the selection.
            The caller holds `genre` steady while the popup fades out, so this
            never swaps an edit form for a blank one mid-animation. */}
        <BookGenreDialogBody
          key={genre?.id ?? "new"}
          genre={genre ?? undefined}
          nextDisplayOrder={nextDisplayOrder}
          onSaved={onSaved}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function BookGenreDialogBody({
  genre,
  nextDisplayOrder,
  onSaved,
  onCancel,
}: {
  genre?: BookGenreDto
  nextDisplayOrder: number
  onSaved: () => void
  onCancel: () => void
}) {
  const mode = genre?.id ? "edit" : "create"
  const rowId = genre?.id ?? null
  const createMut = useCreateBookGenre()
  const updateMut = useUpdateBookGenre()
  const pending = createMut.isPending || updateMut.isPending

  // The two rules the backend actually rejects a genre for. They are checked
  // here rather than in the schema so no field is marked required while it is
  // being typed — the message appears only once the editor tries to save.
  const [blockers, setBlockers] = useState<string[]>([])
  // Auto-suggestion stops the moment the editor types a slug of their own,
  // otherwise every keystroke in the Kurmanji name would overwrite it.
  const [slugTouched, setSlugTouched] = useState(false)

  const {
    control,
    handleSubmit,
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<BookGenreFormValues>({
    resolver: zodResolver(bookGenreSchema) as Resolver<BookGenreFormValues>,
    defaultValues: genre
      ? bookGenreDtoToFormValues(genre)
      : defaultBookGenreValues(nextDisplayOrder),
    mode: "onChange",
  })

  const slugLocked = mode === "edit"

  /**
   * Keeps the suggested slug in step with the names until the editor takes over.
   *
   * Both names are read every time, not just the one being typed: a slug
   * suggested from "Novel" would otherwise be wiped the moment the editor moved
   * on to the Sorani name, which is Arabic script and suggests nothing.
   */
  function maybeSuggestSlug(next: { nameKmr?: string; nameCkb?: string }) {
    if (slugLocked || slugTouched) return
    const kmr = next.nameKmr ?? getValues("nameKmr") ?? ""
    const ckb = next.nameCkb ?? getValues("nameCkb") ?? ""
    setValue("slug", suggestGenreSlug(kmr, ckb), { shouldDirty: true })
  }

  const onSubmit = handleSubmit(
    (values) => {
      const payload = bookGenreFormValuesToPayload(values)

      const found: string[] = []
      if (!payload.nameCkb && !payload.nameKmr) {
        found.push(BG.error.nameRequired)
      }
      if (!payload.slug) found.push(BG.error.slugRequired)
      setBlockers(found)
      if (found.length > 0) return

      const handleSuccess = (created: boolean) => {
        toastSuccess(created ? BG.toast.created : BG.toast.saved)
        onSaved()
      }
      const handleError = (err: unknown) =>
        toastError(bookGenreErrorMessage(err, mode))

      if (mode === "create") {
        createMut.mutate(payload, {
          onSuccess: () => handleSuccess(true),
          onError: handleError,
        })
      } else if (rowId) {
        updateMut.mutate(
          { id: rowId, payload },
          { onSuccess: () => handleSuccess(false), onError: handleError },
        )
      }
    },
    () => toastError(BG.error.validation),
  )

  const switchId = `book-genre-active-${rowId ?? "new"}`

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void onSubmit()
      }}
    >
      <DialogHeader className="p-4 pb-3 text-start">
        <DialogTitle className="text-start">
          {mode === "create" ? BG.dialog.createTitle : BG.dialog.editTitle}
        </DialogTitle>
        <DialogDescription className="text-start">
          {BG.dialog.description}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 px-4 pb-4">
        <section className={cn("space-y-3", sectionCard)}>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">
              {BG.field.nameCkb}
            </Label>
            <Input
              className="h-9"
              {...register("nameCkb", {
                onChange: (e) =>
                  maybeSuggestSlug({ nameCkb: String(e.target.value ?? "") }),
              })}
            />
            {errors.nameCkb ? (
              <p className="text-destructive text-xs">{BG.error.tooLong}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">
              {BG.field.nameKmr}
            </Label>
            <Input
              dir="ltr"
              className="h-9"
              {...register("nameKmr", {
                onChange: (e) =>
                  maybeSuggestSlug({ nameKmr: String(e.target.value ?? "") }),
              })}
            />
            {errors.nameKmr ? (
              <p className="text-destructive text-xs">{BG.error.tooLong}</p>
            ) : null}
          </div>
          <p className="text-muted-foreground text-xs">{BG.field.nameHint}</p>
        </section>

        <section className={cn("space-y-2", sectionCard)}>
          <Label className="text-muted-foreground text-xs">
            {BG.field.slug}
          </Label>
          <Input
            dir="ltr"
            readOnly={slugLocked}
            aria-readonly={slugLocked}
            className={cn(
              "h-9 font-mono text-xs",
              slugLocked && "bg-muted/60 text-muted-foreground cursor-not-allowed",
            )}
            placeholder="NOVEL"
            {...register("slug", {
              onChange: () => setSlugTouched(true),
            })}
          />
          {errors.slug ? (
            <p className="text-destructive text-xs">
              {errors.slug.message === "slug_format"
                ? BG.error.slugFormat
                : BG.error.tooLong}
            </p>
          ) : null}
          <p
            className={cn(
              "text-muted-foreground flex items-start gap-1.5 text-xs leading-relaxed",
              slugLocked && "text-foreground/70",
            )}
          >
            {slugLocked ? (
              <LockClosedIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            ) : null}
            <span>{slugLocked ? BG.field.slugLocked : BG.field.slugHint}</span>
          </p>
        </section>

        <div className={cn("flex flex-wrap items-center gap-4", sectionCard)}>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">
              {BG.field.displayOrder}
            </Label>
            <Input
              type="number"
              min={0}
              dir="ltr"
              className="h-9 w-24 font-mono text-xs"
              {...register("displayOrder", {
                // `valueAsNumber` turns an emptied field into NaN, which fails
                // the schema and blocks the save behind a generic toast. Treat
                // "cleared" as 0 instead.
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
                  id={switchId}
                  checked={field.value !== false}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <div className="space-y-0.5">
              <Label
                htmlFor={switchId}
                className="cursor-pointer text-sm font-medium"
              >
                {BG.field.active}
              </Label>
              <p className="text-muted-foreground text-xs">
                {BG.field.activeHint}
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
          {BG.action.cancel}
        </Button>
        {/* Deliberately never disabled for a missing name or slug: a dead
            button explains nothing. Pressing it names what is missing instead. */}
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner className="me-2 size-4" aria-hidden /> : null}
          {pending ? BG.action.saving : BG.action.save}
        </Button>
      </DialogFooter>
    </form>
  )
}
