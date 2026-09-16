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
        {/*
          `key` is load-bearing: the registered name changes with the language
          tab, and react-hook-form only pushes a value into an input when it
          attaches to a new element. Without the remount the field keeps the
          previous language's text and overwrites the other language with it.
        */}
        <input
          key={collectedByField}
          type="text"
          className={inlineFieldClass}
          placeholder={NS.credits.collected_by_placeholder}
          {...register(collectedByField)}
        />
      </label>
      <label className="text-muted-foreground flex min-w-0 flex-1 items-center gap-2">
        <MapPinIcon className="size-4 shrink-0" aria-hidden />
        <input
          key={locationField}
          type="text"
          className={inlineFieldClass}
          placeholder={NS.credits.location_placeholder}
          {...register(locationField)}
        />
      </label>
    </div>
  )
}
