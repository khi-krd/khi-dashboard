"use client"

import {
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  CalendarIcon,
  ChevronRightIcon,
  HashtagIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  PencilSquareIcon,
  ShareIcon,
  TagIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Fragment,
  useEffect,
  useMemo,
  useState,
} from "react"
import { toast } from "sonner"

import {
  dashboardNewsCrumbHref,
  NewsBreadcrumbBar,
} from "@/components/news/news-breadcrumb"
import { NewsDeleteDialog } from "@/components/news/news-delete-dialog"
import { NewsDetailSkeleton } from "@/components/news/news-detail-skeleton"
import { NewsErrorState } from "@/components/news/news-error-state"
import { newsUrlPublic } from "@/components/news/news-media-helpers"
import { NS, truncateTitle } from "@/components/news/news-strings"
import { Badge } from "@/components/reui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import { useDeleteNewsMutation, useNewsDetailQuery } from "@/hooks/useNews"
import { mergeNewsDerivedTaxonomy } from "@/lib/news-derived-cache"
import {
  formatFullTimestampKu,
  formatRelativeTimeKu,
} from "@/lib/news-relative-time"
import {
  isRichTextEmpty,
  sanitizeNewsBodyHtml,
} from "@/lib/sanitize-news-html"
import { formatCkbDigits, formatNewsDateLong, formatNewsDateShort } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type { Language, NewsDto } from "@/types/news"
import { newsRowStatus } from "@/types/news-ui"
import { useQueryClient } from "@tanstack/react-query"

function miniStatusPill(dto: NewsDto) {
  const s = newsRowStatus(dto)
  const base =
    "inline-flex max-w-fit items-center rounded-full px-2 py-0.5 text-[0.65rem] font-medium"
  if (s === "scheduled") {
    return (
      <span className={cn(base, "bg-amber-500/15 text-amber-950 dark:text-amber-200")}>
        {NS.status.scheduled}
      </span>
    )
  }
  if (s === "draft") {
    return (
      <span className={cn(base, "bg-muted text-muted-foreground")}>{NS.status.draft}</span>
    )
  }
  return (
    <span className={cn(base, "bg-primary/14 text-primary")}>{NS.status.published}</span>
  )
}

function sidebarStatusPill(dto: NewsDto) {
  const s = newsRowStatus(dto)
  const base =
    "w-full rounded-md py-1.5 text-center text-xs font-medium tracking-tight"
  if (s === "scheduled") {
    return (
      <div className={cn(base, "bg-amber-500/14 text-amber-950 dark:text-amber-200")}>
        {NS.status.scheduled}
      </div>
    )
  }
  if (s === "draft") {
    return <div className={cn(base, "bg-muted text-muted-foreground")}>{NS.status.draft}</div>
  }
  return (
    <div className={cn(base, "bg-primary/14 text-primary")}>{NS.status.published}</div>
  )
}

function sidebarStatusDetail(dto: NewsDto): string {
  const s = newsRowStatus(dto)
  if (s === "draft") return NS.detail.sidebar_draft_intro
  const dp = dto.datePublished
  const dateFmt = dp ? formatNewsDateLong(dp) : NS.dash
  if (s === "scheduled")
    return `${NS.detail.sidebar_scheduled_intro} ${NS.detail.sidebar_at} ${dateFmt}`
  return `${NS.detail.sidebar_published_intro} ${NS.detail.sidebar_at} ${dateFmt}`
}

function TagChip({
  label,
  lang,
  dashed,
  href,
}: {
  label: string
  lang: "ckb" | "kmr"
  dashed?: boolean
  href: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "border-border inline-flex max-w-full items-center rounded-md border px-2 py-0.5 align-middle text-xs leading-tight hover:bg-muted/50",
        dashed
          ? "bg-transparent text-muted-foreground border-dashed"
          : "bg-muted text-foreground",
      )}
    >
      <span dir="rtl" className="min-w-0 truncate">
        {label}
      </span>
      <sup className="text-muted-foreground ms-1 shrink-0 text-[10px] leading-none">{lang}</sup>
    </Link>
  )
}

