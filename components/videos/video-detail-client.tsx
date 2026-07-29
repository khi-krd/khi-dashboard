"use client"

import {
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  CalendarIcon,
  ClockIcon,
  FilmIcon,
  HashtagIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PencilSquareIcon,
  ShareIcon,
  TagIcon,
  TrashIcon,
  UserIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import {
  VideoBreadcrumbBar,
  dashboardVideosCrumbHref,
} from "@/components/videos/video-breadcrumb"
import { VideoDeleteDialog } from "@/components/videos/video-delete-dialog"
import { VideoDetailSkeleton } from "@/components/videos/video-detail-skeleton"
import { VideoLanguageChipRow } from "@/components/videos/video-language-chip"
import { VideoPlayerBlock } from "@/components/videos/video-player-block"
import { VideoTypePill } from "@/components/videos/video-type-pill"
import { VideosErrorState } from "@/components/videos/video-error-state"
import { NS, truncateTitle } from "@/components/videos/videos-strings"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import {
  useDeleteVideoMutation,
  useVideoDetailQuery,
} from "@/hooks/useVideos"
import {
  formatFullTimestampKu,
  formatRelativeTimeKu,
} from "@/lib/news-relative-time"
import {
  isRichTextEmpty,
  sanitizeNewsBodyHtml,
} from "@/lib/sanitize-news-html"
import {
  formatCkbDigits,
  formatNewsDateLong,
  formatNewsDateShort,
} from "@/lib/intl-ckb"
import { formatDuration, formatFileSizeMb } from "@/lib/video-format"
import { videoUrlPublic } from "@/lib/video-url-helpers"
import { cn } from "@/lib/utils"
import type { Language, VideoClipItemDto, VideoDto, VideoSourceDto } from "@/types/videos"
import { getMainFilmSource } from "@/types/videos-ui"

const sectionDivider = "border-t border-border/60 pt-6"

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function toProseHtml(raw: string) {
  const t = raw.trim()
  if (!t) return ""
  const looksLikeHtml = /<[a-z][\s\S]*>/i.test(t)
  const html = looksLikeHtml ? t : `<p>${escapeHtml(t)}</p>`
  return sanitizeNewsBodyHtml(html)
}

function MetaDot() {
  return <span className="mx-2 text-muted-foreground/60">·</span>
}

function TaxonomyChip({
  label,
  lang,
  variant,
  href,
}: {
  label: string
  lang: "ckb" | "kmr"
  variant: "tags" | "keywords"
  href: string
}) {
  const styles = {
    tags: "bg-muted text-foreground border border-border",
    keywords:
      "bg-transparent text-muted-foreground border border-dashed border-border",
  }
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-md px-2 py-0.5 text-xs leading-tight hover:opacity-90",
        styles[variant],
      )}
    >
      <span className="min-w-0 truncate">{label}</span>
      <span className="text-muted-foreground/70 shrink-0 font-mono text-[10px]">
        {lang}
      </span>
    </Link>
  )
}

function CreditsRow({ dto, tab }: { dto: VideoDto; tab: Language }) {
  const content = tab === "CKB" ? dto.ckbContent : dto.kmrContent
  const director = content?.director?.trim()
  const producer = content?.producer?.trim()
  const location = content?.location?.trim()
  if (!director && !producer && !location) return null

  return (
    <dl className="text-muted-foreground mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
      {director ? (
        <div className="min-w-0">
          <dt className="text-muted-foreground/80 text-xs">{NS.credits.director}</dt>
          <dd className="text-foreground font-medium">{director}</dd>
        </div>
      ) : null}
      {producer ? (
        <div className="min-w-0">
          <dt className="text-muted-foreground/80 text-xs">{NS.credits.producer}</dt>
          <dd className="text-foreground font-medium">{producer}</dd>
        </div>
      ) : null}
      {location ? (
        <div className="min-w-0">
          <dt className="text-muted-foreground/80 text-xs">{NS.credits.location}</dt>
          <dd className="text-foreground inline-flex items-center gap-1 font-medium">
            <MapPinIcon className="size-3.5 shrink-0" />
            {location}
          </dd>
        </div>
      ) : null}
    </dl>
  )
}

