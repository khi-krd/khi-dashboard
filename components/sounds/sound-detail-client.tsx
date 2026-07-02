"use client"

import {
  ArrowDownTrayIcon,
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
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import {
  SoundBreadcrumbBar,
  dashboardSoundsCrumbHref,
} from "@/components/sounds/sound-breadcrumb"
import { SoundDeleteDialog } from "@/components/sounds/sound-delete-dialog"
import { SoundDetailFilesList } from "@/components/sounds/sound-detail-files-list"
import { SoundDetailSkeleton } from "@/components/sounds/sound-detail-skeleton"
import { SoundLanguageChipRow } from "@/components/sounds/sound-language-chip"
import { SoundPlayerBar } from "@/components/sounds/sound-player"
import { SoundStatePill } from "@/components/sounds/sound-state-pill"
import { SoundsErrorState } from "@/components/sounds/sound-error-state"
import { NS, truncateTitle } from "@/components/sounds/sounds-strings"
import { Button, buttonVariants } from "@/components/ui/button"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import {
  useDeleteSoundMutation,
  useSoundDetailQuery,
} from "@/hooks/useSounds"
import {
  formatFullTimestampKu,
  formatRelativeTimeKu,
} from "@/lib/news-relative-time"
import {
  isRichTextEmpty,
  sanitizeNewsBodyHtml,
} from "@/lib/sanitize-news-html"
import { formatBytes, formatDuration } from "@/lib/sound-format"
import { formatEnDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type { Language, SoundDto, SoundFileDto } from "@/types/sounds"

const sectionDivider = "border-t border-border/60 pt-6"

function MetaDot() {
  return <span className="mx-2 text-muted-foreground/60">·</span>
}

function toProseHtml(raw: string) {
  const t = raw.trim()
  if (!t) return ""
  const looksLikeHtml = /<[a-z][\s\S]*>/i.test(t)
  const html = looksLikeHtml ? t : `<p>${t}</p>`
  return sanitizeNewsBodyHtml(html)
}

export function SoundDetailClient({ soundId }: { soundId: number }) {
  const router = useRouter()
  const { data: sound, isLoading, isError, refetch } = useSoundDetailQuery(soundId)
  const deleteMut = useDeleteSoundMutation()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [tab, setTab] = useState<Language>("CKB")
  const [activeFile, setActiveFile] = useState<SoundFileDto | null>(null)
  const { copyToClipboard } = useCopyToClipboard()

  useEffect(() => {
    if (!sound?.files?.length) return
    setActiveFile(sound.files[0])
  }, [sound])

  if (isLoading) return <SoundDetailSkeleton />
  if (isError) return <SoundsErrorState onRetry={() => void refetch()} />
  if (!sound?.id) {
    return (
      <div dir="rtl" className="flex flex-col items-center py-20">
        <h1 className="text-lg font-medium">{NS.not_found.title}</h1>
        <Link href="/dashboard/sounds" className={buttonVariants({ variant: "outline" })}>
          {NS.not_found.cta}
        </Link>
      </div>
    )
  }

  return (
    <SoundDetailLoaded
      sound={sound}
      tab={tab}
      onTabChange={setTab}
      activeFile={activeFile}
      onSelectFile={setActiveFile}
      deleteOpen={deleteOpen}
      onDeleteOpenChange={setDeleteOpen}
      deleteMut={deleteMut}
      onBack={() => router.push("/dashboard/sounds")}
      onEdit={() => router.push(`/dashboard/sounds/${sound.id}/edit`)}
      onCopy={() => {
        const url = typeof window !== "undefined" ? window.location.href : ""
        copyToClipboard(url)
        toast(NS.toast.copied)
      }}
    />
  )
}

function SoundDetailLoaded({
  sound,
  tab,
  onTabChange,
  activeFile,
  onSelectFile,
  deleteOpen,
  onDeleteOpenChange,
  deleteMut,
  onBack,
  onEdit,
  onCopy,
}: {
  sound: SoundDto
  tab: Language
  onTabChange: (l: Language) => void
  activeFile: SoundFileDto | null
  onSelectFile: (f: SoundFileDto) => void
  deleteOpen: boolean
  onDeleteOpenChange: (v: boolean) => void
  deleteMut: ReturnType<typeof useDeleteSoundMutation>
  onBack: () => void
  onEdit: () => void
  onCopy: () => void
}) {
  const file = activeFile ?? sound.files?.[0] ?? null
  const cover = sound.ckbCoverUrl?.trim()
  const langs = sound.contentLanguages ?? []
  const hasCkb = langs.includes("CKB")
  const hasKmr = langs.includes("KMR")

  const descCkb = sound.ckbContent?.description ?? ""
  const descKmr = sound.kmrContent?.description ?? ""
  const activeDesc = tab === "CKB" ? descCkb : descKmr
  const sanitizedDesc = useMemo(
    () => sanitizeNewsBodyHtml(activeDesc.trim() ? activeDesc : ""),
    [activeDesc],
  )

  const totalDurationSeconds = (sound.files ?? []).reduce(
    (acc, f) => acc + (f.durationSeconds ?? 0),
    0,
  )
  const totalSizeBytes = (sound.files ?? []).reduce(
    (acc, f) => acc + (f.sizeBytes ?? 0),
    0,
  )

  const statusParts = [
    sound.soundType,
    totalDurationSeconds > 0 ? formatDuration(totalDurationSeconds) : null,
    sound.featured ? NS.col.featured : null,
  ].filter(Boolean)

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
            <SoundBreadcrumbBar
              className="hidden sm:flex"
              segments={[
                { label: NS.breadcrumb.dashboard, href: dashboardSoundsCrumbHref() },
                { label: NS.breadcrumb.sounds, href: "/dashboard/sounds" },
                {
                  label: truncateTitle(sound.ckbContent?.title ?? "", 48),
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
          <SoundStatePill trackState={sound.trackState} size="large" />
          <p className="text-muted-foreground text-xs">
            {sound.trackState === "SINGLE"
              ? NS.state.context.single
              : NS.state.context.multi(
                  formatEnDigits(sound.files?.length ?? 0),
                )}
          </p>

          <div className={sectionDivider}>
            <h3 className="mb-2 font-medium">{NS.section.topic}</h3>
            {sound.topicId ? (
              <Link
                href={`/dashboard/sounds?topic=${sound.topicId}`}
                className="hover:text-primary block"
              >
                <span>{sound.topicNameCkb ?? NS.dash}</span>
                {sound.topicNameKmr ? (
                  <span className="text-muted-foreground mt-0.5 block text-xs">
                    {sound.topicNameKmr}
                  </span>
                ) : null}
              </Link>
            ) : (
              <span className="text-muted-foreground">{NS.topic.empty}</span>
            )}
          </div>

          <div className={sectionDivider}>
            <h3 className="mb-2 font-medium">{NS.section.type}</h3>
            {sound.soundType ? (
              <Link
                href={`/dashboard/sounds`}
                className="text-foreground hover:text-primary"
              >
                {sound.soundType}
              </Link>
            ) : (
              NS.dash
            )}
          </div>

          {sound.featured ? (
            <div className={sectionDivider}>
              <h3 className="mb-2 font-medium">{NS.col.featured}</h3>
              <p className="text-muted-foreground text-xs">
                {NS.col.featured_order}:{" "}
                {sound.featuredOrder != null
                  ? formatEnDigits(sound.featuredOrder)
                  : NS.dash}
              </p>
            </div>
          ) : null}

          <div className={sectionDivider}>
            <h3 className="mb-3 font-medium">{NS.section.technical}</h3>
            <dl className="space-y-2 text-xs">
              <div>
                <dt className="text-muted-foreground">{NS.total.duration}</dt>
                <dd>{formatDuration(totalDurationSeconds)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{NS.total.size}</dt>
                <dd>{formatBytes(totalSizeBytes)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{NS.total.files}</dt>
                <dd>{formatEnDigits(sound.files?.length ?? 0)}</dd>
              </div>
            </dl>
          </div>

          <div className={sectionDivider}>
            <h3 className="mb-2 font-medium">{NS.section.languages}</h3>
            <SoundLanguageChipRow langs={langs} />
          </div>

          <div className={sectionDivider}>
            <h3 className="mb-3 font-medium">{NS.section.dates}</h3>
            <dl className="space-y-2 text-xs">
              {sound.createdAt ? (
                <div>
                  <dt className="text-muted-foreground">{NS.system.created_at}</dt>
                  <dd title={formatFullTimestampKu(sound.createdAt)}>
                    {formatRelativeTimeKu(sound.createdAt)}
                  </dd>
                </div>
              ) : null}
              {sound.updatedAt ? (
                <div>
                  <dt className="text-muted-foreground">{NS.system.updated_at}</dt>
                  <dd title={formatFullTimestampKu(sound.updatedAt)}>
                    {formatRelativeTimeKu(sound.updatedAt)}
                  </dd>
                </div>
              ) : null}
              <div>
                <dt className="text-muted-foreground">{NS.system.id}</dt>
                <dd className="font-mono">#{sound.id}</dd>
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
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  const urls = (sound.files ?? [])
                    .map((f) => f.fileUrl?.trim())
                    .filter(Boolean)
                  if (urls[0]) window.open(urls[0], "_blank")
                }}
              >
                <ArrowDownTrayIcon className="size-4" />
                {NS.action.download_all}
              </Button>
            </div>
          </div>
        </aside>

        <article
          dir="rtl"
          className="mx-auto w-full max-w-[860px] px-6 pb-12 pt-8"
        >
          <div className="text-muted-foreground mb-6 flex flex-wrap items-center text-xs">
            <SoundStatePill trackState={sound.trackState} className="w-auto" />
            {statusParts.map((p, i) => (
              <span key={i} className="inline-flex items-center">
                <MetaDot />
                {p}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="bg-muted relative mx-auto size-[280px] shrink-0 overflow-hidden rounded-lg md:mx-0">
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
                {sound.ckbContent?.title?.trim() || NS.dash}
              </h1>
              {sound.kmrContent?.title?.trim() ? (
                <p className="text-muted-foreground mt-2 text-xl font-medium leading-snug">
                  {sound.kmrContent.title}
                </p>
              ) : null}
            </div>
          </div>

          {file && sound.id ? (
            <SoundPlayerBar
              className="mt-6"
              trackId={sound.id}
              file={file}
              title={file.title?.trim() || sound.ckbContent?.title || ""}
              subtitle={sound.soundType ?? undefined}
            />
          ) : null}

          <SoundDetailFilesList
            sound={sound}
            activeFileId={file?.id}
            onSelectFile={onSelectFile}
          />

          <div className={cn(sectionDivider, "mt-10")}>
            {hasCkb && hasKmr ? (
              <div className="mb-4 flex gap-4 border-b border-border">
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
            {isRichTextEmpty(activeDesc) ? (
              <p className="text-muted-foreground mt-4 text-sm italic">
                {NS.empty.no_body}
              </p>
            ) : (
              <div
                className="prose prose-base mt-4 max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: toProseHtml(activeDesc) }}
              />
            )}
          </div>

          {(sound.attachments?.length ?? 0) > 0 ? (
            <section className={cn(sectionDivider, "mt-10")}>
              <h2 className="mb-4 text-sm font-medium">
                {NS.section.attachments} ({sound.attachments!.length})
              </h2>
              <ul className="space-y-2">
                {sound.attachments!.map((att, i) => (
                  <li
                    key={att.id ?? i}
                    className="border-border/60 flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {att.title?.trim() || NS.attachment.no_title}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {att.attachmentType} · {formatBytes(att.sizeBytes)}
                      </p>
                    </div>
                    {att.fileUrl ? (
                      <a
                        href={att.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={buttonVariants({ variant: "ghost", size: "sm" })}
                      >
                        {NS.action.view}
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className={cn(sectionDivider, "mt-10")}>
            <h2 className="mb-3 text-sm font-medium">{NS.section.tags}</h2>
            <div className="flex flex-wrap gap-2">
              {[...(sound.tagsCkb ?? []), ...(sound.tagsKmr ?? [])].length ===
              0 ? (
                <span className="text-muted-foreground text-sm">{NS.dash}</span>
              ) : (
                <>
                  {sound.tagsCkb?.map((t) => (
                    <span
                      key={`ckb-${t}`}
                      className="border-border bg-muted inline-flex rounded-md border px-2 py-0.5 text-xs"
                    >
                      {t}
                      <sup className="ms-1 text-[10px] opacity-60">ckb</sup>
                    </span>
                  ))}
                  {sound.tagsKmr?.map((t) => (
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
              {[...(sound.keywordsCkb ?? []), ...(sound.keywordsKmr ?? [])]
                .length === 0 ? (
                <span className="text-muted-foreground text-sm">{NS.dash}</span>
              ) : (
                <>
                  {sound.keywordsCkb?.map((t) => (
                    <span
                      key={`kckb-${t}`}
                      className="text-muted-foreground inline-flex rounded-md border border-dashed border-border px-2 py-0.5 text-xs"
                    >
                      {t}
                      <sup className="ms-1 text-[10px] opacity-60">ckb</sup>
                    </span>
                  ))}
                  {sound.keywordsKmr?.map((t) => (
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

      <SoundDeleteDialog
        open={deleteOpen}
        onOpenChange={onDeleteOpenChange}
        target={{
          id: sound.id,
          trackState: sound.trackState,
          ckbCoverUrl: sound.ckbCoverUrl,
          files: sound.files,
          titleCkb: sound.ckbContent?.title,
        }}
        isPending={deleteMut.isPending}
        onConfirm={() => {
          if (sound.id == null) return
          deleteMut.mutate(sound.id, {
            onSuccess: () => {
              toast(NS.toast.deleted)
              onBack()
            },
          })
        }}
      />
    </div>
  )
}
