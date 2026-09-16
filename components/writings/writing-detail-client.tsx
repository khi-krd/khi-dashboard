"use client"

import {
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  BookOpenIcon,
  BuildingOffice2Icon,
  HashtagIcon,
  LinkIcon,
  PencilSquareIcon,
  ShareIcon,
  TagIcon,
  TrashIcon,
  UserIcon,
} from "@heroicons/react/24/outline"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import {
  WritingBreadcrumbBar,
  dashboardWritingsCrumbHref,
} from "@/components/writings/writing-breadcrumb"
import { isOptimizableImageSrc } from "@/lib/image-src"
import {
  MediaLightbox,
  useLightbox,
} from "@/components/shared/media-lightbox"
import { WritingDeleteDialog } from "@/components/writings/writing-delete-dialog"
import { WritingDetailSkeleton } from "@/components/writings/writing-detail-skeleton"
import { WritingGenrePill } from "@/components/writings/writing-genre-pill"
import { WritingFormatPill } from "@/components/writings/writing-format-pill"
import { WritingLanguageChipRow } from "@/components/writings/writing-language-chip"
import { WritingErrorState } from "@/components/writings/writing-error-state"
import { WritingReaderCard } from "@/components/writings/writing-reader-card"
import {
  WritingSeriesLinkDialog,
  type SeriesLinkMode,
} from "@/components/writings/writing-series-link-dialog"
import { NS, truncateTitle } from "@/components/writings/writings-strings"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import {
  useDeleteWritingMutation,
  useWritingDetailQuery,
} from "@/hooks/useWritings"
import {
  formatFullTimestampKu,
  formatRelativeTimeKu,
} from "@/lib/news-relative-time"
import {
  isRichTextEmpty,
  sanitizeNewsBodyHtml,
} from "@/lib/sanitize-news-html"
import { humanReadableSize, writingUrlPublic } from "@/lib/writing-format"
import { formatCkbDigits, formatEnDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import { isPartOfMultiBookSeries } from "@/types/writings-ui"
import type { Language, WritingDto } from "@/types/writings"

const sectionDivider = "border-t border-border/60 pt-6"
const sideHeading =
  "text-muted-foreground text-xs font-medium uppercase tracking-wide"

function MetaDot() {
  return <span className="mx-2 text-muted-foreground/60">·</span>
}

function TaxonomyChip({
  label,
  lang,
  variant,
}: {
  label: string
  lang: "ckb" | "kmr"
  variant: "tags" | "keywords"
}) {
  const styles = {
    tags: "bg-muted text-foreground border border-border",
    keywords:
      "bg-transparent text-muted-foreground border border-dashed border-border",
  }
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-md px-2 py-0.5 text-xs leading-tight",
        styles[variant],
      )}
    >
      <span className="min-w-0 truncate">{label}</span>
      <span className="text-muted-foreground/70 shrink-0 font-mono text-[10px]">
        {lang}
      </span>
    </span>
  )
}

function toProseHtml(raw: string) {
  const t = raw.trim()
  if (!t) return ""
  const looksLikeHtml = /<[a-z][\s\S]*>/i.test(t)
  const html = looksLikeHtml ? t : `<p>${t}</p>`
  return sanitizeNewsBodyHtml(html)
}

