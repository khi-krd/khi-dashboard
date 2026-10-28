"use client"

import { CheckIcon } from "@heroicons/react/24/outline"
import { useState } from "react"

import { NM, truncateLabel } from "@/components/menu/nav-menu-strings"
import { MediaCoverUpload } from "@/components/shared/media-cover-upload"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useUpdateNavMenuItem } from "@/hooks/useNavMenu"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { navMenuImagePayload } from "@/lib/nav-menu-form-data"
import { toastApiError, toastSuccess } from "@/lib/toast"
import type { NavMenuItemDto } from "@/types/nav-menu"

/**
 * One menu link and its background photo. The link itself (label + href) is
 * read-only — the website owns it; the only thing editable here is the image.
 *
 * The caller keys this card by `id:imageUrl`, so a server-side change remounts
 * it and the staged URL re-seeds — a stale value can never be sent back.
 */
export function NavMenuItemCard({
  index,
  dto,
  onSaved,
}: {
  index: number
  dto: NavMenuItemDto
  onSaved: () => void
}) {
  const updateMut = useUpdateNavMenuItem()
  const [imageUrl, setImageUrl] = useState(dto.imageUrl ?? "")

  const dirty = imageUrl.trim() !== (dto.imageUrl ?? "").trim()

  const save = () => {
    if (!dto.id) return
    updateMut.mutate(
      { id: dto.id, payload: navMenuImagePayload(imageUrl) },
      {
        onSuccess: () => {
          toastSuccess(NM.toast.saved)
          onSaved()
        },
        onError: (err) =>
          toastApiError(err, NM.error.generic),
      },
    )
  }

  const label = truncateLabel(dto.labelCkb || dto.labelKmr || "", 80)

  return (
    <section className="bg-card/50 rounded-lg border border-border/60 p-4 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-muted-foreground text-xs">
            {NM.page.itemLabel(formatCkbDigits(index + 1))}
            <span className="font-mono" dir="ltr">
              {" · "}
              {dto.itemKey}
            </span>
            {!dto.active ? ` · ${NM.field.inactive}` : null}
          </p>
          <p className="truncate text-sm font-medium">{label || NM.dash}</p>
          <p
            className="text-muted-foreground truncate font-mono text-xs"
            dir="ltr"
          >
            {dto.href || NM.dash}
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          className="shrink-0 gap-1"
          disabled={updateMut.isPending || !dirty || !dto.id}
          onClick={save}
        >
          {updateMut.isPending ? (
            <Spinner className="size-3.5" />
          ) : (
            <CheckIcon className="size-3.5" />
          )}
          {updateMut.isPending ? NM.action.saving : NM.action.save}
        </Button>
      </div>

      <div className="mt-4">
        <MediaCoverUpload entity="nav"
          label={NM.field.image}
          previewUrl={imageUrl || null}
          urlValue={imageUrl}
          onUrlChange={setImageUrl}
          helperText={NM.field.imageHint}
          aspectClass="aspect-[21/9]"
        />
      </div>
    </section>
  )
}