/** Main article column renders CKB prose first row if CKB ∈ langs, else KM only. */
function ArticleBodyTabs({
  dto,
}: {
  dto: NewsDto
}) {
  const langs = dto.contentLanguages ?? []
  const hasCkb = langs.includes("CKB")
  const hasKmr = langs.includes("KMR")
  const multi = hasCkb && hasKmr
  const [tab, setTab] = useState<Language>(() => (hasCkb ? "CKB" : "KMR"))

  const descCkb = dto.ckbContent?.description ?? ""
  const descKmr = dto.kmrContent?.description ?? ""

  const activeHtml = tab === "CKB" ? descCkb : descKmr
  const sanitized = useMemo(
    () => sanitizeNewsBodyHtml(activeHtml.trim() ? activeHtml : ""),
    [activeHtml],
  )

  return (
    <div className="">
      {!multi ? (
        <>
          {!isRichTextEmpty(hasCkb ? descCkb : descKmr) ? (
            // eslint-disable-next-line react/no-danger
            <div
              dir="rtl"
              className="prose prose-base mt-6 max-w-none dark:prose-invert prose-p:text-foreground prose-headings:text-foreground"
              dangerouslySetInnerHTML={{ __html: sanitized }}
            />
          ) : (
            <p className="text-muted-foreground mt-6 text-sm italic">{NS.empty.no_body}</p>
          )}
        </>
      ) : (
        <>
          <div className="mt-6 flex gap-8 border-b border-border/80">
            {( ["CKB", "KMR"] as const ).map((code) =>
              langs.includes(code) ? (
                <button
                  key={code}
                  type="button"
                  onClick={() => setTab(code)}
                  className={cn(
                    "-mb-px pb-3 text-sm font-medium transition-colors",
                    tab === code
                      ? "border-primary text-foreground border-b-2"
                      : "text-muted-foreground border-b-2 border-transparent hover:text-foreground",
                  )}
                >
                  {code === "CKB" ? NS.lang.ckb : NS.lang.kmr}
                </button>
              ) : null,
            )}
          </div>
          {!isRichTextEmpty(tab === "CKB" ? descCkb : descKmr) ? (
            // eslint-disable-next-line react/no-danger
            <div
              dir={tab === "KMR" ? "ltr" : "rtl"}
              className={cn(
                "prose prose-base mt-6 max-w-none dark:prose-invert prose-p:text-foreground prose-headings:text-foreground",
                tab === "KMR" && "text-start",
              )}
              dangerouslySetInnerHTML={{ __html: sanitized }}
            />
          ) : (
            <p className="text-muted-foreground mt-6 text-sm italic">{NS.empty.no_body}</p>
          )}
        </>
      )}
    </div>
  )
}

