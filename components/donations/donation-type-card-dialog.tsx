"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { StarIcon } from "@heroicons/react/24/solid"
import { useState } from "react"
import { Controller, useForm, type Resolver } from "react-hook-form"

import { DTC } from "@/components/donations/donation-type-cards-strings"
import { MediaCoverUpload } from "@/components/shared/media-cover-upload"
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
import { Textarea } from "@/components/ui/textarea"
import {
  useCreateDonationTypeCard,
  useUpdateDonationTypeCard,
} from "@/hooks/useDonationTypeCards"
import { extractApiErrorMessage } from "@/lib/api-error"
import { donationTypeCardFormValuesToPayload } from "@/lib/donation-type-card-form-data"
import { toastError, toastSuccess } from "@/lib/toast"
import { cn } from "@/lib/utils"
import {
  defaultDonationTypeCardValues,
  donationTypeCardDtoToFormValues,
  donationTypeCardSchema,
  type DonationTypeCardFormValues,
} from "@/lib/validations/donation-type-card"
import type { DonationTypeCardDto } from "@/types/donation-type-card"

const sectionCard =
  "rounded-xl border border-border/60 bg-card/50 p-4 shadow-xs"

const sectionHeading =
  "inline-flex items-center gap-2 text-sm font-semibold text-foreground before:h-3.5 before:w-1 before:rounded-full before:bg-primary/70 before:content-['']"

/**
 * `403` comes back with an empty body, so `extractApiErrorMessage` finds nothing
 * to read and the toast needs its own copy.
 */
function donationTypeCardErrorMessage(err: unknown): string {
  const status = (err as { response?: { status?: number } })?.response?.status
  if (status === 403) return DTC.error.forbidden
  if (status === 404) return DTC.error.notFound
  return extractApiErrorMessage(err) ?? DTC.error.generic
}