function ArticleBodyTabs({
  dto,
  tab,
  onTabChange,
}: {
  dto: VideoDto
  tab: Language
  onTabChange: (l: Language) => void
}) {
  const langs = dto.contentLanguages ?? []
  const hasCkb = langs.includes("CKB")
  const hasKmr = langs.includes("KMR")
  const multi = hasCkb && hasKmr

  const descCkb = dto.ckbContent?.description ?? ""
  const descKmr = dto.kmrContent?.description ?? ""
  const activeHtml = tab === "CKB" ? descCkb : descKmr
  const sanitized = useMemo(
    () => sanitizeNewsBodyHtml(activeHtml.trim() ? activeHtml : ""),
    [activeHtml],
  )

  if (!multi) {
    const html = hasCkb ? descCkb : descKmr
    if (isRichTextEmpty(html)) {
      return (
        <p className="text-muted-foreground mt-6 text-sm italic">
          {NS.empty.no_body}
        </p>
      )
    }
    return (
      <div
        dir={hasCkb ? "rtl" : "ltr"}
        className="prose prose-base mt-6 max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: toProseHtml(html) }}
      />
    )
  }

  return (
    <div>
      <div className="mt-6 flex gap-8 border-b border-border/80">
        {(["CKB", "KMR"] as const).map((code) =>
          langs.includes(code) ? (
            <button
              key={code}
              type="button"
              onClick={() => onTabChange(code)}
              className={cn(
                "-mb-px pb-3 text-sm font-medium",
                tab === code
                  ? "border-primary text-foreground border-b-2"
                  : "text-muted-foreground border-b-2 border-transparent",
              )}
            >
              {code === "CKB" ? NS.lang.ckb : NS.lang.kmr}
            </button>
          ) : null,
        )}
      </div>
      {isRichTextEmpty(tab === "CKB" ? descCkb : descKmr) ? (
        <p className="text-muted-foreground mt-6 text-sm italic">
          {NS.empty.no_body}
        </p>
      ) : (
        <div
          dir={tab === "KMR" ? "ltr" : "rtl"}
          className="prose prose-base mt-6 max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: sanitized }}
        />
      )}
    </div>
  )
}

