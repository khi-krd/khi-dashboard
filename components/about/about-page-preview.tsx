"use client"

import {
  useAboutPartnersQuery,
  useAboutTeamMembersQuery,
} from "@/hooks/useAbout"
import Image from "next/image"
import { isOptimizableImageSrc } from "@/lib/image-src"
import { aboutDisplayTitle } from "@/lib/about-normalize"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import { NS } from "@/components/about/about-strings"
import type { AboutDto } from "@/types/about"

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

function ThumbnailGrid({ urls }: { urls: string[] }) {
  const thumbs = urls.filter((u) => u.trim()).slice(0, 6)
  if (thumbs.length === 0) return null

  return (
    <ul className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-6">
      {thumbs.map((url, i) => (
        <li
          key={`${url}-${i}`}
          className="relative aspect-square overflow-hidden rounded-md bg-muted"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="size-full object-cover" />
        </li>
      ))}
    </ul>
  )
}

function SectionPreview({
  index,
  title,
  body,
  thumbnails = [],
}: {
  index: number
  title: string
  body: string
  thumbnails?: string[]
}) {
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
      <ThumbnailGrid urls={thumbnails} />
    </article>
  )
}

function HeroPreview({ about }: { about: AboutDto }) {
  const image = about.heroPosterUrl?.trim()
  const title = aboutDisplayTitle(about)
  const subtitle =
    about.ckbContent?.subtitle?.trim() || about.kmrContent?.subtitle?.trim()

  if (!image && !title) {
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
            <Image
              src={image}
              alt=""
              fill
              sizes="100vw"
              className="object-cover brightness-[0.72]"
              unoptimized={!isOptimizableImageSrc(image)}
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
          {title ? <h2 className="text-2xl font-bold">{title}</h2> : null}
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed opacity-90">
              {subtitle}
            </p>
          ) : null}
          {!title && !subtitle ? (
            <p className="text-muted-foreground text-sm">
              {NS.page.previewHeroEmpty}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function AboutSections({ about }: { about: AboutDto }) {
  const teamQ = useAboutTeamMembersQuery()
  const partnersQ = useAboutPartnersQuery()

  const body =
    stripHtml(about.ckbContent?.body ?? "") ||
    stripHtml(about.kmrContent?.body ?? "")

  const stats = (about.stats ?? []).filter(
    (s) => s.labelCkb?.trim() || s.labelKmr?.trim() || s.value?.trim(),
  )
  const statsBody = stats
    .map(
      (s) =>
        `${s.labelCkb?.trim() || s.labelKmr?.trim() || "—"}: ${s.value?.trim() || "—"}`,
    )
    .join(" · ")

  const founderName =
    about.founderNameCkb?.trim() || about.founderNameKmr?.trim() || ""
  const founderBio =
    stripHtml(about.founderBioCkb ?? "") ||
    stripHtml(about.founderBioKmr ?? "")

  const teamItems = teamQ.data ?? []
  const partnerItems = partnersQ.data ?? []

  const sections: {
    title: string
    body: string
    thumbnails: string[]
  }[] = []

  if (body) {
    sections.push({
      title: NS.section.content,
      body,
      thumbnails: [],
    })
  }

  if (statsBody) {
    sections.push({
      title: NS.section.stats,
      body: statsBody,
      thumbnails: [],
    })
  }

  if (founderName || founderBio || about.founderImageUrl?.trim()) {
    sections.push({
      title: founderName || NS.section.founder,
      body: founderBio,
      thumbnails: about.founderImageUrl?.trim()
        ? [about.founderImageUrl.trim()]
        : [],
    })
  }

  if (teamItems.length > 0) {
    sections.push({
      title: NS.section.team,
      body: teamItems
        .map((m) => m.nameCkb || m.nameKmr || "")
        .filter(Boolean)
        .join("، "),
      thumbnails: teamItems
        .map((m) => m.imageUrl?.trim() ?? "")
        .filter(Boolean),
    })
  }

  if (partnerItems.length > 0) {
    sections.push({
      title: NS.section.partners,
      body: partnerItems
        .map((p) => p.nameCkb || p.nameKmr || "")
        .filter(Boolean)
        .join("، "),
      thumbnails: partnerItems
        .map((p) => p.logoUrl?.trim() ?? "")
        .filter(Boolean),
    })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">{NS.page.sectionsTitle}</h2>
      {sections.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
          {NS.empty.no_sections}
        </p>
      ) : (
        sections.map((section, index) => (
          <SectionPreview
            key={`${section.title}-${index}`}
            index={index}
            title={section.title}
            body={section.body}
            thumbnails={section.thumbnails}
          />
        ))
      )}
    </div>
  )
}

export function AboutPagePreview({
  about,
  isLoading,
}: {
  about?: AboutDto
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

  if (!about?.id) {
    return (
      <div className="border-border rounded-lg border border-dashed p-10 text-center">
        <p className="font-medium">{NS.page.previewEmpty}</p>
        <p className="text-muted-foreground mt-2 text-sm">
          {NS.page.previewEmptyHint}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <HeroPreview about={about} />
      <AboutSections about={about} />
    </div>
  )
}