export function WritingDetailClient({ writingId }: { writingId: number }) {
  const router = useRouter()
  const { data: writing, isLoading, isError, refetch } =
    useWritingDetailQuery(writingId)
  const deleteMut = useDeleteWritingMutation()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [tab, setTab] = useState<Language>("CKB")
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkMode, setLinkMode] = useState<SeriesLinkMode>("fromBook")
  const { copyToClipboard } = useCopyToClipboard()

  if (isLoading) return <WritingDetailSkeleton />
  if (isError) return <WritingErrorState onRetry={() => void refetch()} />
  if (!writing?.id) {
    return (
      <div dir="rtl" className="flex flex-col items-center py-20">
        <h1 className="text-lg font-medium">{NS.not_found.title}</h1>
        <Link
          href="/dashboard/writings"
          className={buttonVariants({ variant: "outline" })}
        >
          {NS.not_found.cta}
        </Link>
      </div>
    )
  }

  return (
    <WritingDetailLoaded
      writing={writing}
      tab={tab}
      onTabChange={setTab}
      deleteOpen={deleteOpen}
      onDeleteOpenChange={setDeleteOpen}
      deleteMut={deleteMut}
      linkOpen={linkOpen}
      onLinkOpenChange={setLinkOpen}
      linkMode={linkMode}
      onOpenLink={(mode) => {
        setLinkMode(mode)
        setLinkOpen(true)
      }}
      onBack={() => router.push("/dashboard/writings")}
      onEdit={() => router.push(`/dashboard/writings/${writing.id}/edit`)}
      onCopy={() => {
        const url =
          (writing.id != null ? writingUrlPublic(writing.id) : "") ||
          (typeof window !== "undefined" ? window.location.href : "")
        copyToClipboard(url)
        toast(NS.toast.copied)
      }}
      onLinked={() => void refetch()}
    />
  )
}

