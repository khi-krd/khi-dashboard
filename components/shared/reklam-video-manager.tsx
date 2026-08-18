"use client"

import {
  ArrowPathIcon,
  ArrowUpTrayIcon,
  ClipboardDocumentIcon,
  FilmIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"
import type { MouseEvent, ReactNode } from "react"
import { useState } from "react"
import { toast } from "sonner"

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
import { Button, buttonVariants } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useFileUpload } from "@/hooks/use-file-upload"
import {
  useCreateReklamVideoMutation,
  useDeleteReklamVideoMutation,
  useReklamVideoQuery,
  useUpdateReklamVideoMutation,
} from "@/hooks/useReklamVideo"
import { extractApiErrorMessage, extractApiErrorReason } from "@/lib/api-error"
import {
  formatFullTimestampKu,
  formatRelativeTimeKu,
} from "@/lib/news-relative-time"
import type { ReklamVideoConfig } from "@/lib/reklam-video"
import { isReklamVideoConflict } from "@/services/reklamVideoService"
// A plain byte formatter that happens to live in the sound module; it handles
// `null` and renders an em-dash, which the generic one in `use-file-upload`
// does not.
import { formatBytes } from "@/lib/sound-format"
import { cn } from "@/lib/utils"

/**
 * All copy the screen needs. Supplied per module so the Sorani strings stay in
 * `sounds-strings` / `videos-strings` alongside the rest of their module,
 * while the screen itself stays generic.
 */
export type ReklamVideoStrings = {
  title: string
  subtitle: string
  statusActive: string
  statusEmpty: string
  helper: string
  /** Extra composition guidance, rendered as bullets under the uploader. */
  notes?: string[]
  maxSizeLabel: (size: string) => string
  upload: string
  replace: string
  uploading: string
  dropHint: string
  dropReplace: string
  copyUrl: string
  emptyTitle: string
  emptySubtitle: string
  deleteTitle: string
  deleteBody: string
  metaSize: string
  metaMime: string
  metaUpdatedAt: string
  metaCreatedAt: string
  conflict: string
  alreadyGone: string
  toastCreated: string
  toastUpdated: string
  toastDeleted: string
  toastCopied: string
  errorGeneric: string
  errorForbidden: string
  errorRetry: string
  actionDelete: string
  actionCancel: string
  actionBack: string
  dash: string
}

/**
 * The upload / replace / remove screen for a singleton promo video. Drives both
 * the Sound section's and the homepage Film section's, which are the same
 * resource with different paths and message keys — see `lib/reklam-video`.
 *
 * The screen never shows Upload and Replace at once: which verb applies is a
 * property of whether a row exists, and the singleton rule means guessing wrong
 * is an error rather than a no-op.
 */
