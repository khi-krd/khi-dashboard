"use client"

import { CameraIcon, MapPinIcon } from "@heroicons/react/24/outline"
import { useFormContext } from "react-hook-form"

import { NS } from "@/components/image-collections/collections-strings"
import type { CollectionFormValues } from "@/lib/validations/image-collections"
import type { Language } from "@/types/image-collections"

const inlineFieldClass =
  "min-w-[8rem] flex-1 border-0 bg-transparent px-0 text-sm shadow-none placeholder:text-muted-foreground/50 focus:ring-0 focus-visible:ring-0"

export function CollectionCreditsInlineRow({ activeLang }: { activeLang: Language }) {
  const { register } = useFormContext<CollectionFormValues>()

  const collectedByField =
    activeLang === "CKB" ? "ckbContent.collectedBy" : "kmrContent.collectedBy"
  const locationField =
    activeLang === "CKB" ? "ckbContent.location" : "kmrContent.location"

  return (
    <div className="mt-3 flex flex-wrap items-center gap-4">
      <label className="text-muted-foreground flex min-w-0 flex-1 items-center gap-2">
        <CameraIcon className="size-4 shrink-0" aria-hidden />
        <input
          type="text"
          className={inlineFieldClass}
          placeholder={NS.credits.collected_by_placeholder}
          maxLength={250}
          {...register(collectedByField)}
        />
      </label>
      <label className="text-muted-foreground flex min-w-0 flex-1 items-center gap-2">
        <MapPinIcon className="size-4 shrink-0" aria-hidden />
        <input
          type="text"
          className={inlineFieldClass}
          placeholder={NS.credits.location_placeholder}
          maxLength={250}
          {...register(locationField)}
        />
      </label>
    </div>
  )
}