function WritingDetailLoaded({
  writing,
  tab,
  onTabChange,
  deleteOpen,
  onDeleteOpenChange,
  deleteMut,
  linkOpen,
  onLinkOpenChange,
  linkMode,
  onOpenLink,
  onBack,
  onEdit,
  onCopy,
  onLinked,
}: {
  writing: WritingDto
  tab: Language
  onTabChange: (l: Language) => void
  deleteOpen: boolean
  onDeleteOpenChange: (v: boolean) => void
  deleteMut: ReturnType<typeof useDeleteWritingMutation>
  linkOpen: boolean
  onLinkOpenChange: (v: boolean) => void
  linkMode: SeriesLinkMode
  onOpenLink: (mode: SeriesLinkMode) => void
  onBack: () => void
  onEdit: () => void
  onCopy: () => void
  onLinked: () => void
}) {
  const langs = writing.contentLanguages ?? []
  const hasCkb = langs.includes("CKB")
  const hasKmr = langs.includes("KMR")
  const inSeries = isPartOfMultiBookSeries(writing)

  const cover =
    writing.ckbCoverUrl?.trim() ||
    writing.kmrCoverUrl?.trim() ||
    writing.hoverCoverUrl?.trim() ||
    null
  const lightbox = useLightbox()

  const activeContent = tab === "CKB" ? writing.ckbContent : writing.kmrContent
  const activeDesc = activeContent?.description ?? ""
  const activeWriter = activeContent?.writer?.trim() ?? ""

  const seriesOrder = writing.seriesOrder ?? writing.seriesInfo?.seriesOrder
  const seriesTotal =
    writing.seriesTotalBooks ?? writing.seriesInfo?.seriesTotalBooks
  const publicUrl = writing.id != null ? writingUrlPublic(writing.id) : ""

  return (
    <TooltipProvider delay={250}>
    <div className="flex flex-col" dir="ltr">
      <div className="border-border/60 bg-background/95 sticky top-0 z-30 border-b backdrop-blur">
        <div
          dir="rtl"
          className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={onBack}>
              <ArrowRightIcon className="size-4 rtl:rotate-180" />
              {NS.action.back}
            </Button>
            <WritingBreadcrumbBar
              className="hidden sm:flex"
              segments={[
                {
                  label: NS.breadcrumb.dashboard,
                  href: dashboardWritingsCrumbHref(),
                },
                { label: NS.breadcrumb.writings, href: "/dashboard/writings" },
                {
                  label: truncateTitle(writing.ckbContent?.title ?? "", 48),
                },
              ]}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {publicUrl ? (
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "gap-1.5",
                )}
              >
                <ArrowTopRightOnSquareIcon className="size-4 rtl:rotate-180" />
                {NS.action.view_on_site}
              </a>
            ) : null}
            <Button type="button" size="sm" onClick={onEdit}>
              <PencilSquareIcon className="size-4" />
              {NS.action.edit}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDeleteOpenChange(true)}
            >
              <TrashIcon className="size-4" />
              {NS.action.delete}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-10">
        <aside
          dir="rtl"
          className="px-4 pt-4 lg:sticky lg:top-20 lg:self-start lg:px-0 lg:pt-0"
        >
          <div className="border-border bg-card space-y-6 rounded-xl border p-6 text-sm">
          {writing.publishedByInstitute ? (
            <section className="space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <BuildingOffice2Icon className="size-4" />
                <span className="font-medium">{NS.institute.badge}</span>
              </div>
              <p className="text-muted-foreground text-xs">
                {NS.institute.detail_helper}
              </p>
            </section>
          ) : null}

          <section
            className={cn(
              "space-y-2",
              writing.publishedByInstitute && sectionDivider,
            )}
          >
            <h4 className={sideHeading}>{NS.section.topic}</h4>
            {writing.topicId ? (
              <Link
                href={`/dashboard/writings?topic=${writing.topicId}`}
                className="text-primary block hover:underline"
              >
                <span>{writing.topicNameCkb ?? NS.dash}</span>
                {writing.topicNameKmr ? (
                  <span className="text-muted-foreground mt-0.5 block text-xs">
                    {writing.topicNameKmr}
                  </span>
                ) : null}
              </Link>
            ) : (
              <p className="text-muted-foreground">{NS.topic.empty}</p>
            )}
          </section>

          <section className={cn(sectionDivider, "space-y-2")}>
            <h4 className={sideHeading}>{NS.section.genres}</h4>
            <div className="flex flex-wrap gap-1.5">
              {(writing.bookGenres ?? []).length === 0 ? (
                <span className="text-muted-foreground">{NS.dash}</span>
              ) : (
                writing.bookGenres!.map((g) => (
                  <WritingGenrePill key={g} genre={g} compact />
                ))
              )}
            </div>
          </section>

          {writing.featured ? (
            <section className={cn(sectionDivider, "space-y-2")}>
              <h4 className={sideHeading}>{NS.col.featured}</h4>
              <div className="flex justify-between gap-2 text-xs">
                <span className="text-muted-foreground">
                  {NS.col.featured_order}
                </span>
                <span className="font-mono">
                  {writing.featuredOrder != null
                    ? formatCkbDigits(writing.featuredOrder)
                    : NS.dash}
                </span>
              </div>
            </section>
          ) : null}

          {inSeries ? (
            <section className={cn(sectionDivider, "space-y-2")}>
              <h4 className={sideHeading}>{NS.section.series}</h4>
              <p className="font-medium">{writing.seriesName ?? NS.dash}</p>
              {seriesOrder != null && seriesTotal != null ? (
                <p className="text-muted-foreground text-xs">
                  {NS.series.book_in(
                    formatCkbDigits(seriesOrder),
                    formatCkbDigits(seriesTotal),
                  )}
                </p>
              ) : null}
              {writing.seriesId ? (
                <Link
                  href={`/dashboard/writings/series/${writing.seriesId}`}
                  className="text-primary inline-block text-xs hover:underline"
                >
                  {NS.action.view_series_short}
                </Link>
              ) : null}
            </section>
          ) : (
            <section className={cn(sectionDivider, "space-y-2")}>
              <h4 className={sideHeading}>{NS.section.series}</h4>
              <p className="text-muted-foreground text-xs">
                {NS.field.standalone_helper}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenLink("fromBook")}
              >
                {NS.action.link_existing}
              </Button>
            </section>
          )}

          <section className={cn(sectionDivider, "space-y-2")}>
            <h4 className={sideHeading}>{NS.section.files_format}</h4>
            <dl className="space-y-2 text-xs">
              {hasCkb ? (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted-foreground">
                      {NS.files_meta.format_ckb}
                    </dt>
                    <dd>
                      <WritingFormatPill format={writing.ckbContent?.fileFormat} />
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted-foreground">
                      {NS.files_meta.pages_ckb}
                    </dt>
                    <dd className="font-mono">
                      {writing.ckbContent?.pageCount
                        ? `${formatEnDigits(writing.ckbContent.pageCount)} ${NS.pages.suffix}`
                        : NS.dash}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted-foreground">
                      {NS.files_meta.size_ckb}
                    </dt>
                    <dd className="font-mono">
                      {humanReadableSize(writing.ckbContent?.fileSizeBytes)}
                    </dd>
                  </div>
                </>
              ) : null}
              {hasKmr ? (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted-foreground">
                      {NS.files_meta.format_kmr}
                    </dt>
                    <dd>
                      <WritingFormatPill format={writing.kmrContent?.fileFormat} />
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted-foreground">
                      {NS.files_meta.pages_kmr}
                    </dt>
                    <dd className="font-mono">
                      {writing.kmrContent?.pageCount
                        ? `${formatEnDigits(writing.kmrContent.pageCount)} ${NS.pages.suffix}`
                        : NS.dash}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-muted-foreground">
                      {NS.files_meta.size_kmr}
                    </dt>
                    <dd className="font-mono">
                      {humanReadableSize(writing.kmrContent?.fileSizeBytes)}
                    </dd>
                  </div>
                </>
              ) : null}
            </dl>
          </section>

          <section className={cn(sectionDivider, "space-y-2")}>
            <h4 className={sideHeading}>{NS.section.languages}</h4>
            <WritingLanguageChipRow langs={langs} />
          </section>

          <section className={cn(sectionDivider, "space-y-2")}>
            <h4 className={sideHeading}>{NS.section.dates}</h4>
            <dl className="space-y-2 text-xs">
              {writing.createdAt ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">{NS.system.created_at}</dt>
                  <dd>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <button
                            type="button"
                            className="underline decoration-dashed"
                          >
                            {formatRelativeTimeKu(writing.createdAt)}
                          </button>
                        }
                      />
                      <TooltipContent>
                        {formatFullTimestampKu(writing.createdAt)}
                      </TooltipContent>
                    </Tooltip>
                  </dd>
                </div>
              ) : null}
              {writing.updatedAt ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">{NS.system.updated_at}</dt>
                  <dd>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <button
                            type="button"
                            className="underline decoration-dashed"
                          >
                            {formatRelativeTimeKu(writing.updatedAt)}
                          </button>
                        }
                      />
                      <TooltipContent>
                        {formatFullTimestampKu(writing.updatedAt)}
                      </TooltipContent>
                    </Tooltip>
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className={cn(sectionDivider, "space-y-2 text-xs")}>
            <h4 className={cn(sideHeading, "text-[11px]")}>
              {NS.section.system}
            </h4>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">{NS.system.id}</span>
              <span className="font-mono">#{writing.id}</span>
            </div>
            {writing.createdBy ? (
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground inline-flex items-center gap-1">
                  <UserIcon className="size-3.5" />
                  دروستکار
                </span>
                <span>{writing.createdBy}</span>
              </div>
            ) : null}
            {writing.updatedBy ? (
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground inline-flex items-center gap-1">
                  <UserIcon className="size-3.5" />
                  نوێکەر
                </span>
                <span>{writing.updatedBy}</span>
              </div>
            ) : null}
          </section>

          <section className={cn(sectionDivider, "space-y-1")}>
            <h4 className={sideHeading}>{NS.section.actions}</h4>
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={onCopy}
            >
              <LinkIcon className="size-4 shrink-0" />
              {NS.action.copy_url}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => {
                const shareUrl =
                  publicUrl ||
                  (typeof window !== "undefined" ? window.location.href : "")
                const shareTitle =
                  writing.ckbContent?.title?.trim() ||
                  writing.kmrContent?.title?.trim() ||
                  ""
                if (typeof navigator !== "undefined" && navigator.share) {
                  void navigator
                    .share({ title: shareTitle, url: shareUrl || undefined })
                    .catch(() => {
                      onCopy()
                    })
                } else {
                  onCopy()
                }
              }}
            >
              <ShareIcon className="size-4 shrink-0" />
              {NS.action.share}
            </Button>
            {inSeries ? (
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => onOpenLink("fromSeries")}
              >
                <LinkIcon className="size-4 shrink-0" />
                {NS.action.add_to_series}
              </Button>
            ) : null}
          </section>
          </div>
        </aside>

        <article
          dir="rtl"
          className="mx-auto w-full max-w-[860px] px-6 pb-12 pt-8"
        >
          <div className="text-muted-foreground flex flex-wrap items-center text-xs">
            {writing.publishedByInstitute ? (
              <>
                <span className="inline-flex rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-emerald-700 dark:text-emerald-400">
                  {NS.institute.badge}
                </span>
              </>
            ) : null}
            {inSeries && writing.seriesName ? (
              <>
                {writing.publishedByInstitute ? <MetaDot /> : null}
                <span className="border-border bg-muted inline-flex rounded-md border px-2 py-0.5">
                  {NS.series.banner_label}: {writing.seriesName}
                </span>
              </>
            ) : null}
            {writing.topicId && writing.topicNameCkb ? (
              <>
                {writing.publishedByInstitute ||
                (inSeries && writing.seriesName) ? (
                  <MetaDot />
                ) : null}
                <Link
                  href={`/dashboard/writings?topic=${writing.topicId}`}
                  className="hover:text-foreground"
                >
                  {writing.topicNameCkb}
                </Link>
              </>
            ) : null}
          </div>

          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-start">
            <div className="bg-muted ring-border/60 relative mx-auto aspect-[2/3] w-[240px] shrink-0 overflow-hidden rounded-xl shadow-md ring-1 md:mx-0">
              {cover ? (
                <button
                  type="button"
                  aria-label={writing.ckbContent?.title ?? undefined}
                  onClick={() => lightbox.openAt(0)}
                  className="absolute inset-0 cursor-zoom-in focus-visible:ring-2"
                >
                  <Image
                    src={cover}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized={!isOptimizableImageSrc(cover)}
                  />
                </button>
              ) : (
                <div className="text-muted-foreground flex size-full flex-col items-center justify-center gap-2 text-sm">
                  <BookOpenIcon className="size-8 opacity-40" />
                  {NS.empty.no_cover}
                </div>
              )}
              <MediaLightbox
                open={lightbox.open}
                onOpenChange={lightbox.onOpenChange}
                items={cover ? [{ src: cover }] : []}
                initialIndex={lightbox.index}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-4xl font-bold leading-tight">
                {writing.ckbContent?.title?.trim() || NS.dash}
              </h1>
              {writing.kmrContent?.title?.trim() ? (
                <p className="text-muted-foreground mt-2 text-xl font-medium leading-snug">
                  {writing.kmrContent.title}
                </p>
              ) : null}

              {hasCkb && hasKmr ? (
                <div className="mt-6 flex gap-8 border-b border-border/80">
                  {(["CKB", "KMR"] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => onTabChange(l)}
                      className={cn(
                        "-mb-px border-b-2 pb-3 text-sm font-medium transition-colors",
                        tab === l
                          ? "border-primary text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {l === "CKB" ? NS.lang.ckb : NS.lang.kmr}
                    </button>
                  ))}
                </div>
              ) : null}

              <dl className="text-muted-foreground mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <div className="min-w-0">
                  <dt className="text-muted-foreground/80 text-xs">
                    {NS.section.writer}
                  </dt>
                  <dd className="text-foreground font-medium">
                    {activeWriter || NS.dash}
                  </dd>
                </div>
                {activeContent?.genre?.trim() ? (
                  <div className="min-w-0">
                    <dt className="text-muted-foreground/80 text-xs">
                      {NS.section.editorial_genre}
                    </dt>
                    <dd className="text-foreground font-medium">
                      {activeContent.genre}
                    </dd>
                  </div>
                ) : null}
              </dl>

              {(writing.bookGenres ?? []).length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {writing.bookGenres!.map((g) => (
                    <WritingGenrePill key={g} genre={g} />
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <section className={cn(sectionDivider, "mt-12")}>
            <h3 className="mb-4 text-sm font-semibold">{NS.section.reader}</h3>
            <div className="space-y-3">
              {hasCkb ? (
                <WritingReaderCard lang="CKB" content={writing.ckbContent} />
              ) : null}
              {hasKmr ? (
                <WritingReaderCard lang="KMR" content={writing.kmrContent} />
              ) : null}
            </div>
          </section>

          <section className={cn(sectionDivider, "mt-12")}>
            <h3 className="mb-3 text-sm font-semibold">
              {NS.section.description}
            </h3>
            {isRichTextEmpty(activeDesc) ? (
              <p className="text-muted-foreground text-sm italic">
                {NS.empty.no_body}
              </p>
            ) : (
              <div
                dir={tab === "KMR" ? "ltr" : "rtl"}
                className="prose prose-base max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: toProseHtml(activeDesc) }}
              />
            )}
          </section>

          {[...(writing.tagsCkb ?? []), ...(writing.tagsKmr ?? [])].length >
          0 ? (
            <section className={cn(sectionDivider, "mt-12")}>
              <h3 className="text-muted-foreground mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
                <TagIcon className="size-4" />
                {NS.section.tags}
              </h3>
              <div className="flex flex-wrap gap-2">
                {writing.tagsCkb?.map((t) => (
                  <TaxonomyChip
                    key={`ckb-${t}`}
                    label={t}
                    lang="ckb"
                    variant="tags"
                  />
                ))}
                {writing.tagsKmr?.map((t) => (
                  <TaxonomyChip
                    key={`kmr-${t}`}
                    label={t}
                    lang="kmr"
                    variant="tags"
                  />
                ))}
              </div>
            </section>
          ) : null}

          {[...(writing.keywordsCkb ?? []), ...(writing.keywordsKmr ?? [])]
            .length > 0 ? (
            <section
              className={cn(
                [...(writing.tagsCkb ?? []), ...(writing.tagsKmr ?? [])]
                  .length > 0
                  ? "mt-6"
                  : cn(sectionDivider, "mt-12"),
              )}
            >
              <h3 className="text-muted-foreground mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
                <HashtagIcon className="size-4" />
                {NS.section.keywords}
              </h3>
              <div className="flex flex-wrap gap-2">
                {writing.keywordsCkb?.map((t) => (
                  <TaxonomyChip
                    key={`kckb-${t}`}
                    label={t}
                    lang="ckb"
                    variant="keywords"
                  />
                ))}
                {writing.keywordsKmr?.map((t) => (
                  <TaxonomyChip
                    key={`kkmr-${t}`}
                    label={t}
                    lang="kmr"
                    variant="keywords"
                  />
                ))}
              </div>
            </section>
          ) : null}
        </article>
      </div>

      <WritingDeleteDialog
        open={deleteOpen}
        onOpenChange={onDeleteOpenChange}
        target={{
          ...writing,
          titleCkb: writing.ckbContent?.title,
        }}
        isPending={deleteMut.isPending}
        onConfirm={() => {
          if (writing.id == null) return
          deleteMut.mutate(writing.id, {
            onSuccess: () => {
              toast(NS.toast.deleted)
              onBack()
            },
          })
        }}
      />

      <WritingSeriesLinkDialog
        open={linkOpen}
        onOpenChange={onLinkOpenChange}
        mode={linkMode}
        writing={writing}
        onSuccess={onLinked}
      />
    </div>
    </TooltipProvider>
  )
}