export function DonationTypeCardDialog({
  open,
  onOpenChange,
  card,
  nextDisplayOrder,
  isFeatured,
  onSaved,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  /** Absent for a new card. */
  card?: DonationTypeCardDto | null
  /** Where a new card lands — the end of the rail. */
  nextDisplayOrder: number
  /** This row is at position 0, so the site will render it as the big card. */
  isFeatured: boolean
  onSaved: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[calc(100dvh-4rem)] gap-0 overflow-y-auto p-0 sm:max-w-2xl"
        dir="rtl"
      >
        {/* Keyed by row, so each card gets a fresh mount and `defaultValues`
            are already right — no reset-on-open effect chasing the selection.
            The caller holds `card` steady while the popup fades out, so this
            never swaps an edit form for a blank one mid-animation. */}
        <DonationTypeCardDialogBody
          key={card?.id ?? "new"}
          card={card ?? undefined}
          nextDisplayOrder={nextDisplayOrder}
          isFeatured={isFeatured}
          onSaved={onSaved}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function DonationTypeCardDialogBody({
  card,
  nextDisplayOrder,
  isFeatured,
  onSaved,
  onCancel,
}: {
  card?: DonationTypeCardDto
  nextDisplayOrder: number
  isFeatured: boolean
  onSaved: () => void
  onCancel: () => void
}) {
  const mode = card?.id ? "edit" : "create"
  const rowId = card?.id ?? null
  const createMut = useCreateDonationTypeCard()
  const updateMut = useUpdateDonationTypeCard()
  const pending = createMut.isPending || updateMut.isPending

  // The two rules the backend actually rejects a card for. They are checked here
  // rather than in the schema so no field is marked required while it is being
  // typed — the message appears only once the editor tries to save.
  const [blockers, setBlockers] = useState<string[]>([])

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<DonationTypeCardFormValues>({
    resolver: zodResolver(
      donationTypeCardSchema,
    ) as Resolver<DonationTypeCardFormValues>,
    defaultValues: card
      ? donationTypeCardDtoToFormValues(card)
      : defaultDonationTypeCardValues(nextDisplayOrder),
    mode: "onChange",
  })

  const onSubmit = handleSubmit(
    (values) => {
      const payload = donationTypeCardFormValuesToPayload(values)

      const found: string[] = []
      if (!payload.titleCkb && !payload.titleKmr) {
        found.push(DTC.error.titleRequired)
      }
      if (!payload.imageUrl) found.push(DTC.error.imageRequired)
      setBlockers(found)
      if (found.length > 0) return

      const handleSuccess = (created: boolean) => {
        toastSuccess(created ? DTC.toast.created : DTC.toast.saved)
        onSaved()
      }
      const handleError = (err: unknown) =>
        toastError(donationTypeCardErrorMessage(err))

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
    () => toastError(DTC.error.validation),
  )

  const switchId = `donation-type-card-active-${rowId ?? "new"}`

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void onSubmit()
      }}
    >
      <DialogHeader className="p-4 pb-3 text-start">
        <DialogTitle className="text-start">
          {mode === "create" ? DTC.dialog.createTitle : DTC.dialog.editTitle}
        </DialogTitle>
        <DialogDescription className="text-start">
          {DTC.dialog.description}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 px-4 pb-4">
        {isFeatured ? (
          <p className="border-primary/30 bg-primary/5 text-foreground flex items-start gap-2 rounded-lg border p-3 text-xs leading-relaxed">
            <StarIcon className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{DTC.featured.explainer}</span>
          </p>
        ) : null}

        <section className={cn("space-y-3", sectionCard)}>
          <h3 className={sectionHeading}>{DTC.section.titles}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">
                {DTC.field.titleCkb}
              </Label>
              <Input className="h-9" {...register("titleCkb")} />
              {errors.titleCkb ? (
                <p className="text-destructive text-xs">{DTC.error.tooLong}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">
                {DTC.field.titleKmr}
              </Label>
              <Input className="h-9" {...register("titleKmr")} />
              {errors.titleKmr ? (
                <p className="text-destructive text-xs">{DTC.error.tooLong}</p>
              ) : null}
            </div>
          </div>
          <p className="text-muted-foreground text-xs">{DTC.field.titleHint}</p>
        </section>

        <section className={cn("space-y-3", sectionCard)}>
          <h3 className={sectionHeading}>{DTC.section.descriptions}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">
                {DTC.field.descriptionCkb}
              </Label>
              <Textarea rows={4} {...register("descriptionCkb")} />
              {errors.descriptionCkb ? (
                <p className="text-destructive text-xs">{DTC.error.tooLong}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">
                {DTC.field.descriptionKmr}
              </Label>
              <Textarea rows={4} {...register("descriptionKmr")} />
              {errors.descriptionKmr ? (
                <p className="text-destructive text-xs">{DTC.error.tooLong}</p>
              ) : null}
            </div>
          </div>
          <p className="text-muted-foreground text-xs">
            {DTC.field.descriptionHint}
          </p>
        </section>

        <section className={cn("space-y-3", sectionCard)}>
          <h3 className={sectionHeading}>{DTC.section.image}</h3>
          <Controller
            control={control}
            name="imageUrl"
            render={({ field }) => (
              <MediaCoverUpload
                previewUrl={field.value?.trim() || null}
                urlValue={field.value ?? ""}
                onUrlChange={field.onChange}
                urlError={
                  errors.imageUrl
                    ? errors.imageUrl.message === "image_url_format"
                      ? DTC.error.imageUrlFormat
                      : DTC.error.tooLong
                    : undefined
                }
                helperText={DTC.field.imageDropHint}
                aspectClass="aspect-[4/3]"
              />
            )}
          />
          <p className="text-muted-foreground text-xs leading-relaxed">
            {DTC.field.imageHint}
          </p>
        </section>

        <div className={cn("flex items-center gap-3", sectionCard)}>
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
              {DTC.field.active}
            </Label>
            <p className="text-muted-foreground text-xs">
              {DTC.field.activeHint}
            </p>
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
          {DTC.action.cancel}
        </Button>
        {/* Deliberately never disabled for a missing title or picture: a dead
            button explains nothing. Pressing it names what is missing instead. */}
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner className="me-2 size-4" aria-hidden /> : null}
          {pending ? DTC.action.saving : DTC.action.save}
        </Button>
      </DialogFooter>
    </form>
  )
}
