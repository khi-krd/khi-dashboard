"use client"

import { PlayIcon } from "@heroicons/react/24/outline"

import { NS } from "@/components/services/services-strings"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { serviceDtoToHeroFormValues } from "@/lib/services-form-data"
import { cn } from "@/lib/utils"
import type { ServiceDto } from "@/types/services"

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

function galleryThumb(
  slot: NonNullable<ServiceDto["galleryMedia"]>[number],
): string | null {
  const url = slot.url?.trim()
  if (!url) return null
  if (slot.type === "VIDEO") return slot.posterUrl?.trim() || url
  return url
}

function SectionPreview({
  section,
  index,
}: {
  section: ServiceDto
  index: number
}) {
  const ckb = section.contents.find((c) => c.languageCode === "CKB")
  const kmr = section.contents.find((c) => c.languageCode === "KMR")
  const title = ckb?.title?.trim() || kmr?.title?.trim() || NS.section.unnamed
  const body = stripHtml(ckb?.description?.trim() || kmr?.description?.trim() || "")
  const gallery = (section.galleryMedia ?? []).filter((g) => g.url?.trim())

  return (
    <article className="border-border rounded-lg border bg-card p-4">
      <p className="text-muted-foreground mb-1 text-xs">
        {NS.page.sectionLabel(formatCkbDigits(index + 1))}
      </p>
      <h3 className="text-lg font-semibold">{title}</h3>

      {body ? (
        <p className="text-muted-foreground mt-2 line-clamp-4 text-sm leading-relaxed">
          {body}
        </p>
      ) : (
        <p className="text-muted-foreground mt-2 text-sm italic">
          {NS.empty.no_body}
        </p>
      )}

      {gallery.length > 0 ? (
        <ul className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {gallery.slice(0, 6).map((slot, i) => {
            const thumb = galleryThumb(slot)
            if (!thumb) return null
            return (
              <li
                key={`${slot.url}-${i}`}
                className="relative aspect-square overflow-hidden rounded-md bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumb} alt="" className="size-full object-cover" />
                {slot.type === "VIDEO" ? (
                  <span className="absolute start-1 top-1 rounded bg-black/60 p-0.5 text-white">
                    <PlayIcon className="size-3" />
                  </span>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-muted-foreground mt-3 text-xs">{NS.gallery.empty}</p>
      )}
    </article>
  )
}

function HeroPreview({ hero }: { hero?: ServiceDto }) {
  const data = hero ? serviceDtoToHeroFormValues(hero) : null
  const image = data?.heroImageUrl?.trim()
  const title = data?.titleCkb?.trim() || data?.titleKmr?.trim()
  const subtitle = data?.subtitleCkb?.trim() || data?.subtitleKmr?.trim()
  const overtitle = data?.eyebrowCkb?.trim() || data?.eyebrowKmr?.trim()

  if (!hero && !title) {
    return (
      <div className="border-border rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground text-sm">{NS.page.previewHeroEmpty}</p>
      </div>
    )
  }

  return (
    <section className="border-border overflow-hidden rounded-lg border">
      <div
        className={cn(
          "relative min-h-[220px] bg-muted/40",
          image && "min-h-[280px]",
        )}
      >
        {image ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image}
              alt=""
              className="absolute inset-0 size-full object-cover brightness-[0.72]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          </>
        ) : null}
        <div
          className={cn(
            "relative flex min-h-[220px] flex-col justify-end p-6",
            image && "min-h-[280px] text-white",
          )}
        >
          {overtitle ? (
            <p className="text-xs font-medium uppercase tracking-wide opacity-90">
              {overtitle}
            </p>
          ) : null}
          {title ? <h2 className="mt-2 text-2xl font-bold">{title}</h2> : null}
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed opacity-90">
              {subtitle}
            </p>
          ) : null}
          {!title && !subtitle && !overtitle ? (
            <p className="text-muted-foreground text-sm">
              {NS.page.previewHeroEmpty}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export function ServicesPagePreview({
  hero,
  sections,
  isLoading,
}: {
  hero?: ServiceDto
  sections: ServiceDto[]
  isLoading?: boolean
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="bg-muted h-64 animate-pulse rounded-lg" />
        <div className="bg-muted h-32 animate-pulse rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <HeroPreview hero={hero} />

      <div className="space-y-4">
        <h2 className="text-base font-semibold">{NS.page.sectionsTitle}</h2>
        {sections.length === 0 ? (
          <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
            {NS.empty.no_services.subtitle}
          </p>
        ) : (
          sections.map((section, index) => (
            <SectionPreview
              key={section.id ?? index}
              section={section}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  )
}
