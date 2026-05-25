"use client"

import * as React from "react"
import { useQueryClient } from "@tanstack/react-query"
import { HugeiconsIcon } from "@hugeicons/react"
import { AlertCircleIcon, MultiplicationSignIcon } from "@hugeicons/core-free-icons"

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/reui/alert"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { syncCurrentUser } from "@/hooks/use-current-user"
import {
  formatBytes,
  useFileUpload,
} from "@/hooks/use-file-upload"
import { resolveAvatarSrc } from "@/lib/profile-image"
import { cn } from "@/lib/utils"
import { systemToast } from "@/lib/toast"
import {
  deleteProfileImage,
  uploadProfileImage,
} from "@/services/auth.service"
import type { UserResponse } from "@/types/auth"

const MAX_BYTES = 5 * 1024 * 1024
const ACCEPT = "image/png,image/jpeg,image/webp"

function initialsOf(user: UserResponse): string {
  const source = user.name?.trim() || user.username?.trim() || user.email?.trim()
  return source ? source.slice(0, 2).toUpperCase() : "؟"
}

/** Profile avatar upload — `@reui/c-file-upload-2` pattern + API sync. */
export function ProfileImageCard({ user }: { user: UserResponse }) {
  const queryClient = useQueryClient()
  const [busy, setBusy] = React.useState<"upload" | "delete" | null>(null)

  const currentSrc = resolveAvatarSrc(user)
  const hasImage = currentSrc.length > 0

  const [
    { files, isDragging, errors },
    {
      removeFile,
      clearFiles,
      clearErrors,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ] = useFileUpload({
    maxFiles: 1,
    maxSize: MAX_BYTES,
    accept: ACCEPT,
    multiple: false,
    onFilesAdded: (added) => {
      const entry = added[0]
      if (!entry?.file || !(entry.file instanceof File)) return
      void uploadFile(entry.file, entry.id)
    },
  })

  const currentFile = files[0]
  const previewUrl = currentFile?.preview || (hasImage ? currentSrc : undefined)
  const showRemove = Boolean(currentFile) || hasImage

  async function uploadFile(file: File, fileId: string) {
    clearErrors()
    setBusy("upload")
    try {
      const updated = await uploadProfileImage(file)
      syncCurrentUser(queryClient, updated)
      removeFile(fileId)
      systemToast.uploadSuccess()
    } catch {
      removeFile(fileId)
      systemToast.uploadError()
    } finally {
      setBusy(null)
    }
  }

  async function handleRemove() {
    if (busy) return

    if (currentFile) {
      removeFile(currentFile.id)
    }

    if (!hasImage) return

    setBusy("delete")
    try {
      const updated = await deleteProfileImage()
      syncCurrentUser(queryClient, updated)
      clearFiles()
      systemToast.deleteSuccess()
    } catch {
      systemToast.deleteError()
    } finally {
      setBusy(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>وێنەی پرۆفایل</CardTitle>
        <CardDescription>
          PNG، JPEG یان WEBP — زۆرترین {formatBytes(MAX_BYTES)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div
              className={cn(
                "group/avatar relative size-24 cursor-pointer overflow-hidden rounded-full border border-dashed transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/20",
                previewUrl && "border-solid",
                busy && "pointer-events-none opacity-70",
              )}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={openFileDialog}
            >
              <input {...getInputProps()} className="sr-only" />

              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt={user.name}
                  className="size-full object-cover"
                />
              ) : (
                <div className="bg-muted text-muted-foreground flex size-full items-center justify-center text-lg font-medium">
                  {initialsOf(user)}
                </div>
              )}

              {busy ? (
                <div className="bg-background/70 absolute inset-0 flex items-center justify-center">
                  <Spinner />
                </div>
              ) : null}
            </div>

            {showRemove && !busy ? (
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => void handleRemove()}
                className="absolute end-0.5 top-0.5 z-10 size-6 rounded-full"
                aria-label="سڕینەوەی وێنە"
              >
                <HugeiconsIcon
                  icon={MultiplicationSignIcon}
                  strokeWidth={2}
                  className="size-3.5"
                />
              </Button>
            ) : null}
          </div>

          <div className="flex flex-col gap-0.5 text-center">
            <p className="text-sm font-medium">
              {hasImage || currentFile ? "گۆڕینی وێنە" : "بارکردنی وێنە"}
            </p>
            <p className="text-muted-foreground text-xs">
              کرتە بکە یان فایلەکە ڕاکێشە — PNG، JPEG یان WEBP
            </p>
          </div>

          {errors.length > 0 ? (
            <Alert variant="destructive">
              <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
              <AlertTitle>هەڵە لە بارکردن</AlertTitle>
              <AlertDescription>
                {errors.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
