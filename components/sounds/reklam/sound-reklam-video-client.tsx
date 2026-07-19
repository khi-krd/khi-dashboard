"use client"

import {
  ArrowPathIcon,
  ArrowUpTrayIcon,
  ClipboardDocumentIcon,
  FilmIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { SoundReklamVideoDeleteDialog } from "@/components/sounds/reklam/sound-reklam-video-delete-dialog"
import {
  SoundBreadcrumbBar,
  dashboardSoundsCrumbHref,
} from "@/components/sounds/sound-breadcrumb"
import { SoundsErrorState } from "@/components/sounds/sound-error-state"
import { NS } from "@/components/sounds/sounds-strings"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  formatBytes,
  useFileUpload,
} from "@/hooks/use-file-upload"
import {
  useCreateSoundReklamVideoMutation,
  useDeleteSoundReklamVideoMutation,
  useSoundReklamVideoQuery,
  useUpdateSoundReklamVideoMutation,
} from "@/hooks/useSoundReklamVideo"
import {
  formatFullTimestampKu,
  formatRelativeTimeKu,
} from "@/lib/news-relative-time"
import { formatBytes as formatSoundBytes } from "@/lib/sound-format"
import { cn } from "@/lib/utils"

const MAX_BYTES = 500 * 1024 * 1024
const ACCEPT = "video/mp4,video/webm,video/quicktime,video/*"

export function SoundReklamVideoClient() {
  const videoQ = useSoundReklamVideoQuery()
  const createMut = useCreateSoundReklamVideoMutation()
  const updateMut = useUpdateSoundReklamVideoMutation()
  const deleteMut = useDeleteSoundReklamVideoMutation()

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
    maxSize: MAX_BYTES,
    accept: ACCEPT,
    multiple: false,
    onFilesAdded: (added) => {
      const entry = added[0]
      if (!entry?.file || !(entry.file instanceof File)) return
      void uploadFile(entry.file)
      queueMicrotask(() => removeFile(entry.id))
    },
  })

  function uploadFile(file: File) {
    clearErrors()
    const mutate = hasVideo ? updateMut.mutate : createMut.mutate
    mutate(file, {
      onSuccess: () => {
        toast.success(
          hasVideo ? NS.toast.reklam_updated : NS.toast.reklam_created,
        )
      },
      onError: () => toast.error(NS.error.generic),
    })
  }

  async function copyUrl() {
    if (!video?.videoUrl) return
    try {
      await navigator.clipboard.writeText(video.videoUrl)
      toast.success(NS.toast.copied)
    } catch {
      toast.error(NS.error.generic)
    }
  }

  return (
    <div dir="rtl" className="mx-auto max-w-4xl space-y-8 px-4 py-6 lg:px-6">
      <SoundBreadcrumbBar
        segments={[
          { label: NS.breadcrumb.dashboard, href: dashboardSoundsCrumbHref() },
          { label: NS.breadcrumb.sounds, href: "/dashboard/sounds" },
          { label: NS.breadcrumb.reklam },
        ]}
      />

      <header className="border-border/60 space-y-3 border-b pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {NS.reklam.page.title}
          </h1>
          {videoQ.isLoading ? null : (
            <Badge variant={hasVideo ? "secondary" : "outline"}>
              {hasVideo ? NS.reklam.status_active : NS.reklam.status_empty}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
          {NS.reklam.page.subtitle}
        </p>
      </header>

      <input {...getInputProps()} className="sr-only" />

      {videoQ.isError ? (
        <SoundsErrorState onRetry={() => void videoQ.refetch()} />
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
                : "border-muted-foreground/25 hover:border-muted-foreground/45 cursor-pointer border-dashed bg-muted/20",
              isDragging &&
                "border-primary bg-primary/5 ring-primary/30 ring-2 ring-offset-2 ring-offset-background",
              isBusy && !hasVideo && "pointer-events-none opacity-70",
            )}
          >
            {hasVideo ? (
              <>
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video
                  key={video!.videoUrl}
                  src={video!.videoUrl}
                  controls
                  playsInline
                  className="size-full object-contain"
                />
                {isDragging ? (
                  <div className="bg-background/85 absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                    <ArrowUpTrayIcon className="text-primary size-8" />
                    <p className="text-foreground text-sm font-medium">
                      {NS.reklam.drop_replace}
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
                      ? NS.reklam.uploading
                      : isDragging
                        ? NS.reklam.drop_replace
                        : NS.reklam.empty.title}
                  </h2>
                  <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
                    {isUploading
                      ? NS.reklam.helper
                      : NS.reklam.empty.subtitle}
                  </p>
                </div>
                {!isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      className="gap-1.5 pointer-events-none"
                      tabIndex={-1}
                    >
                      <ArrowUpTrayIcon className="size-4" aria-hidden />
                      {NS.reklam.upload}
                    </Button>
                    <p className="text-muted-foreground text-xs">
                      {NS.reklam.drop_hint}
                    </p>
                    <p className="text-muted-foreground/80 text-xs">
                      {NS.reklam.helper} · زۆرترین {formatBytes(MAX_BYTES)}
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            {isUploading && hasVideo ? (
              <div className="bg-background/75 absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
                <Spinner className="size-8" />
                <p className="text-foreground text-sm font-medium">
                  {NS.reklam.uploading}
                </p>
              </div>
            ) : null}
          </div>

          {hasVideo ? (
            <div className="bg-muted/30 flex flex-col gap-4 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <dl className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <div className="flex items-baseline gap-1.5">
                  <dt className="text-muted-foreground text-xs">
                    {NS.reklam.meta.size}
                  </dt>
                  <dd className="font-mono text-xs tabular-nums">
                    {formatSoundBytes(video!.sizeBytes)}
                  </dd>
                </div>
                <div className="bg-border hidden h-3 w-px sm:block" aria-hidden />
                <div className="flex items-baseline gap-1.5">
                  <dt className="text-muted-foreground text-xs">
                    {NS.reklam.meta.mime}
                  </dt>
                  <dd className="font-mono text-xs">
                    {video!.mimeType?.trim() || NS.dash}
                  </dd>
                </div>
                <div className="bg-border hidden h-3 w-px sm:block" aria-hidden />
                <div className="flex items-baseline gap-1.5">
                  <dt className="text-muted-foreground text-xs">
                    {NS.system.updated_at}
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
                      : NS.dash}
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
                        {NS.system.created_at}
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
                  {isUploading ? NS.reklam.uploading : NS.reklam.replace}
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
                  {NS.reklam.copy_url}
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
                  {NS.action.delete}
                </Button>
              </div>
            </div>
          ) : null}

          {hasVideo ? (
            <p className="text-muted-foreground text-xs leading-relaxed">
              {NS.reklam.helper} — {NS.reklam.drop_hint}
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
        href="/dashboard/sounds"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "rounded-md",
        )}
      >
        {NS.action.back}
      </Link>

      <SoundReklamVideoDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        isPending={deleteMut.isPending}
        onConfirm={() => {
          deleteMut.mutate(undefined, {
            onSuccess: () => {
              toast.success(NS.toast.reklam_deleted)
              setDeleteOpen(false)
            },
            onError: () => toast.error(NS.error.generic),
          })
        }}
      />
    </div>
  )
}
