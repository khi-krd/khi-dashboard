"use client"

import { useState } from "react"
import { Controller, useForm, type Resolver } from "react-hook-form"

import { DAV } from "@/components/donations/donation-archive-videos-strings"
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
  useCreateDonationArchiveVideo,
  useUpdateDonationArchiveVideo,
} from "@/hooks/useDonationArchiveVideos"
import { permissiveResolver } from "@/lib/permissive-resolver"
import { extractApiErrorMessage } from "@/lib/api-error"
import { donationArchiveVideoFormValuesToPayload } from "@/lib/donation-archive-video-form-data"
import { toastError, toastSuccess } from "@/lib/toast"
import { cn } from "@/lib/utils"
import {
  defaultDonationArchiveVideoValues,
  donationArchiveVideoDtoToFormValues,
  donationArchiveVideoSchema,
  type DonationArchiveVideoFormValues,
} from "@/lib/validations/donation-archive-video"
import type { DonationArchiveVideoDto } from "@/types/donation-archive-video"

const sectionCard =
  "rounded-xl border border-border/60 bg-card/50 p-4 shadow-xs"

const sectionHeading =
  "inline-flex items-center gap-2 text-sm font-semibold text-foreground before:h-3.5 before:w-1 before:rounded-full before:bg-primary/70 before:content-['']"

/**
 * `403` comes back with an empty body, so `extractApiErrorMessage` finds nothing
 * to read and the toast needs its own copy.
 */
function donationArchiveVideoErrorMessage(err: unknown): string {
  const status = (err as { response?: { status?: number } })?.response?.status
  if (status === 403) return DAV.error.forbidden
  if (status === 404) return DAV.error.notFound
  return extractApiErrorMessage(err) ?? DAV.error.generic
}

