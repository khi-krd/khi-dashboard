"use client"

import { PlayIcon, XMarkIcon } from "@heroicons/react/24/outline"
import { useFieldArray, useFormContext } from "react-hook-form"

import { ServiceGalleryBulkUploader } from "@/components/services/service-gallery-bulk-uploader"
import { NS } from "@/components/services/services-strings"
import { cn } from "@/lib/utils"
import type { ServiceFormValues } from "@/lib/validations/services"

function previewUrl(
  slot: ServiceFormValues["galleryMedia"][number],
): string | null {
  const url = slot.url?.trim()
  if (!url) return null
  if (slot.type === "VIDEO") return slot.posterUrl?.trim() || url
  return url
}

export function ServiceGalleryEditor() {
  const { control, watch } = useFormContext<ServiceFormValues>()
  const { fields, remove } = useFieldArray({
    control,
    name: "galleryMedia",
  })

  const slots = watch("galleryMedia") ?? []

  return (
    <div className="space-y-3">
      <ServiceGalleryBulkUploader slotCount={slots.length} compact />

      {fields.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {fields.map((field, index) => {
            const slot = slots[index]
            const thumb = previewUrl(slot)
            const isVideo = slot?.type === "VIDEO"

            return (
              <li
                key={field.id}
                className="group border-border relative aspect-square overflow-hidden rounded-md border bg-muted/30"
              >
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumb}
                    alt={slot?.alt ?? ""}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="text-muted-foreground flex size-full items-center justify-center text-xs">
                    …
                  </div>
                )}

                {isVideo ? (
                  <span className="pointer-events-none absolute start-1.5 top-1.5 rounded bg-black/65 p-0.5 text-white">
                    <PlayIcon className="size-3" />
                  </span>
                ) : null}

                <button
                  type="button"
                  aria-label={NS.action.delete}
                  onClick={() => remove(index)}
                  className={cn(
                    "absolute end-1.5 top-1.5 flex size-6 items-center justify-center rounded-full",
                    "bg-black/65 text-white opacity-0 transition-opacity group-hover:opacity-100",
                    "focus-visible:opacity-100 focus-visible:outline-none",
                  )}
                >
                  <XMarkIcon className="size-3.5" />
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
