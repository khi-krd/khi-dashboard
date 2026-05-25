"use client"

import * as React from "react"
import { ArrowUpTrayIcon, TrashIcon } from "@heroicons/react/24/outline"
import { useQueryClient } from "@tanstack/react-query"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { resolveAvatarSrc } from "@/lib/profile-image"
import { systemToast, toastError } from "@/lib/toast"
import {
  deleteProfileImage,
  uploadProfileImage,
} from "@/services/auth.service"
import type { UserResponse } from "@/types/auth"

const MAX_BYTES = 5 * 1024 * 1024
const ACCEPTED = ["image/png", "image/jpeg", "image/webp"]

function initialsOf(user: UserResponse): string {
  const source = user.name?.trim() || user.username?.trim() || user.email?.trim()
  return source ? source.slice(0, 2).toUpperCase() : "؟"
}

export function ProfileImageCard({ user }: { user: UserResponse }) {
  const queryClient = useQueryClient()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [busy, setBusy] = React.useState<"upload" | "delete" | null>(null)

  const currentSrc = resolveAvatarSrc(user)
  const hasImage = currentSrc.length > 0

  const onSelectFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = "" // allow re-selecting the same file later
    if (!file) return

    if (!ACCEPTED.includes(file.type)) {
      toastError("جۆری فایل پشتگیری ناکرێت", "تەنها PNG، JPEG یان WEBP")
      return
    }
    if (file.size > MAX_BYTES) {
      toastError("فایلەکە زۆر گەورەیە", "زۆرترین قەبارە ٥ مێگابایتە")
      return
    }

    setBusy("upload")
    try {
      const updated = await uploadProfileImage(file)
      syncCurrentUser(queryClient, updated)
      systemToast.uploadSuccess()
    } catch {
      systemToast.uploadError()
    } finally {
      setBusy(null)
    }
  }

  const onRemove = async () => {
    setBusy("delete")
    try {
      const updated = await deleteProfileImage()
      syncCurrentUser(queryClient, updated)
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
        <CardDescription>PNG، JPEG یان WEBP — زۆرترین ٥ مێگابایت</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-4">
        <Avatar className="size-16">
          <AvatarImage src={currentSrc} alt={user.name} />
          <AvatarFallback className="text-lg">{initialsOf(user)}</AvatarFallback>
        </Avatar>

        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(",")}
            className="hidden"
            onChange={onSelectFile}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy !== null}
            onClick={() => inputRef.current?.click()}
          >
            {busy === "upload" ? (
              <Spinner className="size-4" />
            ) : (
              <ArrowUpTrayIcon className="size-4" />
            )}
            {hasImage ? "گۆڕینی وێنە" : "بارکردنی وێنە"}
          </Button>

          {hasImage ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={busy !== null}
              onClick={() => void onRemove()}
            >
              {busy === "delete" ? (
                <Spinner className="size-4" />
              ) : (
                <TrashIcon className="size-4" />
              )}
              سڕینەوە
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
