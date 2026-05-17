"use client"

import { PlayIcon } from "@heroicons/react/24/solid"
import Image from "next/image"

import { AboutLanguageChipRow } from "@/components/about/about-language-chip"
import { BlockTypePill } from "@/components/about/block-type-pill"
import { formatDuration } from "@/lib/sound-format"
import { sanitizeNewsBodyHtml } from "@/lib/sanitize-news-html"
import { watchToEmbedUrl } from "@/lib/video-url-helpers"
import { cn } from "@/lib/utils"
import type { AboutBlockDto, Language } from "@/types/about"

function toProseHtml(raw: string | undefined | null) {
  const t = raw?.trim() ?? ""
  if (!t) return ""
  const looksLikeHtml = /<[a-z][\s\S]*>/i.test(t)
  const html = looksLikeHtml ? t : `<p>${t}</p>`
  return sanitizeNewsBodyHtml(html)
}

function BlockBody({
  block,
  lang,
}: {
  block: AboutBlockDto
  lang: Language
}) {
  switch (block.type) {
    case "TEXT": {
      const heading = lang === "CKB" ? block.headingCkb : block.headingKmr
      const body = lang === "CKB" ? block.bodyCkb : block.bodyKmr
      const html = toProseHtml(body)
      return (
        <>
          {heading?.trim() ? (
            <h4 className="mb-3 text-xl leading-snug font-semibold">{heading}</h4>
          ) : null}
          {html ? (
            <div
              className="prose prose-base dark:prose-invert text-foreground/90 max-w-none leading-relaxed"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : null}
        </>
      )
    }
    case "IMAGE": {
      const url = block.imageUrl?.trim()
      if (!url) return null
      const caption = lang === "CKB" ? block.captionCkb : block.captionKmr
      return (
        <figure
          className={cn(
            "bg-muted overflow-hidden rounded-lg",
            block.alignment === "center" && "mx-auto max-w-md",
            block.alignment === "wide" && "-mx-3",
            block.alignment === "full" && "-mx-5",
          )}
        >
          <Image
            src={url}
            alt={caption ?? ""}
            width={1200}
            height={800}
            className="h-auto w-full"
          />
          {caption?.trim() ? (
            <figcaption className="text-muted-foreground px-4 py-2.5 text-center text-xs italic">
              {caption}
            </figcaption>
          ) : null}
        </figure>
      )
    }
    case "VIDEO": {
      const embed =
        watchToEmbedUrl(block.embedUrl ?? "") ?? block.embedUrl?.trim()
      if (!embed) return null
      const caption = lang === "CKB" ? block.captionCkb : block.captionKmr
      return (
        <>
          <div className="bg-muted aspect-video overflow-hidden rounded-lg">
            <iframe
              src={embed}
              className="h-full w-full"
              allowFullScreen
              title={caption ?? "video"}
            />
          </div>
          {caption?.trim() ? (
            <figcaption className="text-muted-foreground mt-2.5 text-center text-xs italic">
              {caption}
            </figcaption>
          ) : null}
        </>
      )
    }
    case "AUDIO": {
      const title = lang === "CKB" ? block.titleCkb : block.titleKmr
      return (
        <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3">
          <button
            type="button"
            className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-full"
            aria-label="play"
          >
            <PlayIcon className="size-5" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{title || "—"}</div>
            <div className="text-muted-foreground mt-0.5 font-mono text-xs">
              {formatDuration(block.durationSeconds ?? 0)}
            </div>
          </div>
        </div>
      )
    }
    case "GALLERY": {
      const images = block.images?.filter((i) => i.imageUrl?.trim()) ?? []
      if (!images.length) return null
      return (
        <div className="columns-2 gap-2 md:columns-3 [&>*]:mb-2 [&>*]:break-inside-avoid">
          {images.map((img, i) => (
            <Image
              key={img.id ?? i}
              src={img.imageUrl!}
              alt=""
              width={600}
              height={400}
              className="h-auto w-full rounded-md"
              loading="lazy"
            />
          ))}
        </div>
      )
    }
    case "QUOTE": {
      const text = lang === "CKB" ? block.textCkb : block.textKmr
      const attr =
        lang === "CKB" ? block.attributionCkb : block.attributionKmr
      if (!text?.trim()) return null
      return (
        <blockquote className="relative px-4 pt-6">
          <span className="text-muted-foreground/20 absolute start-0 top-0 font-serif text-6xl leading-none">
            «
          </span>
          <p className="text-foreground/90 text-xl leading-snug italic">
            {text}
          </p>
          {attr?.trim() ? (
            <footer className="text-muted-foreground mt-3 text-sm">
              <span className="me-1">—</span>
              {attr}
            </footer>
          ) : null}
        </blockquote>
      )
    }
    case "STAT": {
      const unit = lang === "CKB" ? block.unitCkb : block.unitKmr
      const label = lang === "CKB" ? block.labelCkb : block.labelKmr
      return (
        <div className="py-4 text-center">
          <div className="text-foreground text-5xl font-bold tracking-tight">
            {block.value ?? "—"}
          </div>
          {unit?.trim() ? (
            <div className="text-muted-foreground mt-1 text-sm">{unit}</div>
          ) : null}
          {label?.trim() ? (
            <div className="text-foreground/80 mt-3 text-base font-medium">
              {label}
            </div>
          ) : null}
        </div>
      )
    }
    default:
      return null
  }
}

export function BlockDetailCard({
  block,
  index,
  lang,
}: {
  block: AboutBlockDto
  index: number
  lang: Language
}) {
  const langs = block.contentLanguages?.length
    ? block.contentLanguages
    : [lang]

  return (
    <article className="border-border bg-card group overflow-hidden rounded-xl border">
      <header className="border-border/60 bg-muted/20 flex items-center justify-between border-b px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="text-muted-foreground/70 font-mono text-[10px] tracking-wider">
            {String(index + 1).padStart(2, "0")}
          </span>
          <BlockTypePill type={block.type} />
          <AboutLanguageChipRow langs={langs} />
        </div>
      </header>
      <div className="p-5">
        <BlockBody block={block} lang={lang} />
      </div>
    </article>
  )
}

export function StatBlocksBand({
  blocks,
  indices,
  lang,
}: {
  blocks: AboutBlockDto[]
  indices: number[]
  lang: Language
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {indices.map((i) => (
        <div
          key={String(blocks[i].id ?? i)}
          className="border-border bg-card rounded-xl border p-4"
        >
          <BlockBody block={blocks[i]} lang={lang} />
        </div>
      ))}
    </div>
  )
}

export type BlockRenderGroup =
  | { kind: "single"; index: number }
  | { kind: "stats"; indices: number[] }

export function groupBlocksForDetail(blocks: AboutBlockDto[]): BlockRenderGroup[] {
  const groups: BlockRenderGroup[] = []
  let i = 0
  while (i < blocks.length) {
    if (blocks[i].type === "STAT") {
      const indices = [i]
      let j = i + 1
      while (j < blocks.length && blocks[j].type === "STAT") {
        indices.push(j)
        j++
      }
      groups.push(
        indices.length >= 2
          ? { kind: "stats", indices }
          : { kind: "single", index: i },
      )
      i = j
    } else {
      groups.push({ kind: "single", index: i })
      i++
    }
  }
  return groups
}