export function DonationArchiveVideoDialog({
  open,
  onOpenChange,
  video,
  nextDisplayOrder,
  onSaved,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  /** Absent for a new video. */
  video?: DonationArchiveVideoDto | null
  /** Where a new video lands — the end of the list. */
  nextDisplayOrder: number
  onSaved: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[calc(100dvh-4rem)] gap-0 overflow-y-auto p-0 sm:max-w-2xl"
        dir="rtl"
      >
        {/* Keyed by row, so each video gets a fresh mount and `defaultValues`
            are already right — no reset-on-open effect chasing the selection. */}
        <DonationArchiveVideoDialogBody
          key={video?.id ?? "new"}
          video={video ?? undefined}
          nextDisplayOrder={nextDisplayOrder}
          onSaved={onSaved}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function DonationArchiveVideoDialogBody({
  video,
  nextDisplayOrder,
  onSaved,
  onCancel,
}: {
  video?: DonationArchiveVideoDto
  nextDisplayOrder: number
  onSaved: () => void
  onCancel: () => void
}) {
  const mode = video?.id ? "edit" : "create"
  const rowId = video?.id ?? null
  const createMut = useCreateDonationArchiveVideo()
  const updateMut = useUpdateDonationArchiveVideo()
  const pending = createMut.isPending || updateMut.isPending

  // The two rules a clip genuinely cannot work without. Checked here rather
  // than in the schema so no field is marked required while it is being typed —
  // the message appears only once the editor tries to save.
  const [blockers, setBlockers] = useState<string[]>([])

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<DonationArchiveVideoFormValues>({
    resolver: permissiveResolver(
      donationArchiveVideoSchema,
    ) as Resolver<DonationArchiveVideoFormValues>,
    defaultValues: video
      ? donationArchiveVideoDtoToFormValues(video)
      : defaultDonationArchiveVideoValues(nextDisplayOrder),
    mode: "onChange",
  })

  const onSubmit = handleSubmit(
    (values) => {
      const payload = donationArchiveVideoFormValuesToPayload(values)

      const found: string[] = []
      if (!payload.titleCkb && !payload.titleKmr) {
        found.push(DAV.error.titleRequired)
      }
      if (!payload.videoUrl) found.push(DAV.error.videoRequired)
      setBlockers(found)
      if (found.length > 0) return

      const handleSuccess = (created: boolean) => {
        toastSuccess(created ? DAV.toast.created : DAV.toast.saved)
        onSaved()
      }
      const handleError = (err: unknown) =>
        toastError(donationArchiveVideoErrorMessage(err))

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
    () => toastError(DAV.error.validation),
  )

  const switchId = `donation-archive-video-active-${rowId ?? "new"}`

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void onSubmit()
      }}
    >
      <DialogHeader className="p-4 pb-3 text-start">
        <DialogTitle className="text-start">
          {mode === "create" ? DAV.dialog.createTitle : DAV.dialog.editTitle}
        </DialogTitle>
        <DialogDescription className="text-start">
          {DAV.dialog.description}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 px-4 pb-4">
        <section className={cn("space-y-3", sectionCard)}>
          <h3 className={sectionHeading}>{DAV.section.titles}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">
                {DAV.field.titleCkb}
              </Label>
              <Input className="h-9" {...register("titleCkb")} />
              {errors.titleCkb ? (
                <p className="text-destructive text-xs">{DAV.error.tooLong}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">
                {DAV.field.titleKmr}
              </Label>
              <Input className="h-9" {...register("titleKmr")} />
              {errors.titleKmr ? (
                <p className="text-destructive text-xs">{DAV.error.tooLong}</p>
              ) : null}
            </div>
          </div>
          <p className="text-muted-foreground text-xs">{DAV.field.titleHint}</p>
        </section>

        <section className={cn("space-y-3", sectionCard)}>
          <h3 className={sectionHeading}>{DAV.section.descriptions}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">
                {DAV.field.descriptionCkb}
              </Label>
              <Textarea rows={3} {...register("descriptionCkb")} />
              {errors.descriptionCkb ? (
                <p className="text-destructive text-xs">{DAV.error.tooLong}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">
                {DAV.field.descriptionKmr}
              </Label>
              <Textarea rows={3} {...register("descriptionKmr")} />
              {errors.descriptionKmr ? (
                <p className="text-destructive text-xs">{DAV.error.tooLong}</p>
              ) : null}
            </div>
          </div>
          <p className="text-muted-foreground text-xs">
            {DAV.field.descriptionHint}
          </p>
        </section>

        <section className={cn("space-y-3", sectionCard)}>
          <h3 className={sectionHeading}>{DAV.section.video}</h3>
          <Controller
            control={control}
            name="videoUrl"
            render={({ field }) => (
              <MediaCoverUpload
                entity="donations"
                variant="video"
                previewUrl={field.value?.trim() || null}
                urlValue={field.value ?? ""}
                onUrlChange={field.onChange}
                urlError={
                  errors.videoUrl
                    ? errors.videoUrl.message === "video_url_format"
                      ? DAV.error.videoUrlFormat
                      : DAV.error.tooLong
                    : undefined
                }
                helperText={DAV.field.videoDropHint}
                aspectClass="aspect-video"
              />
            )}
          />
          <p className="text-muted-foreground text-xs leading-relaxed">
            {DAV.field.videoHint}
          </p>
        </section>

        <section className={cn("space-y-3", sectionCard)}>
          <h3 className={sectionHeading}>{DAV.section.poster}</h3>
          <Controller
            control={control}
            name="posterUrl"
            render={({ field }) => (
              <MediaCoverUpload
                entity="donations"
                previewUrl={field.value?.trim() || null}
                urlValue={field.value ?? ""}
                onUrlChange={field.onChange}
                urlError={
                  errors.posterUrl
                    ? errors.posterUrl.message === "poster_url_format"
                      ? DAV.error.posterUrlFormat
                      : DAV.error.tooLong
                    : undefined
                }
                helperText={DAV.field.posterDropHint}
                aspectClass="aspect-video"
                compact
              />
            )}
          />
          <p className="text-muted-foreground text-xs leading-relaxed">
            {DAV.field.posterHint}
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
              {DAV.field.active}
            </Label>
            <p className="text-muted-foreground text-xs">
              {DAV.field.activeHint}
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
          {DAV.action.cancel}
        </Button>
        {/* Deliberately never disabled for a missing title or clip: a dead
            button explains nothing. Pressing it names what is missing instead. */}
        <Button type="submit" disabled={pending}>
          {pending ? <Spinner className="me-2 size-4" aria-hidden /> : null}
          {pending ? DAV.action.saving : DAV.action.save}
        </Button>
      </DialogFooter>
    </form>
  )
}
