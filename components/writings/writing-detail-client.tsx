"use client"

import {
  ArrowRightIcon,
  BuildingOffice2Icon,
  LinkIcon,
  PencilSquareIcon,
  ShareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import {
  WritingBreadcrumbBar,
  dashboardWritingsCrumbHref,
} from "@/components/writings/writing-breadcrumb"
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
import { humanReadableSize } from "@/lib/writing-format"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import { isPartOfMultiBookSeries } from "@/types/writings-ui"
import type { Language, WritingDto } from "@/types/writings"

const sectionDivider = "border-t border-border/60 pt-6"

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
        const url = typeof window !== "undefined" ? window.location.href : ""
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

  const activeContent = tab === "CKB" ? writing.ckbContent : writing.kmrContent
  const activeDesc = activeContent?.description ?? ""
  const activeWriter = activeContent?.writer?.trim() ?? ""
  const sanitizedDesc = useMemo(
    () => sanitizeNewsBodyHtml(activeDesc.trim() ? activeDesc : ""),
    [activeDesc],
  )

  const seriesOrder = writing.seriesOrder ?? writing.seriesInfo?.seriesOrder
  const seriesTotal =
    writing.seriesTotalBooks ?? writing.seriesInfo?.seriesTotalBooks

  return (
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
            <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
              <PencilSquareIcon className="size-4" />
              {NS.action.edit}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
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
          className="border-border bg-card space-y-6 self-start rounded-xl border p-6 text-sm lg:sticky lg:top-20"
        >
          {writing.publishedByInstitute ? (
            <div>
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <BuildingOffice2Icon className="size-4" />
                <span className="font-medium">{NS.institute.badge}</span>
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                {NS.institute.detail_helper}
              </p>
            </div>
          ) : null}

          <div className={sectionDivider}>
            <h3 className="mb-2 font-medium">{NS.section.topic}</h3>
            {writing.topicId ? (
              <Link
                href={`/dashboard/writings?topic=${writing.topicId}`}
                className="hover:text-primary block"
              >
                <span>{writing.topicNameCkb ?? NS.dash}</span>
                {writing.topicNameKmr ? (
                  <span className="text-muted-foreground mt-0.5 block text-xs">
                    {writing.topicNameKmr}
                  </span>
                ) : null}
              </Link>
            ) : (
              <span className="text-muted-foreground">{NS.topic.empty}</span>
            )}
          </div>

          <div className={sectionDivider}>
            <h3 className="mb-2 font-medium">{NS.section.genres}</h3>
            <div className="flex flex-wrap gap-1.5">
              {(writing.bookGenres ?? []).length === 0 ? (
                <span className="text-muted-foreground">{NS.dash}</span>
              ) : (
                writing.bookGenres!.map((g) => (
                  <WritingGenrePill key={g} genre={g} compact />
                ))
              )}
            </div>
          </div>

          {inSeries ? (
            <div className={sectionDivider}>
              <h3 className="mb-2 font-medium">{NS.section.series}</h3>
              <p className="font-medium">{writing.seriesName ?? NS.dash}</p>
              {seriesOrder != null && seriesTotal != null ? (
                <p className="text-muted-foreground mt-1 text-xs">
                  {NS.series.book_in(
                    formatCkbDigits(seriesOrder),
                    formatCkbDigits(seriesTotal),
                  )}
                </p>
              ) : null}
              {writing.seriesId ? (
                <Link
                  href={`/dashboard/writings/series/${writing.seriesId}`}
                  className="text-primary mt-2 inline-block text-xs underline"
                >
                  {NS.action.view_series_short}
                </Link>
              ) : null}
            </div>
          ) : (
            <div className={sectionDivider}>
              <h3 className="mb-2 font-medium">{NS.section.series}</h3>
              <p className="text-muted-foreground text-xs">
                {NS.field.standalone_helper}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => onOpenLink("fromBook")}
              >
                {NS.action.link_existing}
              </Button>
            </div>
          )}

          <div className={sectionDivider}>
            <h3 className="mb-3 font-medium">{NS.section.files_format}</h3>
            <dl className="space-y-2 text-xs">
              {hasCkb ? (
                <>
                  <div>
                    <dt className="text-muted-foreground">
                      {NS.files_meta.format_ckb}
                    </dt>
                    <dd>
                      <WritingFormatPill format={writing.ckbContent?.fileFormat} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">
                      {NS.files_meta.pages_ckb}
                    </dt>
                    <dd>
                      {writing.ckbContent?.pageCount
                        ? `${formatCkbDigits(writing.ckbContent.pageCount)} ${NS.pages.suffix}`
                        : NS.dash}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">
                      {NS.files_meta.size_ckb}
                    </dt>
                    <dd>
                      {humanReadableSize(writing.ckbContent?.fileSizeBytes)}
                    </dd>
                  </div>
                </>
              ) : null}
              {hasKmr ? (
                <>
                  <div>
                    <dt className="text-muted-foreground">
                      {NS.files_meta.format_kmr}
                    </dt>
                    <dd>
                      <WritingFormatPill format={writing.kmrContent?.fileFormat} />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">
                      {NS.files_meta.pages_kmr}
                    </dt>
                    <dd>
                      {writing.kmrContent?.pageCount
                        ? `${formatCkbDigits(writing.kmrContent.pageCount)} ${NS.pages.suffix}`
                        : NS.dash}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">
                      {NS.files_meta.size_kmr}
                    </dt>
                    <dd>
                      {humanReadableSize(writing.kmrContent?.fileSizeBytes)}
                    </dd>
                  </div>
                </>
              ) : null}
            </dl>
          </div>

          <div className={sectionDivider}>
            <h3 className="mb-2 font-medium">{NS.section.languages}</h3>
            <WritingLanguageChipRow langs={langs} />
          </div>

          <div className={sectionDivider}>
            <h3 className="mb-3 font-medium">{NS.section.dates}</h3>
            <dl className="space-y-2 text-xs">
              {writing.createdAt ? (
                <div>
                  <dt className="text-muted-foreground">{NS.system.created_at}</dt>
                  <dd title={formatFullTimestampKu(writing.createdAt)}>
                    {formatRelativeTimeKu(writing.createdAt)}
                  </dd>
                </div>
              ) : null}
              {writing.updatedAt ? (
                <div>
                  <dt className="text-muted-foreground">{NS.system.updated_at}</dt>
                  <dd title={formatFullTimestampKu(writing.updatedAt)}>
                    {formatRelativeTimeKu(writing.updatedAt)}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-muted-foreground">{NS.system.id}</dt>
                <dd className="font-mono">#{writing.id}</dd>
              </div>
            </dl>
          </div>

          <div className={sectionDivider}>
            <h3 className="mb-2 font-medium">{NS.section.actions}</h3>
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start"
                onClick={onCopy}
              >
                <LinkIcon className="size-4" />
                {NS.action.copy_url}
              </Button>
              <Button type="button" variant="ghost" className="w-full justify-start">
                <ShareIcon className="size-4" />
                {NS.action.share}
              </Button>
              {inSeries ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => onOpenLink("fromSeries")}
                >
                  <LinkIcon className="size-4" />
                  {NS.action.add_to_series}
                </Button>
              ) : null}
            </div>
          </div>
        </aside>

        <article
          dir="rtl"
          className="mx-auto w-full max-w-[860px] px-6 pb-12 pt-8"
        >
          <div className="text-muted-foreground mb-6 flex flex-wrap items-center gap-2 text-xs">
            {writing.publishedByInstitute ? (
              <span className="inline-flex rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-emerald-700 dark:text-emerald-400">
                {NS.institute.badge}
              </span>
            ) : null}
            {inSeries && writing.seriesName ? (
              <span className="border-border bg-muted inline-flex rounded-md border px-2 py-0.5">
                {NS.series.banner_label}: {writing.seriesName}
              </span>
            ) : null}
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="bg-muted relative mx-auto aspect-[2/3] w-[240px] shrink-0 overflow-hidden rounded-lg md:mx-0">
              {cover ? (
                <Image
                  src={cover}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized={cover.startsWith("http")}
                />
              ) : (
                <div className="text-muted-foreground flex size-full flex-col items-center justify-center gap-2 text-sm">
                  {NS.empty.no_cover}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-4xl leading-tight font-bold">
                {writing.ckbContent?.title?.trim() || NS.dash}
              </h1>
              {writing.kmrContent?.title?.trim() ? (
                <p className="text-muted-foreground mt-2 text-xl font-medium leading-snug">
                  {writing.kmrContent.title}
                </p>
              ) : null}

              {hasCkb && hasKmr ? (
                <div className="mt-4 flex gap-3 border-b border-border">
                  {(["CKB", "KMR"] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => onTabChange(l)}
                      className={cn(
                        "border-b-2 pb-2 text-sm font-medium transition-colors",
                        tab === l
                          ? "border-primary text-foreground"
                          : "border-transparent text-muted-foreground",
                      )}
                    >
                      {l === "CKB" ? NS.lang.ckb : NS.lang.kmr}
                    </button>
                  ))}
                </div>
              ) : null}

              <p className="text-muted-foreground mt-4 text-sm">
                {NS.section.writer}:{" "}
                <span className="text-foreground font-medium">
                  {activeWriter || NS.dash}
                </span>
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {(writing.bookGenres ?? []).map((g) => (
                  <WritingGenrePill key={g} genre={g} />
                ))}
              </div>

              {activeContent?.genre?.trim() ? (
                <p className="text-muted-foreground mt-3 text-xs">
                  {NS.section.editorial_genre}: {activeContent.genre}
                </p>
              ) : null}
            </div>
          </div>

          <section className={cn(sectionDivider, "mt-10")}>
            <h2 className="mb-4 text-sm font-medium">{NS.section.reader}</h2>
            <div className="space-y-3">
              {hasCkb ? (
                <WritingReaderCard lang="CKB" content={writing.ckbContent} />
              ) : null}
              {hasKmr ? (
                <WritingReaderCard lang="KMR" content={writing.kmrContent} />
              ) : null}
            </div>
          </section>

          <section className={cn(sectionDivider, "mt-10")}>
            <h2 className="mb-3 text-sm font-medium">{NS.section.description}</h2>
            {isRichTextEmpty(activeDesc) ? (
              <p className="text-muted-foreground text-sm italic">
                {NS.empty.no_body}
              </p>
            ) : (
              <div
                className="prose prose-base max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: toProseHtml(activeDesc) }}
              />
            )}
          </section>

          <section className={cn(sectionDivider, "mt-10")}>
            <h2 className="mb-3 text-sm font-medium">{NS.section.tags}</h2>
            <div className="flex flex-wrap gap-2">
              {[...(writing.tagsCkb ?? []), ...(writing.tagsKmr ?? [])].length ===
              0 ? (
                <span className="text-muted-foreground text-sm">{NS.dash}</span>
              ) : (
                <>
                  {writing.tagsCkb?.map((t) => (
                    <span
                      key={`ckb-${t}`}
                      className="border-border bg-muted inline-flex rounded-md border px-2 py-0.5 text-xs"
                    >
                      {t}
                      <sup className="ms-1 text-[10px] opacity-60">ckb</sup>
                    </span>
                  ))}
                  {writing.tagsKmr?.map((t) => (
                    <span
                      key={`kmr-${t}`}
                      className="border-border bg-muted inline-flex rounded-md border px-2 py-0.5 text-xs"
                    >
                      {t}
                      <sup className="ms-1 text-[10px] opacity-60">kmr</sup>
                    </span>
                  ))}
                </>
              )}
            </div>
            <h2 className="mb-3 mt-6 text-sm font-medium">{NS.section.keywords}</h2>
            <div className="flex flex-wrap gap-2">
              {[...(writing.keywordsCkb ?? []), ...(writing.keywordsKmr ?? [])]
                .length === 0 ? (
                <span className="text-muted-foreground text-sm">{NS.dash}</span>
              ) : (
                <>
                  {writing.keywordsCkb?.map((t) => (
                    <span
                      key={`kckb-${t}`}
                      className="text-muted-foreground inline-flex rounded-md border border-dashed border-border px-2 py-0.5 text-xs"
                    >
                      {t}
                      <sup className="ms-1 text-[10px] opacity-60">ckb</sup>
                    </span>
                  ))}
                  {writing.keywordsKmr?.map((t) => (
                    <span
                      key={`kkmr-${t}`}
                      className="text-muted-foreground inline-flex rounded-md border border-dashed border-border px-2 py-0.5 text-xs"
                    >
                      {t}
                      <sup className="ms-1 text-[10px] opacity-60">kmr</sup>
                    </span>
                  ))}
                </>
              )}
            </div>
          </section>
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
  )
}