function DetailSourceRow({
  source,
  index,
}: {
  source: VideoSourceDto
  index: number
}) {
  const label = source.label?.trim() || NS.source.no_label
  return (
    <div className="border-border flex flex-col gap-3 rounded-lg border p-4 sm:flex-row">
      <div className="w-full shrink-0 sm:w-56">
        <VideoPlayerBlock
          className="!aspect-video !rounded-md"
          source={{
            url: source.url,
            externalUrl: source.externalUrl,
            embedUrl: source.embedUrl,
          }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-primary font-mono text-xs">
            #{formatCkbDigits(index + 1)}
          </p>
          {source.main ? (
            <span className="bg-muted rounded px-1.5 py-0.5 text-[10px] font-medium">
              {NS.source.main_badge}
            </span>
          ) : null}
        </div>
        <p className="font-medium">{label}</p>
        {source.durationSeconds != null ? (
          <p className="text-muted-foreground mt-2 font-mono text-[10px]">
            {formatDuration(source.durationSeconds)}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function DetailClipRow({ clip }: { clip: VideoClipItemDto }) {
  const title =
    clip.titleCkb?.trim() || clip.titleKmr?.trim() || NS.clip.no_title
  return (
    <div className="border-border flex flex-col gap-3 rounded-lg border p-4 sm:flex-row">
      <div className="w-full shrink-0 sm:w-56">
        <VideoPlayerBlock
          className="!aspect-video !rounded-md"
          source={{
            url: clip.url,
            externalUrl: clip.externalUrl,
            embedUrl: clip.embedUrl,
            fileFormat: clip.fileFormat,
          }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-primary font-mono text-xs">#{clip.clipNumber}</p>
        <p className="font-medium">{title}</p>
        {clip.titleKmr && clip.titleCkb ? (
          <p className="text-muted-foreground text-sm">{clip.titleKmr}</p>
        ) : null}
        <p className="text-muted-foreground mt-2 font-mono text-[10px]">
          {formatDuration(clip.durationSeconds)} · {clip.resolution || NS.dash}{" "}
          · {(clip.fileFormat ?? "").toUpperCase() || NS.dash} ·{" "}
          {clip.fileSizeMb != null
            ? formatFileSizeMb(clip.fileSizeMb)
            : NS.dash}
        </p>
      </div>
    </div>
  )
}

export function VideoDetailClient({ videoId }: { videoId: number }) {
  const router = useRouter()
  const q = useVideoDetailQuery(videoId)
  const [deleteDlg, setDeleteDlg] = useState(false)
  const deleteMut = useDeleteVideoMutation()
  const { copyToClipboard } = useCopyToClipboard({
    onCopy: () => toast.success(NS.toast.copied),
  })

  const dto = q.data

  if (q.isLoading) return <VideoDetailSkeleton />

  if (q.isError) {
    return (
      <div dir="rtl" className="px-4 pt-10">
        <VideosErrorState onRetry={() => void q.refetch()} />
      </div>
    )
  }

  if (!dto?.id) {
    return (
      <div className="flex flex-col gap-8 px-4 pt-6" dir="rtl">
        <VideoBreadcrumbBar
          segments={[
            { label: NS.breadcrumb.dashboard, href: dashboardVideosCrumbHref() },
            { label: NS.breadcrumb.videos, href: "/dashboard/videos" },
            { label: NS.not_found.title },
          ]}
        />
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <MagnifyingGlassIcon className="text-muted-foreground size-14 opacity-50" />
          <p className="text-lg font-semibold">{NS.not_found.title}</p>
          <Link
            href="/dashboard/videos"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-md")}
          >
            <ArrowRightIcon className="me-2 size-4 rtl:rotate-180" />
            {NS.not_found.cta}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <VideoDetailLoaded
      dto={{ ...dto, id: dto.id }}
      deleteDlg={deleteDlg}
      setDeleteDlg={setDeleteDlg}
      deleteMut={deleteMut}
      router={router}
      copyToClipboard={copyToClipboard}
    />
  )
}

function VideoDetailLoaded({
  dto,
  deleteDlg,
  setDeleteDlg,
  deleteMut,
  router,
  copyToClipboard,
}: {
  dto: VideoDto & { id: number }
  deleteDlg: boolean
  setDeleteDlg: (v: boolean) => void
  deleteMut: ReturnType<typeof useDeleteVideoMutation>
  router: ReturnType<typeof useRouter>
  copyToClipboard: (text: string) => void
}) {
  const langs = dto.contentLanguages ?? []
  const hasCkb = langs.includes("CKB")
  const [selectedTab, setBodyTab] = useState<Language>(() =>
    hasCkb ? "CKB" : "KMR",
  )
  // Clamp to a language this video actually has, derived rather than corrected
  // in an effect. The old version depended on `langs`, which is a fresh `[]`
  // whenever `contentLanguages` is undefined, so the effect re-ran every render.
  const bodyTab = langs.includes(selectedTab) ? selectedTab : (langs[0] ?? selectedTab)

  const titleCkb = dto.ckbContent?.title?.trim() ?? ""
  const titleKmr = dto.kmrContent?.title?.trim() ?? ""
  const publicUrl = videoUrlPublic(dto.id)
  const clips = dto.videoClipItems ?? []
  const filmSources = dto.videoSources ?? []
  const mainFilmSource = getMainFilmSource(dto)
  const isFilm = dto.videoType === "FILM"
  const poster = dto.ckbCoverUrl?.trim() || dto.kmrCoverUrl?.trim() || null

  const tagItems = [
    ...(dto.tagsCkb ?? []).map((t) => ({ lang: "ckb" as const, v: t })),
    ...(dto.tagsKmr ?? []).map((t) => ({ lang: "kmr" as const, v: t })),
  ]
  const kwItems = [
    ...(dto.keywordsCkb ?? []).map((t) => ({ lang: "ckb" as const, v: t })),
    ...(dto.keywordsKmr ?? []).map((t) => ({ lang: "kmr" as const, v: t })),
  ]

  const typeLabel = isFilm
    ? filmSources.length > 1
      ? NS.source.part_count(formatCkbDigits(filmSources.length))
      : NS.type.context.film
    : dto.albumOfMemories
      ? NS.type.context.album(formatCkbDigits(clips.length))
      : NS.type.context.clip(formatCkbDigits(clips.length))

  const topicCkb = dto.topicNameCkb?.trim()
  const topicKmr = dto.topicNameKmr?.trim()

  return (
    <TooltipProvider delay={250}>
      <div className="min-h-[50vh]" dir="rtl">
        <header className="bg-background/95 supports-backdrop-filter:backdrop-blur border-border sticky top-0 z-30 border-b">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
            <VideoBreadcrumbBar
              className="min-w-0 flex-1"
              segments={[
                { label: NS.breadcrumb.dashboard, href: dashboardVideosCrumbHref() },
                { label: NS.breadcrumb.videos, href: "/dashboard/videos" },
                { label: truncateTitle(titleCkb || titleKmr, 40) },
              ]}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/videos")}
              >
                <ArrowRightIcon className="size-4 rtl:rotate-180" />
                {NS.action.back}
              </Button>
              {publicUrl ? (
                <Link
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "gap-1.5 rounded-md",
                  )}
                >
                  <ArrowTopRightOnSquareIcon className="size-4 rtl:rotate-180" />
                  {NS.action.view_on_site}
                </Link>
              ) : null}
              <Link
                href={`/dashboard/videos/${dto.id}/edit`}
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "gap-1.5 rounded-md",
                )}
              >
                <PencilSquareIcon className="size-4" />
                {NS.action.edit}
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 rounded-md"
                onClick={() => setDeleteDlg(true)}
              >
                <TrashIcon className="size-4" />
                {NS.action.delete}
              </Button>
            </div>
          </div>
        </header>

        <div
          dir="ltr"
          className="grid grid-cols-1 lg:mx-auto lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-8 lg:px-6"
        >
          <aside dir="rtl" className="lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-xl border border-border bg-card p-6 text-sm">
              <section className="space-y-2">
                <VideoTypePill
                  videoType={dto.videoType}
                  albumOfMemories={dto.albumOfMemories}
                  size="large"
                />
              </section>

              {dto.topicId ? (
                <section className={cn(sectionDivider, "space-y-2")}>
                  <h4 className="text-muted-foreground text-xs uppercase tracking-wide">
                    {NS.section.topic}
                  </h4>
                  <Link
                    href={`/dashboard/videos?topic=${dto.topicId}`}
                    className="text-primary hover:underline"
                  >
                    {topicCkb || NS.topic.empty}
                  </Link>
                  {topicKmr ? (
                    <p className="text-muted-foreground text-xs">{topicKmr}</p>
                  ) : null}
                </section>
              ) : null}

              <section className={cn(sectionDivider, "space-y-2")}>
                <h4 className="text-muted-foreground text-xs uppercase tracking-wide">
                  {NS.section.credits}
                </h4>
                <dl className="space-y-2 text-xs">
                  {dto.ckbContent?.director?.trim() ? (
                    <div>
                      <dt className="text-muted-foreground">{NS.credits.director}</dt>
                      <dd>{dto.ckbContent.director}</dd>
                    </div>
                  ) : null}
                  {dto.ckbContent?.producer?.trim() ? (
                    <div>
                      <dt className="text-muted-foreground">{NS.credits.producer}</dt>
                      <dd>{dto.ckbContent.producer}</dd>
                    </div>
                  ) : null}
                  {dto.ckbContent?.location?.trim() ? (
                    <div>
                      <dt className="text-muted-foreground">{NS.credits.location}</dt>
                      <dd>{dto.ckbContent.location}</dd>
                    </div>
                  ) : null}
                  {!dto.ckbContent?.director?.trim() &&
                  !dto.ckbContent?.producer?.trim() &&
                  !dto.ckbContent?.location?.trim() ? (
                    <p className="text-muted-foreground">{NS.dash}</p>
                  ) : null}
                </dl>
              </section>

              {isFilm ? (
                <section className={cn(sectionDivider, "space-y-2")}>
                  <h4 className="text-muted-foreground text-xs uppercase tracking-wide">
                    {NS.section.technical}
                  </h4>
                  <dl className="space-y-2 text-xs">
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">{NS.field.duration}</dt>
                      <dd className="font-mono">
                        {formatDuration(dto.durationSeconds)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">{NS.field.resolution}</dt>
                      <dd>{dto.resolution?.trim() || NS.dash}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">{NS.field.format}</dt>
                      <dd className="font-mono uppercase">
                        {dto.fileFormat?.trim() || NS.dash}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">{NS.field.size}</dt>
                      <dd>{formatFileSizeMb(dto.fileSizeMb)}</dd>
                    </div>
                  </dl>
                </section>
              ) : null}

              <section className={cn(sectionDivider, "space-y-2")}>
                <h4 className="text-muted-foreground text-xs uppercase tracking-wide">
                  {NS.section.languages}
                </h4>
                <VideoLanguageChipRow langs={dto.contentLanguages ?? []} />
              </section>

              <section className={cn(sectionDivider, "space-y-3")}>
                <h4 className="text-muted-foreground text-xs uppercase tracking-wide">
                  {NS.section.dates}
                </h4>
                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">{NS.section.publish}</dt>
                    <dd className="font-mono">
                      {dto.publishmentDate
                        ? formatNewsDateShort(dto.publishmentDate)
                        : NS.dash}
                    </dd>
                  </div>
                  {dto.createdAt ? (
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
                                {formatRelativeTimeKu(dto.createdAt)}
                              </button>
                            }
                          />
                          <TooltipContent>
                            {formatFullTimestampKu(dto.createdAt)}
                          </TooltipContent>
                        </Tooltip>
                      </dd>
                    </div>
                  ) : null}
                  {dto.updatedAt ? (
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
                                {formatRelativeTimeKu(dto.updatedAt)}
                              </button>
                            }
                          />
                          <TooltipContent>
                            {formatFullTimestampKu(dto.updatedAt)}
                          </TooltipContent>
                        </Tooltip>
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </section>

              <section className={cn(sectionDivider, "space-y-2 text-xs")}>
                <h4 className="text-muted-foreground uppercase tracking-wide">
                  {NS.section.system}
                </h4>
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">{NS.system.id}</span>
                  <span className="font-mono">#{dto.id}</span>
                </div>
                {dto.createdBy ? (
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground inline-flex items-center gap-1">
                      <UserIcon className="size-3.5" />
                      دروستکار
                    </span>
                    <span>{dto.createdBy}</span>
                  </div>
                ) : null}
                {dto.updatedBy ? (
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">نوێکەر</span>
                    <span>{dto.updatedBy}</span>
                  </div>
                ) : null}
              </section>

              <section className={cn(sectionDivider, "space-y-2")}>
                <h4 className="text-muted-foreground text-xs uppercase tracking-wide">
                  {NS.section.actions}
                </h4>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-start gap-2 rounded-md"
                  onClick={() => publicUrl && copyToClipboard(publicUrl)}
                >
                  <LinkIcon className="size-4 shrink-0" />
                  {NS.action.copy_url}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-start gap-2 rounded-md"
                  onClick={() => {
                    if (navigator.share && titleCkb) {
                      void navigator
                        .share({ title: titleCkb, url: publicUrl || undefined })
                        .catch(() => {
                          if (publicUrl) copyToClipboard(publicUrl)
                        })
                    } else if (publicUrl) copyToClipboard(publicUrl)
                  }}
                >
                  <ShareIcon className="size-4 shrink-0" />
                  {NS.action.share}
                </Button>
              </section>
            </div>
          </aside>

          <main dir="rtl" className="min-w-0">
            <div className="mx-auto max-w-[860px] px-6 pb-12 pt-8">
              <div className="text-muted-foreground flex flex-wrap items-center text-xs">
                <span className="text-foreground font-medium">{typeLabel}</span>
                {topicCkb ? (
                  <>
                    <MetaDot />
                    <Link
                      href={`/dashboard/videos?topic=${dto.topicId}`}
                      className="hover:text-foreground"
                    >
                      {topicCkb}
                    </Link>
                  </>
                ) : null}
                {isFilm && dto.durationSeconds != null ? (
                  <>
                    <MetaDot />
                    <span className="inline-flex items-center gap-1">
                      <ClockIcon className="size-3.5" />
                      {formatDuration(dto.durationSeconds)}
                    </span>
                  </>
                ) : null}
                {dto.publishmentDate ? (
                  <>
                    <MetaDot />
                    <span className="inline-flex items-center gap-1">
                      <CalendarIcon className="size-3.5" />
                      {formatNewsDateShort(dto.publishmentDate)}
                    </span>
                  </>
                ) : null}
              </div>

              {isFilm ? (
                <div className="mt-6">
                  {filmSources.length > 1 ? (
                    <p className="text-muted-foreground mb-3 text-sm">
                      {NS.source.part_count(formatCkbDigits(filmSources.length))}
                    </p>
                  ) : null}
                  <VideoPlayerBlock
                    poster={poster}
                    source={{
                      url: mainFilmSource?.url ?? dto.sourceUrl,
                      externalUrl:
                        mainFilmSource?.externalUrl ?? dto.sourceExternalUrl,
                      embedUrl: mainFilmSource?.embedUrl ?? dto.sourceEmbedUrl,
                      fileFormat: dto.fileFormat,
                    }}
                  />
                </div>
              ) : clips.length > 0 ? (
                <div className="mt-6">
                  <p className="text-muted-foreground mb-3 text-sm">
                    {NS.clip.hero_label(formatCkbDigits(clips.length))}
                  </p>
                  <VideoPlayerBlock
                    poster={poster}
                    source={{
                      url: clips[0]?.url,
                      externalUrl: clips[0]?.externalUrl,
                      embedUrl: clips[0]?.embedUrl,
                      fileFormat: clips[0]?.fileFormat,
                    }}
                  />
                </div>
              ) : (
                <div className="bg-muted text-muted-foreground mt-6 flex aspect-video items-center justify-center rounded-xl">
                  <FilmIcon className="size-10 opacity-40" />
                </div>
              )}

              <div className="mt-8">
                <h1 className="text-4xl font-bold leading-tight">
                  {titleCkb || NS.dash}
                </h1>
                {titleKmr ? (
                  <p className="text-muted-foreground mt-2 text-xl font-medium leading-snug">
                    {titleKmr}
                  </p>
                ) : null}
              </div>

              <CreditsRow dto={dto} tab={bodyTab} />
              <ArticleBodyTabs dto={dto} tab={bodyTab} onTabChange={setBodyTab} />

              {!isFilm && clips.length > 0 ? (
                <section className={cn("mt-12", sectionDivider)}>
                  {dto.albumOfMemories ? (
                    <p className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
                      {NS.album.banner}
                    </p>
                  ) : null}
                  <h3 className="mb-4 text-sm font-semibold">
                    {NS.section.clips} ({formatCkbDigits(clips.length)})
                  </h3>
                  <div className="space-y-4">
                    {clips.map((clip) => (
                      <DetailClipRow key={clip.id ?? clip.clipNumber} clip={clip} />
                    ))}
                  </div>
                </section>
              ) : null}

              {isFilm && filmSources.length > 1 ? (
                <section className={cn("mt-12", sectionDivider)}>
                  <h3 className="mb-4 text-sm font-semibold">
                    {NS.section.source} ({formatCkbDigits(filmSources.length)})
                  </h3>
                  <div className="space-y-4">
                    {filmSources.map((source, index) => (
                      <DetailSourceRow
                        key={`source-${index}-${source.label ?? ""}`}
                        source={source}
                        index={index}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              {tagItems.length > 0 ? (
                <section className={cn("mt-12", sectionDivider)}>
                  <h3 className="text-muted-foreground mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
                    <TagIcon className="size-4" />
                    {NS.section.tags}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tagItems.map((item) => (
                      <TaxonomyChip
                        key={`t-${item.lang}-${item.v}`}
                        label={item.v}
                        lang={item.lang}
                        variant="tags"
                        href={`/dashboard/videos?tag=${encodeURIComponent(item.v)}`}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              {kwItems.length > 0 ? (
                <section
                  className={cn(
                    tagItems.length ? "mt-6" : "mt-12",
                    tagItems.length ? "" : sectionDivider,
                  )}
                >
                  <h3 className="text-muted-foreground mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
                    <HashtagIcon className="size-4" />
                    {NS.section.keywords}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {kwItems.map((item) => (
                      <TaxonomyChip
                        key={`k-${item.lang}-${item.v}`}
                        label={item.v}
                        lang={item.lang}
                        variant="keywords"
                        href={`/dashboard/videos?keyword=${encodeURIComponent(item.v)}`}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              {dto.publishmentDate ? (
                <p className="text-muted-foreground mt-8 text-xs">
                  {NS.section.publish}: {formatNewsDateLong(dto.publishmentDate)}
                </p>
              ) : null}
            </div>
          </main>
        </div>

        <VideoDeleteDialog
          open={deleteDlg}
          onOpenChange={setDeleteDlg}
          target={{
            id: dto.id,
            videoType: dto.videoType,
            albumOfMemories: dto.albumOfMemories,
            ckbCoverUrl: dto.ckbCoverUrl,
            durationSeconds: dto.durationSeconds,
            titleCkb,
          }}
          isPending={deleteMut.isPending}
          onConfirm={() => {
            if (!dto.id) return
            deleteMut.mutate(dto.id, {
              onSuccess: () => {
                toast.success(NS.toast.deleted)
                router.push("/dashboard/videos")
              },
            })
          }}
        />
      </div>
    </TooltipProvider>
  )
}
