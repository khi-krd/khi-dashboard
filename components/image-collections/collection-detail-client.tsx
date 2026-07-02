"use client"

import {
  ArrowDownTrayIcon,
  ArrowRightIcon,
  GlobeAltIcon,
  LinkIcon,
  PencilSquareIcon,
  PhotoIcon,
  ShareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import {
  CollectionBreadcrumbBar,
  dashboardCollectionsCrumbHref,
} from "@/components/image-collections/collection-breadcrumb"
import { CollectionDeleteDialog } from "@/components/image-collections/collection-delete-dialog"
import { CollectionDetailGallery } from "@/components/image-collections/collection-detail-gallery"
import { CollectionDetailSingle } from "@/components/image-collections/collection-detail-single"
import { CollectionDetailSkeleton } from "@/components/image-collections/collection-detail-skeleton"
import { CollectionDetailStory } from "@/components/image-collections/collection-detail-story"
import { CollectionErrorState } from "@/components/image-collections/collection-error-state"
import {
  CollectionLanguageChipRow,
} from "@/components/image-collections/collection-language-chip"
import { CollectionTypePill } from "@/components/image-collections/collection-type-pill"
import { NS, truncateTitle } from "@/components/image-collections/collections-strings"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import {
  useCollectionDetailQuery,
  useDeleteCollectionMutation,
} from "@/hooks/useImageCollections"
import { formatEnDigits, formatNewsDateShort } from "@/lib/intl-ckb"
import {
  formatFullTimestampKu,
  formatRelativeTimeKu,
} from "@/lib/news-relative-time"
import {
  isRichTextEmpty,
  sanitizeNewsBodyHtml,
} from "@/lib/sanitize-news-html"
import { formatBytes } from "@/lib/sound-format"
import { getCollectionCoverUrl } from "@/types/image-collections-ui"
import { cn } from "@/lib/utils"
import type { CollectionDto, CollectionType, Language } from "@/types/image-collections"

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

function typeContextLabel(c: CollectionDto) {
  const n = formatEnDigits(c.imageAlbum?.length ?? 0)
  if (c.collectionType === "SINGLE") return NS.type.context.single
  if (c.collectionType === "PHOTO_STORY") return NS.type.context.story(n)
  return NS.type.context.gallery(n)
}

export function CollectionDetailClient({ id }: { id: number }) {
  const router = useRouter()
  const { data: collection, isLoading, isError, refetch } =
    useCollectionDetailQuery(id)
  const deleteMut = useDeleteCollectionMutation()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [bodyTab, setBodyTab] = useState<Language>("CKB")
  const [storyLang, setStoryLang] = useState<Language>("CKB")
  const { copyToClipboard } = useCopyToClipboard()

  useEffect(() => {
    const langs = collection?.contentLanguages ?? []
    if (langs.includes("CKB")) {
      setBodyTab("CKB")
      setStoryLang("CKB")
    } else if (langs[0]) {
      setBodyTab(langs[0])
      setStoryLang(langs[0])
    }
  }, [collection?.id, collection?.contentLanguages])

  if (isLoading) return <CollectionDetailSkeleton />
  if (isError) return <CollectionErrorState onRetry={() => void refetch()} />
  if (!collection?.id) {
    return (
      <div dir="rtl" className="flex flex-col items-center py-20">
        <h1 className="text-lg font-medium">{NS.not_found.title}</h1>
        <Link
          href="/dashboard/image-collections"
          className={buttonVariants({ variant: "outline" })}
        >
          {NS.not_found.cta}
        </Link>
      </div>
    )
  }

  return (
    <CollectionDetailLoaded
      collection={collection}
      bodyTab={bodyTab}
      onBodyTabChange={setBodyTab}
      storyLang={storyLang}
      onStoryLangChange={setStoryLang}
      deleteOpen={deleteOpen}
      onDeleteOpenChange={setDeleteOpen}
      deleteMut={deleteMut}
      onBack={() => router.push("/dashboard/image-collections")}
      onEdit={() => router.push(`/dashboard/image-collections/${collection.id}/edit`)}
      onCopy={() => {
        const url = typeof window !== "undefined" ? window.location.href : ""
        copyToClipboard(url)
        toast(NS.toast.copied)
      }}
    />
  )
}

function CollectionDetailLoaded({
  collection,
  bodyTab,
  onBodyTabChange,
  storyLang,
  onStoryLangChange,
  deleteOpen,
  onDeleteOpenChange,
  deleteMut,
  onBack,
  onEdit,
  onCopy,
}: {
  collection: CollectionDto
  bodyTab: Language
  onBodyTabChange: (l: Language) => void
  storyLang: Language
  onStoryLangChange: (l: Language) => void
  deleteOpen: boolean
  onDeleteOpenChange: (v: boolean) => void
  deleteMut: ReturnType<typeof useDeleteCollectionMutation>
  onBack: () => void
  onEdit: () => void
  onCopy: () => void
}) {
  const cover =
    collection.ckbCoverUrl?.trim() ||
    collection.kmrCoverUrl?.trim() ||
    getCollectionCoverUrl(collection)
  const langs = collection.contentLanguages ?? []
  const hasCkb = langs.includes("CKB")
  const hasKmr = langs.includes("KMR")
  const content =
    bodyTab === "CKB" ? collection.ckbContent : collection.kmrContent
  const desc = content?.description ?? ""
  const sanitizedDesc = useMemo(
    () => sanitizeNewsBodyHtml(desc.trim() ? desc : ""),
    [desc],
  )

  const totalBytes = (collection.imageAlbum ?? []).reduce(
    (sum, it) => sum + (it.fileSizeBytes ?? 0),
    0,
  )

  const imageCount = collection.imageAlbum?.length ?? 0
  const topicCkb = collection.topicNameCkb?.trim()
  const collectedBy = collection.ckbContent?.collectedBy?.trim()
  const location = collection.ckbContent?.location?.trim()
  const publishLabel = collection.publishmentDate
    ? formatNewsDateShort(collection.publishmentDate)
    : null

  function RelativeDate({ iso }: { iso: string }) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <dd className="font-mono cursor-default">{formatRelativeTimeKu(iso)}</dd>
          }
        />
        <TooltipContent>{formatFullTimestampKu(iso)}</TooltipContent>
      </Tooltip>
    )
  }

  function TaxonomyChip({
    label,
    lang,
    dashed,
  }: {
    label: string
    lang: "ckb" | "kmr"
    dashed?: boolean
  }) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs",
          dashed
            ? "border border-dashed border-border text-muted-foreground"
            : "border border-border bg-muted text-foreground",
        )}
      >
        {label}
        <span className="text-muted-foreground/70 text-[10px] uppercase">{lang}</span>
      </span>
    )
  }

  return (
    <div className="flex flex-col" dir="ltr">
      <div className="border-border/60 bg-background/95 sticky top-0 z-30 border-b backdrop-blur">
        <div
          dir="rtl"
          className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6"
        >
          <CollectionBreadcrumbBar
            className="min-w-0 flex-1"
            segments={[
              { label: NS.breadcrumb.dashboard, href: dashboardCollectionsCrumbHref() },
              { label: NS.breadcrumb.collections, href: "/dashboard/image-collections" },
              {
                label: truncateTitle(collection.ckbContent?.title ?? "", 48),
              },
            ]}
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onBack}>
              <ArrowRightIcon className="size-4 rtl:rotate-180" />
              {NS.action.back}
            </Button>
            <Button type="button" variant="ghost" size="sm" disabled>
              <GlobeAltIcon className="size-4" />
              {NS.action.view_on_site}
            </Button>
            <Button type="button" variant="default" size="sm" onClick={onEdit}>
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

      <TooltipProvider>
      <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-10">
        <aside
          dir="rtl"
          className="border-border bg-card space-y-6 self-start rounded-xl border p-6 text-sm lg:sticky lg:top-20"
        >
          <CollectionTypePill collectionType={collection.collectionType} className="text-sm" />
          <p className="text-muted-foreground text-xs">{typeContextLabel(collection)}</p>

          <div className={sectionDivider}>
            <h3 className="mb-2 font-medium">{NS.section.topic}</h3>
            {collection.topicId ? (
              <Link
                href={`/dashboard/image-collections?topic=${collection.topicId}`}
                className="hover:text-primary block"
              >
                <span>{collection.topicNameCkb ?? NS.dash}</span>
                {collection.topicNameKmr ? (
                  <span className="text-muted-foreground mt-0.5 block text-xs">
                    {collection.topicNameKmr}
                  </span>
                ) : null}
              </Link>
            ) : (
              <span className="text-muted-foreground">{NS.topic.empty}</span>
            )}
          </div>

          <div className={sectionDivider}>
            <h3 className="mb-3 font-medium">{NS.section.credits}</h3>
            <dl className="space-y-2 text-xs">
              <div>
                <dt className="text-muted-foreground">{NS.credits.collected_by}</dt>
                <dd>{collection.ckbContent?.collectedBy?.trim() || NS.dash}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{NS.credits.location}</dt>
                <dd>{collection.ckbContent?.location?.trim() || NS.dash}</dd>
              </div>
            </dl>
          </div>

          <div className={sectionDivider}>
            <h3 className="mb-3 font-medium">{NS.section.album_summary}</h3>
            <dl className="space-y-2 text-xs">
              <div>
                <dt className="text-muted-foreground">{NS.summary.image_count}</dt>
                <dd>{formatEnDigits(collection.imageAlbum?.length ?? 0)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{NS.summary.total_size}</dt>
                <dd>{formatBytes(totalBytes)}</dd>
              </div>
            </dl>
          </div>

          <div className={sectionDivider}>
            <h3 className="mb-2 font-medium">{NS.section.languages}</h3>
            <CollectionLanguageChipRow langs={langs} />
          </div>

          <div className={sectionDivider}>
            <h3 className="mb-3 font-medium">{NS.section.dates}</h3>
            <dl className="space-y-2 text-xs">
              {collection.publishmentDate ? (
                <div>
                  <dt className="text-muted-foreground">{NS.section.publish}</dt>
                  <dd>{collection.publishmentDate}</dd>
                </div>
              ) : null}
              {collection.createdAt ? (
                <div>
                  <dt className="text-muted-foreground">{NS.system.created_at}</dt>
                  <RelativeDate iso={collection.createdAt} />
                </div>
              ) : null}
              {collection.updatedAt ? (
                <div>
                  <dt className="text-muted-foreground">{NS.system.updated_at}</dt>
                  <RelativeDate iso={collection.updatedAt} />
                </div>
              ) : null}
              <div>
                <dt className="text-muted-foreground">{NS.system.id}</dt>
                <dd className="font-mono">#{collection.id}</dd>
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
                  const urls = (collection.imageAlbum ?? [])
                    .map((it) => it.imageUrl?.trim() || it.externalUrl?.trim())
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
          <div className="bg-muted relative mb-6 aspect-[4/3] w-full overflow-hidden rounded-xl">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cover} alt="" className="size-full object-cover" />
            ) : (
              <div className="text-muted-foreground flex size-full flex-col items-center justify-center gap-2">
                <PhotoIcon className="size-8 text-muted-foreground/40" aria-hidden />
                <span className="text-sm">{NS.empty.no_cover}</span>
              </div>
            )}
          </div>

          <h1 className="text-4xl leading-tight font-bold">
            {collection.ckbContent?.title?.trim() || NS.dash}
          </h1>
          {collection.kmrContent?.title?.trim() ? (
            <p className="text-muted-foreground mt-2 text-xl font-medium leading-snug">
              {collection.kmrContent.title}
            </p>
          ) : null}

          <div className="text-muted-foreground mt-2 flex flex-wrap items-center text-xs">
            <CollectionTypePill
              collectionType={collection.collectionType}
              className="w-auto"
            />
            {topicCkb ? (
              <>
                <MetaDot />
                <span>{topicCkb}</span>
              </>
            ) : null}
            {collectedBy ? (
              <>
                <MetaDot />
                <span>📷 {collectedBy}</span>
              </>
            ) : null}
            {location ? (
              <>
                <MetaDot />
                <span>📍 {location}</span>
              </>
            ) : null}
            {publishLabel ? (
              <>
                <MetaDot />
                <span>📅 {publishLabel}</span>
              </>
            ) : null}
            {imageCount > 0 ? (
              <>
                <MetaDot />
                <span>{formatEnDigits(imageCount)} وێنە</span>
              </>
            ) : null}
          </div>

          <div className={cn(sectionDivider, "mt-6")}>
            {hasCkb && hasKmr ? (
              <div className="mb-4 flex gap-4 border-b border-border">
                {(["CKB", "KMR"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => onBodyTabChange(l)}
                    className={cn(
                      "border-b-2 pb-2 text-sm font-medium transition-colors",
                      bodyTab === l
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground",
                    )}
                  >
                    {l === "CKB" ? NS.lang.ckb : NS.lang.kmr}
                  </button>
                ))}
              </div>
            ) : null}
            {isRichTextEmpty(desc) ? (
              <p className="text-muted-foreground mt-4 text-sm italic">
                {NS.empty.no_body}
              </p>
            ) : (
              <div
                className="prose prose-base mt-4 max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: toProseHtml(desc) }}
              />
            )}
          </div>

          <section className={cn(sectionDivider, "mt-10")}>
            <CollectionAlbumRenderer
              collectionType={collection.collectionType}
              collection={collection}
              storyLang={storyLang}
              onStoryLangChange={onStoryLangChange}
              contentLanguages={langs}
              bodyTab={bodyTab}
            />
          </section>

          <section className={cn(sectionDivider, "mt-10")}>
            <h2 className="mb-3 text-sm font-medium">{NS.section.tags}</h2>
            <div className="flex flex-wrap gap-2">
              {[...(collection.tagsCkb ?? []), ...(collection.tagsKmr ?? [])].length ===
              0 ? (
                <span className="text-muted-foreground text-sm">{NS.dash}</span>
              ) : (
                <>
                  {collection.tagsCkb?.map((t) => (
                    <TaxonomyChip key={`ckb-${t}`} label={t} lang="ckb" />
                  ))}
                  {collection.tagsKmr?.map((t) => (
                    <TaxonomyChip key={`kmr-${t}`} label={t} lang="kmr" />
                  ))}
                </>
              )}
            </div>
            <h2 className="mb-3 mt-6 text-sm font-medium">{NS.section.keywords}</h2>
            <div className="flex flex-wrap gap-2">
              {[...(collection.keywordsCkb ?? []), ...(collection.keywordsKmr ?? [])]
                .length === 0 ? (
                <span className="text-muted-foreground text-sm">{NS.dash}</span>
              ) : (
                <>
                  {collection.keywordsCkb?.map((t) => (
                    <TaxonomyChip key={`kckb-${t}`} label={t} lang="ckb" dashed />
                  ))}
                  {collection.keywordsKmr?.map((t) => (
                    <TaxonomyChip key={`kkmr-${t}`} label={t} lang="kmr" dashed />
                  ))}
                </>
              )}
            </div>
          </section>
        </article>
      </div>
      </TooltipProvider>

      <CollectionDeleteDialog
        open={deleteOpen}
        onOpenChange={onDeleteOpenChange}
        target={{
          id: collection.id,
          collectionType: collection.collectionType,
          ckbCoverUrl: collection.ckbCoverUrl,
          imageAlbum: collection.imageAlbum,
          titleCkb: collection.ckbContent?.title,
        }}
        isPending={deleteMut.isPending}
        onConfirm={() => {
          if (collection.id == null) return
          deleteMut.mutate(collection.id, {
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

function CollectionAlbumRenderer({
  collectionType,
  collection,
  storyLang,
  onStoryLangChange,
  contentLanguages,
  bodyTab,
}: {
  collectionType: CollectionType
  collection: CollectionDto
  storyLang: Language
  onStoryLangChange: (l: Language) => void
  contentLanguages: Language[]
  bodyTab: Language
}) {
  if (collectionType === "SINGLE") {
    return <CollectionDetailSingle collection={collection} activeLang={bodyTab} />
  }
  if (collectionType === "PHOTO_STORY") {
    return (
      <CollectionDetailStory
        collection={collection}
        storyLang={storyLang}
        onStoryLangChange={onStoryLangChange}
        contentLanguages={contentLanguages}
      />
    )
  }
  return <CollectionDetailGallery collection={collection} activeLang={bodyTab} />
}