export function ReklamVideoManager({
  config,
  strings,
  breadcrumb,
  backHref,
}: {
  config: ReklamVideoConfig
  strings: ReklamVideoStrings
  breadcrumb?: ReactNode
  backHref: string
}) {
  const videoQ = useReklamVideoQuery(config)
  const createMut = useCreateReklamVideoMutation(config)
  const updateMut = useUpdateReklamVideoMutation(config)
  const deleteMut = useDeleteReklamVideoMutation(config)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const video = videoQ.data ?? null
  const hasVideo = Boolean(video?.videoUrl)
  const isUploading = createMut.isPending || updateMut.isPending
  const isBusy = isUploading || deleteMut.isPending

  const [
    { isDragging, errors },
    {
      clearErrors,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
      removeFile,
    },
  ] = useFileUpload({
    maxFiles: 1,
    maxSize: config.maxBytes,
    accept: config.accept,
    multiple: false,
    onFilesAdded: (added) => {
      const entry = added[0]
      if (!entry?.file || !(entry.file instanceof File)) return
      void uploadFile(entry.file)
      queueMicrotask(() => removeFile(entry.id))
    },
  })

  /**
   * The sound endpoint reports an S3 failure as a `502` carrying the cause in
   * `details.reason`, the film one as a `400` — either way the reason is the
   * useful half, so it is read before the message. A `403` carries no body at
   * all (upload wants `EMPLOYEE` and up, delete wants `ADMIN`), so that one
   * needs its own copy or it degrades into "something went wrong" for what is
   * really a permissions problem.
   */
  function errorText(err: unknown): string {
    const status = (err as { response?: { status?: number } })?.response?.status
    if (status === 403) return strings.errorForbidden
    return (
      extractApiErrorReason(err) ??
      extractApiErrorMessage(err) ??
      strings.errorGeneric
    )
  }

  function uploadFile(file: File) {
    clearErrors()
    const mutate = hasVideo ? updateMut.mutate : createMut.mutate
    mutate(file, {
      onSuccess: () => {
        toast.success(hasVideo ? strings.toastUpdated : strings.toastCreated)
      },
      onError: (err) => {
        // Not a failure so much as a lost race: the hook has already pulled in
        // the video the other editor uploaded, so this screen is about to
        // switch itself from Upload to Replace. Their file is left intact and
        // the editor is told how to override it if they still want to.
        if (isReklamVideoConflict(config, err)) {
          toast.warning(strings.conflict)
          return
        }
        toast.error(errorText(err))
      },
    })
  }

  async function copyUrl() {
    if (!video?.videoUrl) return
    try {
      await navigator.clipboard.writeText(video.videoUrl)
      toast.success(strings.toastCopied)
    } catch {
      toast.error(strings.errorGeneric)
    }
  }

  return (
    <div dir="rtl" className="mx-auto max-w-4xl space-y-8 px-4 py-6 lg:px-6">
      {breadcrumb}

      <header className="border-border/60 space-y-3 border-b pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {strings.title}
          </h1>
          {videoQ.isLoading ? null : (
            <Badge variant={hasVideo ? "secondary" : "outline"}>
              {hasVideo ? strings.statusActive : strings.statusEmpty}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          {strings.subtitle}
        </p>
      </header>

      <input {...getInputProps()} className="sr-only" />

      {videoQ.isError ? (
        <div className="border-border text-muted-foreground flex flex-col items-center gap-3 rounded-xl border border-dashed py-14 text-center">
          <p className="text-sm">{strings.errorGeneric}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void videoQ.refetch()}
          >
            {strings.errorRetry}
          </Button>
        </div>
      ) : videoQ.isLoading ? (
        <div className="bg-muted/20 flex aspect-video items-center justify-center rounded-xl border border-dashed">
          <Spinner className="size-6" />
        </div>
      ) : (
        <section className="space-y-4">
          <div
            role={hasVideo ? undefined : "button"}
            tabIndex={hasVideo || isBusy ? undefined : 0}
            onClick={
              hasVideo || isBusy
                ? undefined
                : () => {
                    openFileDialog()
                  }
            }
            onKeyDown={
              hasVideo || isBusy
                ? undefined
                : (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      openFileDialog()
                    }
                  }
            }
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={cn(
              "group relative overflow-hidden rounded-xl border transition-all",
              "aspect-video",
              hasVideo
                ? "border-border bg-black shadow-sm"
                : "border-muted-foreground/25 hover:border-muted-foreground/45 bg-muted/20 cursor-pointer border-dashed",
              isDragging &&
                "border-primary bg-primary/5 ring-primary/30 ring-offset-background ring-2 ring-offset-2",
              isBusy && !hasVideo && "pointer-events-none opacity-70",
            )}
          >
            {hasVideo ? (
              <>
                {/*
                  Keyed on `updatedAt`, which changes on every replace. The URL
                  alone is not enough: a replace that happens to reuse the same
                  S3 object key leaves `videoUrl` identical, and the player then
                  sits on the previous file with no reason to reload it.
                */}
                <video
                  key={video!.updatedAt ?? video!.videoUrl}
                  src={video!.videoUrl}
                  controls
                  playsInline
                  // The film background is muted, looping and autoplaying on the
                  // live site, so the preview mirrors that rather than showing
                  // a still frame of something the visitor never sees paused.
                  autoPlay={config.kind === "film"}
                  loop={config.kind === "film"}
                  muted={config.kind === "film"}
                  className="size-full object-contain"
                />
                {isDragging ? (
                  <div className="bg-background/85 absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                    <ArrowUpTrayIcon className="text-primary size-8" />
                    <p className="text-foreground text-sm font-medium">
                      {strings.dropReplace}
                    </p>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-4 px-6 text-center">
                <div
                  className={cn(
                    "bg-background/80 text-muted-foreground flex size-16 items-center justify-center rounded-full border shadow-sm transition-colors",
                    isDragging && "border-primary text-primary",
                  )}
                >
                  {isUploading ? (
                    <Spinner className="size-7" />
                  ) : (
                    <FilmIcon className="size-7" aria-hidden />
                  )}
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-foreground text-base font-medium">
                    {isUploading
                      ? strings.uploading
                      : isDragging
                        ? strings.dropReplace
                        : strings.emptyTitle}
                  </h2>
                  <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
                    {isUploading ? strings.helper : strings.emptySubtitle}
                  </p>
                </div>
                {!isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="pointer-events-none gap-1.5"
                      tabIndex={-1}
                    >
                      <ArrowUpTrayIcon className="size-4" aria-hidden />
                      {strings.upload}
                    </Button>
                    <p className="text-muted-foreground text-xs">
                      {strings.dropHint}
                    </p>
                    <p className="text-muted-foreground/80 text-xs">
                      {strings.helper} ·{" "}
                      {strings.maxSizeLabel(formatBytes(config.maxBytes))}
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            {isUploading && hasVideo ? (
              <div className="bg-background/75 absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
                <Spinner className="size-8" />
                <p className="text-foreground text-sm font-medium">
                  {strings.uploading}
                </p>
              </div>
            ) : null}
          </div>

          {hasVideo ? (
            <div className="bg-muted/30 flex flex-col gap-4 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <dl className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <div className="flex items-baseline gap-1.5">
                  <dt className="text-muted-foreground text-xs">
                    {strings.metaSize}
                  </dt>
                  <dd className="font-mono text-xs tabular-nums">
                    {formatBytes(video!.sizeBytes)}
                  </dd>
                </div>
                <div className="bg-border hidden h-3 w-px sm:block" aria-hidden />
                <div className="flex items-baseline gap-1.5">
                  <dt className="text-muted-foreground text-xs">
                    {strings.metaMime}
                  </dt>
                  <dd className="font-mono text-xs">
                    {video!.mimeType?.trim() || strings.dash}
                  </dd>
                </div>
                <div className="bg-border hidden h-3 w-px sm:block" aria-hidden />
                <div className="flex items-baseline gap-1.5">
                  <dt className="text-muted-foreground text-xs">
                    {strings.metaUpdatedAt}
                  </dt>
                  <dd
                    className="text-xs"
                    title={
                      video!.updatedAt
                        ? formatFullTimestampKu(video!.updatedAt)
                        : undefined
                    }
                  >
                    {video!.updatedAt
                      ? formatRelativeTimeKu(video!.updatedAt)
                      : strings.dash}
                  </dd>
                </div>
                {video!.createdAt ? (
                  <>
                    <div
                      className="bg-border hidden h-3 w-px sm:block"
                      aria-hidden
                    />
                    <div className="flex items-baseline gap-1.5">
                      <dt className="text-muted-foreground text-xs">
                        {strings.metaCreatedAt}
                      </dt>
                      <dd
                        className="text-xs"
                        title={formatFullTimestampKu(video!.createdAt)}
                      >
                        {formatRelativeTimeKu(video!.createdAt)}
                      </dd>
                    </div>
                  </>
                ) : null}
              </dl>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isBusy}
                  onClick={openFileDialog}
                  className="gap-1.5"
                >
                  {isUploading ? (
                    <Spinner className="size-3.5" aria-hidden />
                  ) : (
                    <ArrowPathIcon className="size-3.5" aria-hidden />
                  )}
                  {isUploading ? strings.uploading : strings.replace}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isBusy}
                  onClick={() => void copyUrl()}
                  className="gap-1.5"
                >
                  <ClipboardDocumentIcon className="size-3.5" aria-hidden />
                  {strings.copyUrl}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isBusy}
                  onClick={() => setDeleteOpen(true)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5"
                >
                  <TrashIcon className="size-3.5" aria-hidden />
                  {strings.actionDelete}
                </Button>
              </div>
            </div>
          ) : null}

          {strings.notes?.length ? (
            <ul className="text-muted-foreground space-y-1 text-xs leading-relaxed">
              {strings.notes.map((note) => (
                <li key={note} className="flex gap-2">
                  <span aria-hidden>•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {hasVideo ? (
            <p className="text-muted-foreground text-xs leading-relaxed">
              {strings.helper} — {strings.dropHint}
            </p>
          ) : null}

          {errors.length > 0 ? (
            <p className="text-destructive text-sm" role="alert">
              {errors[0]}
            </p>
          ) : null}
        </section>
      )}

      <Link
        href={backHref}
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "rounded-md",
        )}
      >
        {strings.actionBack}
      </Link>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent
          size="default"
          className="border-border max-w-md rounded-lg border"
        >
          <AlertDialogHeader className="text-start">
            <AlertDialogTitle className="text-start">
              {strings.deleteTitle}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-start text-sm leading-relaxed">
              {strings.deleteBody}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-between">
            <AlertDialogCancel className="rounded-md">
              {strings.actionCancel}
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMut.isPending}
              className="rounded-md"
              onClick={(e: MouseEvent<HTMLButtonElement>) => {
                e.preventDefault()
                deleteMut.mutate(undefined, {
                  onSuccess: ({ alreadyGone }) => {
                    // Deleting twice `404`s — the endpoint is not idempotent —
                    // but the video being gone is what the button asked for
                    // either way.
                    toast.success(
                      alreadyGone ? strings.alreadyGone : strings.toastDeleted,
                    )
                    setDeleteOpen(false)
                  },
                  onError: (err) => toast.error(errorText(err)),
                })
              }}
            >
              {deleteMut.isPending ? (
                <Spinner className="me-2 size-4" aria-hidden />
              ) : null}
              {strings.actionDelete}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
