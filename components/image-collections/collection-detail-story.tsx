"use client"

import Image from "next/image"
import { useMemo, useState } from "react"

import { CollectionLightbox } from "@/components/image-collections/collection-lightbox"
import { NS } from "@/components/image-collections/collections-strings"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { albumItemSrc, sortAlbumItems } from "@/lib/image-album-utils"
import { sanitizeNewsBodyHtml } from "@/lib/sanitize-news-html"
import { cn } from "@/lib/utils"
import type { CollectionDto, ImageAlbumItemDto, Language } from "@/types/image-collections"

function isHtmlEmpty(html: string | undefined | null) {
  if (!html?.trim()) return true
  const stripped = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
  return stripped.length === 0
}

export function CollectionDetailStory({
  collection,
  storyLang,
  onStoryLangChange,
  contentLanguages,
}: {
  collection: CollectionDto
  storyLang: Language
  onStoryLangChange: (l: Language) => void
  contentLanguages: Language[]
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const items = sortAlbumItems(collection.imageAlbum ?? [])
  const total = items.length

  const hasCkb = contentLanguages.includes("CKB")
  const hasKmr = contentLanguages.includes("KMR")
  const showTabs = hasCkb && hasKmr

  if (total === 0) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm leading-relaxed">
        {NS.story.empty}
      </p>
    )
  }

  return (
    <>
      {showTabs ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border">
          <div className="flex gap-4">
            {(["CKB", "KMR"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => onStoryLangChange(l)}
                className={cn(
                  "border-b-2 pb-2 text-sm font-medium transition-colors",
                  storyLang === l
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground",
                )}
              >
                {l === "CKB" ? NS.lang.ckb : NS.lang.kmr}
              </button>
            ))}
          </div>
          <p className="text-muted-foreground pb-2 text-xs">{NS.field.story_lang_hint}</p>
        </div>
      ) : null}

      <ol className="relative space-y-10 border-s border-border/60 ps-6">
        {items.map((item, index) => (
          <StoryStep
            key={item.id ?? index}
            item={item}
            index={index}
            total={total}
            storyLang={storyLang}
            onImageClick={() => {
              setLightboxIndex(index)
              setLightboxOpen(true)
            }}
          />
        ))}
      </ol>

      <CollectionLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        items={items}
        initialIndex={lightboxIndex}
      />
    </>
  )
}

function StoryStep({
  item,
  index,
  total,
  storyLang,
  onImageClick,
}: {
  item: ImageAlbumItemDto
  index: number
  total: number
  storyLang: Language
  onImageClick: () => void
}) {
  const src = albumItemSrc(item)
  const caption =
    storyLang === "CKB"
      ? item.captionCkb?.trim() || item.captionKmr?.trim()
      : item.captionKmr?.trim() || item.captionCkb?.trim()
  const description =
    storyLang === "CKB"
      ? item.descriptionCkb?.trim() || item.descriptionKmr?.trim()
      : item.descriptionKmr?.trim() || item.descriptionCkb?.trim()

  const stepLabel = useMemo(
    () => NS.step.label(formatCkbDigits(index + 1), formatCkbDigits(total)),
    [index, total],
  )

  return (
    <li className="relative">
      <span className="bg-primary absolute -start-[1.55rem] top-1 flex size-5 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground">
        {formatCkbDigits(index + 1)}
      </span>
      <p className="text-muted-foreground mb-3 text-xs font-medium">{stepLabel}</p>
      <button
        type="button"
        onClick={onImageClick}
        className="mb-4 block w-full max-w-2xl overflow-hidden rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        {src ? (
          <span className="bg-muted relative block aspect-[4/3] w-full">
            <Image
              src={src}
              alt={caption ?? ""}
              fill
              className="object-cover"
              unoptimized={src.startsWith("http")}
            />
          </span>
        ) : (
          <span className="bg-muted text-muted-foreground flex aspect-[4/3] items-center justify-center text-sm">
            {NS.item.no_source}
          </span>
        )}
      </button>
      {caption ? (
        <p className="text-lg font-medium leading-relaxed">{caption}</p>
      ) : (
        <p className="text-muted-foreground text-sm italic">{NS.item.no_caption}</p>
      )}
      {!isHtmlEmpty(description) ? (
        <div
          className="prose prose-sm mt-3 max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: sanitizeNewsBodyHtml(description!) }}
        />
      ) : null}
    </li>
  )
}
