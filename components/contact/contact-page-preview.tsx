"use client"

import { contactDisplayTitle } from "@/lib/contact-normalize"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { NS } from "@/components/contact/contact-strings"
import type { ContactDto } from "@/types/contact"

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

function PageHero({ offices }: { offices: ContactDto[] }) {
  const first = offices[0]
  const title = first ? contactDisplayTitle(first) : NS.page.title
  const subtitle =
    first?.ckbContent?.subtitle?.trim() ||
    first?.kmrContent?.subtitle?.trim() ||
    NS.page.previewHint

  if (offices.length === 0) {
    return (
      <div className="border-border rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground text-sm">{NS.page.previewHeroEmpty}</p>
      </div>
    )
  }

  return (
    <section className="border-border overflow-hidden rounded-lg border">
      <div className="relative min-h-[220px] bg-muted/40">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="relative flex min-h-[220px] flex-col justify-end p-6 text-white">
          <p className="text-xs font-medium uppercase tracking-wide opacity-90">
            {NS.page.title}
          </p>
          <h2 className="mt-2 text-2xl font-bold">{title || NS.page.title}</h2>
          {subtitle ? (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed opacity-90">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function OfficeSectionPreview({
  office,
  index,
}: {
  office: ContactDto
  index: number
}) {
  const title = contactDisplayTitle(office) || NS.section.unnamed
  const address =
    office.ckbContent?.address?.trim() ||
    office.kmrContent?.address?.trim() ||
    ""
  const hours =
    office.ckbContent?.workingHours?.trim() ||
    office.kmrContent?.workingHours?.trim() ||
    ""
  const description =
    stripHtml(office.ckbContent?.description ?? "") ||
    stripHtml(office.kmrContent?.description ?? "")

  const bodyParts = [
    address,
    hours,
    office.phone?.trim(),
    office.email?.trim(),
    description,
  ].filter(Boolean)

  const body = bodyParts.join(" · ")

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
      {office.mapEmbedUrl?.trim() ? (
        <p className="text-muted-foreground mt-3 truncate text-xs">
          {NS.detail.map}: {office.mapEmbedUrl.trim()}
        </p>
      ) : null}
    </article>
  )
}

export function ContactPagePreview({
  offices,
  isLoading,
}: {
  offices: ContactDto[]
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

  const sorted = [...offices].sort((a, b) => {
    const ao =
      typeof a.displayOrder === "number" ? a.displayOrder : Number.POSITIVE_INFINITY
    const bo =
      typeof b.displayOrder === "number" ? b.displayOrder : Number.POSITIVE_INFINITY
    return ao - bo
  })

  return (
    <div className="space-y-8">
      <PageHero offices={sorted} />

      <div className="space-y-4">
        <h2 className="text-base font-semibold">{NS.page.sectionsTitle}</h2>
        {sorted.length === 0 ? (
          <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
            {NS.page.previewEmptyHint}
          </p>
        ) : (
          sorted.map((office, index) => (
            <OfficeSectionPreview
              key={office.id ?? index}
              office={office}
              index={index}
            />
          ))
        )}
      </div>
    </div>
  )
}