export function NewsDetailClient({ newsId }: { newsId: number }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const q = useNewsDetailQuery(newsId)
  const [deleteDlg, setDeleteDlg] = useState(false)
  const deleteMut = useDeleteNewsMutation()
  const { copyToClipboard } = useCopyToClipboard({
    onCopy: () => toast.success(NS.toast.copied),
  })

  const dto = q.data?.success === true ? q.data.data : undefined

  useEffect(() => {
    if (dto) mergeNewsDerivedTaxonomy(queryClient, [dto])
  }, [dto, queryClient])

  function shareArticle() {
    if (!dto?.id) return
    const url = newsUrlPublic(dto.id)
    if (
      typeof navigator !== "undefined" &&
      navigator.share &&
      dto?.ckbContent?.title
    ) {
      void navigator
        .share({
          title: dto.ckbContent.title,
          text: dto.ckbContent.title,
          url: url || undefined,
        })
        .catch(() => {
          if (url) copyToClipboard(url)
        })
      return
    }
    if (url) copyToClipboard(url)
    else toast.error(NS.error.generic)
  }

  if (q.isLoading) return <NewsDetailSkeleton />

  if (q.isError) {
    return (
      <div dir="rtl" className="px-4 pt-10">
        <NewsErrorState onRetry={() => void q.refetch()} />
      </div>
    )
  }

  if (!dto?.id) {
    return (
      <TooltipProvider delay={250}>
        <div className="flex flex-col gap-8 px-4 pt-6" dir="rtl">
          <NewsBreadcrumbBar
            segments={[
              { label: NS.breadcrumb.dashboard, href: dashboardNewsCrumbHref() },
              { label: NS.breadcrumb.news, href: "/dashboard/news" },
              { label: NS.notFound.title },
            ]}
          />
          <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <MagnifyingGlassIcon className="text-muted-foreground size-14 opacity-50" aria-hidden />
            <p className="text-foreground text-lg font-semibold">{NS.notFound.title}</p>
            <Link
              href="/dashboard/news"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "inline-flex rounded-md",
              )}
            >
              <ArrowRightIcon className="me-2 size-4 rtl:rotate-180" aria-hidden />
              {NS.notFound.cta}
            </Link>
          </div>
        </div>
      </TooltipProvider>
    )
  }

  const langs = dto.contentLanguages ?? []
  const hasCkb = langs.includes("CKB")
  const hasKmr = langs.includes("KMR")
  const titleCkb = dto.ckbContent?.title?.trim() ?? ""
  const titleKmr = dto.kmrContent?.title?.trim() ?? ""

  const breadcrumbTitle =
    titleCkb || titleKmr || NS.dash
  const publicUrl = dto.id ? newsUrlPublic(dto.id) : ""

  const ckbTags = dto.tags?.ckb ?? []
  const kmrTags = dto.tags?.kmr ?? []
  const tagItems = [
    ...ckbTags.map((t) => ({ lang: "ckb" as const, tag: t })),
    ...kmrTags.map((t) => ({ lang: "kmr" as const, tag: t })),
  ]
  const ckbKw = dto.keywords?.ckb ?? []
  const kmrKw = dto.keywords?.kmr ?? []
  const kwItems = [
    ...ckbKw.map((t) => ({ lang: "ckb" as const, kw: t })),
    ...kmrKw.map((t) => ({ lang: "kmr" as const, kw: t })),
  ]

  return (
    <TooltipProvider delay={250}>
      <div className="min-h-[50vh]" dir="rtl">
        <header className="bg-background/95 supports-backdrop-filter:backdrop-blur border-border sticky top-0 z-30 border-b">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
            <NewsBreadcrumbBar
              className="min-w-0 flex-1"
              segments={[
                { label: NS.breadcrumb.dashboard, href: dashboardNewsCrumbHref() },
                { label: NS.breadcrumb.news, href: "/dashboard/news" },
                {
                  label: truncateTitle(hasCkb && titleCkb ? titleCkb : breadcrumbTitle, 40),
                },
              ]}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-md"
                onClick={() => router.push("/dashboard/news")}
              >
                <ArrowRightIcon className="size-4 rtl:rotate-180" aria-hidden />
                {NS.action.back}
              </Button>
              {publicUrl ? (
                <Link
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "rounded-md gap-1.5",
                  )}
                >
                  <ArrowTopRightOnSquareIcon className="size-4 rtl:rotate-180" aria-hidden />
                  {NS.action.view_on_site}
                </Link>
              ) : null}
              <Link
                href={`/dashboard/news/${dto.id}/edit`}
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "inline-flex gap-1.5 rounded-md",
                )}
              >
                <PencilSquareIcon className="size-4" aria-hidden />
                {NS.action.edit}
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-md text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteDlg(true)}
              >
                <TrashIcon className="size-4" aria-hidden />
                {NS.action.delete}
              </Button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:mx-auto lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 lg:px-6">
          <main className="order-1 min-w-0">
            <div className="mx-auto max-w-[860px] px-6 pb-12 pt-8">
              <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                {miniStatusPill(dto)}
                <span aria-hidden className="text-muted-foreground/60">
                  ·
                </span>
                <span className="inline-flex flex-wrap items-center gap-1">
                  <Link
                    href={`/dashboard/news?category=${encodeURIComponent(dto.category?.ckbName ?? "")}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {dto.category?.ckbName ?? NS.dash}
                  </Link>
                  {dto.subCategory?.ckbName ? (
                    <>
                      <ChevronRightIcon className="text-muted-foreground/60 size-3.5 shrink-0 rtl:rotate-180" />
                      <Link
                        href={`/dashboard/news?category=${encodeURIComponent(dto.category?.ckbName ?? "")}&subcategory=${encodeURIComponent(dto.subCategory.ckbName)}`}
                        className="hover:text-foreground transition-colors"
                      >
                        {dto.subCategory.ckbName}
                      </Link>
                    </>
                  ) : null}
                </span>
                {dto.datePublished ? (
                  <>
                    <span aria-hidden className="text-muted-foreground/60">
                      ·
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarIcon className="size-3.5 shrink-0 opacity-80" aria-hidden />
                      {formatNewsDateShort(dto.datePublished)}
                    </span>
                  </>
                ) : null}
              </div>

              <div className="relative mt-5 aspect-[21/9] w-full overflow-hidden rounded-xl border border-border/60 bg-muted">
                {dto.coverUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        dto.coverMediaType === "VIDEO" || dto.coverMediaType === "AUDIO"
                          ? dto.coverThumbnailUrl || dto.coverUrl
                          : dto.coverUrl
                      }
                      alt=""
                      className="absolute inset-0 size-full object-cover"
                    />
                    {dto.coverMediaType && dto.coverMediaType !== "IMAGE" ? (
                      <span className="bg-background/80 absolute start-3 top-3 rounded-md px-2 py-1 text-xs font-medium">
                        {NS.coverKind[dto.coverMediaType]}
                      </span>
                    ) : null}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-linear-to-t from-background/45 to-transparent" />
                  </>
                ) : (
                  <div className="text-muted-foreground flex aspect-[21/9] flex-col items-center justify-center gap-2">
                    <PhotoIcon className="size-14 opacity-40" aria-hidden />
                    <span className="text-sm">{NS.empty.no_cover}</span>
                  </div>
                )}
              </div>

              <header className="mt-8">
                {langs.length === 1 ? (
                  <h1 className="text-foreground text-4xl font-bold leading-tight tracking-tight">
                    {langs[0] === "CKB" ? titleCkb || NS.dash : titleKmr || NS.dash}
                  </h1>
                ) : (
                  <>
                    {hasCkb ? (
                      <h1 className="text-foreground text-4xl font-bold leading-tight tracking-tight">
                        {titleCkb || NS.dash}
                      </h1>
                    ) : null}
                    {hasKmr ? (
                      <p
                        className={cn(
                          "text-muted-foreground mt-2 text-xl font-medium leading-snug tracking-tight",
                          hasCkb && "mt-2",
                          !hasCkb && "!mt-0 !text-4xl !font-bold !text-foreground",
                        )}
                        dir="ltr"
                      >
                        {titleKmr || (hasCkb ? "" : NS.dash)}
                      </p>
                    ) : null}
                  </>
                )}
              </header>

              <ArticleBodyTabs key={dto.id} dto={dto} />

              {(dto.mediaGallery?.length ?? 0) > 0 ? (
                <section className="border-border/60 mt-10 border-t pt-8">
                  <h2 className="text-muted-foreground mb-4 text-xs font-medium tracking-wide uppercase">
                    {NS.section.media_gallery}
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {dto.mediaGallery!.map((item, i) => (
                      <figure
                        key={`${item.url}-${i}`}
                        className="border-border overflow-hidden rounded-lg border bg-muted/20"
                      >
                        {item.kind === "VIDEO" ? (
                          <video
                            src={item.url}
                            controls
                            className="aspect-video w-full bg-black object-contain"
                          />
                        ) : item.kind === "AUDIO" ? (
                          <div className="flex aspect-video items-center justify-center p-4">
                            <audio src={item.url} controls className="w-full" />
                          </div>
                        ) : (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={item.url}
                            alt=""
                            className="aspect-video w-full object-cover"
                          />
                        )}
                        {(item.captionCkb?.trim() || item.captionKmr?.trim()) ? (
                          <figcaption className="text-muted-foreground p-2 text-xs">
                            {item.captionCkb?.trim() || item.captionKmr?.trim()}
                          </figcaption>
                        ) : null}
                      </figure>
                    ))}
                  </div>
                </section>
              ) : null}

              {tagItems.length > 0 || kwItems.length > 0 ? (
                <Fragment>
                  <div className="border-border/60 mt-12 border-t pt-6">
                    {tagItems.length > 0 ? (
                      <div>
                        <p className="text-muted-foreground flex items-center gap-1 text-xs font-normal uppercase tracking-wide">
                          <TagIcon className="size-4 opacity-70" aria-hidden />
                          {NS.section.tags}
                        </p>
                        <div dir="ltr" className="mt-2 flex flex-wrap gap-2">
                          {tagItems.map((entry, idx) => (
                            <TagChip
                              key={`${entry.lang}-${idx}-${entry.tag}`}
                              label={entry.tag}
                              lang={entry.lang}
                              dashed={false}
                              href={`/dashboard/news?tag=${encodeURIComponent(entry.tag)}`}
                            />
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {kwItems.length > 0 ? (
                      <div className={tagItems.length > 0 ? "mt-6" : undefined}>
                        <p className="text-muted-foreground flex items-center gap-1 text-xs font-normal uppercase tracking-wide">
                          <HashtagIcon className="size-4 opacity-70" aria-hidden />
                          {NS.section.keywords}
                        </p>
                        <div dir="ltr" className="mt-2 flex flex-wrap gap-2">
                          {kwItems.map((entry, idx) => (
                            <TagChip
                              key={`kw-${entry.lang}-${idx}-${entry.kw}`}
                              label={entry.kw}
                              lang={entry.lang}
                              dashed
                              href={`/dashboard/news?keyword=${encodeURIComponent(entry.kw)}`}
                            />
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </Fragment>
              ) : null}

            </div>
          </main>

          <aside className="border-border order-2 mx-4 mb-8 rounded-xl border bg-card/40 lg:sticky lg:top-20 lg:mx-0 lg:mb-16 lg:h-fit lg:self-start lg:mt-8">
            <div className="divide-border/60 divide-y px-5 py-5">
              <section className="pb-6">
                <div className="space-y-2">{sidebarStatusPill(dto)}</div>
                <p className="text-muted-foreground mt-2 text-xs leading-relaxed">{sidebarStatusDetail(dto)}</p>
              </section>

              <section className="pt-6 pb-6">
                <p className="text-muted-foreground mb-3 text-xs font-normal uppercase tracking-wide">
                  {NS.section.languages}
                </p>
                <div className="flex flex-wrap gap-2">
                  {langs.includes("CKB") ? (
                    <span className="bg-primary/15 text-primary inline-flex rounded-md px-3 py-1 text-xs font-medium">
                      {NS.lang.ckb}
                    </span>
                  ) : null}
                  {langs.includes("KMR") ? (
                    <span className="bg-muted text-muted-foreground inline-flex rounded-md px-3 py-1 text-xs font-medium ring-1 ring-border/70">
                      {NS.lang.kmr}
                    </span>
                  ) : null}
                </div>
              </section>

              <section className="pt-6 pb-6 space-y-3">
                <p className="text-muted-foreground text-xs font-normal uppercase tracking-wide">{NS.section.classification}</p>
                <ClassificationRow
                  label={NS.field.category}
                  ckb={dto.category?.ckbName}
                  kmr={dto.category?.kmrName}
                  filterHref={`/dashboard/news?category=${encodeURIComponent(dto.category?.ckbName ?? "")}`}
                />
                <ClassificationRow
                  label={NS.field.subcategory}
                  ckb={dto.subCategory?.ckbName}
                  kmr={dto.subCategory?.kmrName}
                  filterHref={`/dashboard/news?category=${encodeURIComponent(dto.category?.ckbName ?? "")}&subcategory=${encodeURIComponent(dto.subCategory?.ckbName ?? "")}`}
                />
              </section>

              <section className="pt-6 pb-6 space-y-2">
                <p className="text-muted-foreground text-xs font-normal uppercase tracking-wide">{NS.section.dates}</p>
                <DlRowShort label={NS.field.published_at} value={dto.datePublished ? formatNewsDateShort(dto.datePublished) : NS.dash} />
                <RelativeDlRow iso={dto.createdAt} label={NS.field.created_at} />
                <RelativeDlRow iso={dto.updatedAt} label={NS.field.updated_at} />
              </section>

              <section className="pt-6 pb-6">
                <p className="text-muted-foreground text-xs font-normal uppercase tracking-wide">{NS.section.system}</p>
                <div className="mt-3 flex gap-2 text-xs">
                  <span className="text-muted-foreground">{NS.field.id}</span>
                  <span dir="ltr" className="text-foreground font-mono tracking-tight">
                    #{dto.id}
                  </span>
                </div>
              </section>

              <section className="pt-6">
                <p className="text-muted-foreground text-xs font-normal uppercase tracking-wide">{NS.section.actions}</p>
                <div className="mt-4 flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="hover:bg-muted/80 text-foreground inline-flex h-auto w-full items-center justify-start gap-2 px-3 py-2.5 whitespace-normal hover:text-inherit rounded-md border border-transparent hover:border-transparent"
                    onClick={() => {
                      const u = publicUrl
                      if (u) copyToClipboard(u)
                      else toast.error(NS.error.generic)
                    }}
                  >
                    <LinkIcon className="size-5 shrink-0 opacity-75" aria-hidden />
                    <span className="text-start text-xs font-normal leading-snug">{NS.action.copy_url}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="hover:bg-muted/80 text-foreground inline-flex h-auto w-full items-center justify-start gap-2 px-3 py-2.5 whitespace-normal hover:text-inherit rounded-md border border-transparent hover:border-transparent"
                    onClick={() => shareArticle()}
                  >
                    <ShareIcon className="size-5 shrink-0 opacity-75" aria-hidden />
                    <span className="text-start text-xs font-normal leading-snug">{NS.action.share}</span>
                  </Button>
                </div>
              </section>
            </div>
          </aside>
        </div>

        <NewsDeleteDialog
          open={deleteDlg}
          onOpenChange={setDeleteDlg}
          target={{
            mode: "single",
            item: {
              ...dto,
              titleCkb: dto.ckbContent?.title ?? titleCkb,
            },
          }}
          isPending={deleteMut.isPending}
          onConfirm={() => {
            if (!dto.id) return
            setDeleteDlg(false)
            deleteMut.mutate(dto.id, {
              onSuccess: () => {
                toast.success(NS.toast.deleted)
                router.replace("/dashboard/news")
              },
              onError: () => {
                toast.error(NS.error.generic)
              },
            })
          }}
        />
      </div>
    </TooltipProvider>
  )
}

function ClassificationRow({
  label,
  ckb,
  kmr,
  filterHref,
}: {
  label: string
  ckb?: string | null
  kmr?: string | null
  filterHref: string
}) {
  return (
    <Link
      href={filterHref}
      className="border-border hover:bg-muted/35 block rounded-md border px-3 py-2 transition-colors"
    >
      <p className="text-muted-foreground text-[0.7rem] font-medium uppercase tracking-wide">{label}</p>
      <p className="text-foreground mt-0.5 font-medium leading-snug">{ckb?.trim() || NS.dash}</p>
      {kmr?.trim() ? (
        <p dir="ltr" className="text-muted-foreground mt-0.5 text-xs leading-snug">{kmr}</p>
      ) : null}
    </Link>
  )
}

function DlRowShort({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <dt className="text-muted-foreground min-w-0">{label}</dt>
      <dd className="text-foreground">{value}</dd>
    </div>
  )
}

function RelativeDlRow({
  label,
  iso,
}: {
  label: string
  iso: string | null | undefined
}) {
  if (!iso) {
    return <DlRowShort label={label} value={NS.dash} />
  }
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                className="hover:text-foreground text-foreground text-start underline decoration-dashed underline-offset-4 transition-colors hover:opacity-95"
              >
                {formatRelativeTimeKu(iso)}
              </button>
            }
          />
          <TooltipContent>{formatFullTimestampKu(iso)}</TooltipContent>
        </Tooltip>
      </dd>
    </div>
  )
}
