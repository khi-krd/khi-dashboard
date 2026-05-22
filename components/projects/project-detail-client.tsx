"use client"

import {
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  CalendarIcon,
  HashtagIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PencilSquareIcon,
  PhotoIcon,
  PuzzlePieceIcon,
  ShareIcon,
  TagIcon,
  TrashIcon,
  UserIcon,
} from "@heroicons/react/24/outline"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Fragment, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

import {
  ProjectBreadcrumbBar,
  dashboardProjectsCrumbHref,
} from "@/components/projects/project-breadcrumb"
import { ProjectDeleteDialog } from "@/components/projects/project-delete-dialog"
import { ProjectDetailSkeleton } from "@/components/projects/project-detail-skeleton"
import { ProjectLanguageChipRow } from "@/components/projects/project-language-chip"
import { projectUrlPublic } from "@/components/projects/project-media-helpers"
import { ProjectStatusPillSidebar } from "@/components/projects/project-status-pill"
import { ProjectsErrorState } from "@/components/projects/projects-error-state"
import { NS, truncateTitle } from "@/components/projects/projects-strings"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import {
  useDeleteProjectMutation,
  useProjectDetailQuery,
} from "@/hooks/useProjects"
import { mergeProjectsDerivedTypes } from "@/lib/projects-derived-cache"
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
import type { Language, ProjectDto } from "@/types/projects"
import { useQueryClient } from "@tanstack/react-query"

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
  variant: "contents" | "tags" | "keywords"
  href: string
}) {
  const styles = {
    contents:
      "bg-primary/5 text-primary border border-primary/15",
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

function ArticleBodyTabs({ dto }: { dto: ProjectDto }) {
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

  if (!multi) {
    const html = hasCkb ? descCkb : descKmr
    if (isRichTextEmpty(html)) {
      return <p className="text-muted-foreground mt-6 text-sm italic">{NS.empty.no_body}</p>
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
              onClick={() => setTab(code)}
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
        <p className="text-muted-foreground mt-6 text-sm italic">{NS.empty.no_body}</p>
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

const sectionDivider = "border-t border-border/60 pt-6"

export function ProjectDetailClient({ projectId }: { projectId: number }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const q = useProjectDetailQuery(projectId)
  const [deleteDlg, setDeleteDlg] = useState(false)
  const deleteMut = useDeleteProjectMutation()
  const { copyToClipboard } = useCopyToClipboard({
    onCopy: () => toast.success(NS.toast.copied),
  })

  const dto = q.data?.success === true ? q.data.data : undefined

  useEffect(() => {
    if (dto) mergeProjectsDerivedTypes(queryClient, [dto])
  }, [dto, queryClient])

  if (q.isLoading) return <ProjectDetailSkeleton />

  if (q.isError) {
    return (
      <div dir="rtl" className="px-4 pt-10">
        <ProjectsErrorState onRetry={() => void q.refetch()} />
      </div>
    )
  }

  if (!dto?.id) {
    return (
      <div className="flex flex-col gap-8 px-4 pt-6" dir="rtl">
        <ProjectBreadcrumbBar
          segments={[
            { label: NS.breadcrumb.dashboard, href: dashboardProjectsCrumbHref() },
            { label: NS.breadcrumb.projects, href: "/dashboard/projects" },
            { label: NS.not_found.title },
          ]}
        />
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <MagnifyingGlassIcon className="text-muted-foreground size-14 opacity-50" />
          <p className="text-lg font-semibold">{NS.not_found.title}</p>
          <Link
            href="/dashboard/projects"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-md")}
          >
            <ArrowRightIcon className="me-2 size-4 rtl:rotate-180" />
            {NS.not_found.cta}
          </Link>
        </div>
      </div>
    )
  }

  const titleCkb = dto.ckbContent?.title?.trim() ?? ""
  const titleKmr = dto.kmrContent?.title?.trim() ?? ""
  const publicUrl = projectUrlPublic(dto.id)

  const tagItems = [
    ...(dto.tagsCkb ?? []).map((t) => ({ lang: "ckb" as const, v: t })),
    ...(dto.tagsKmr ?? []).map((t) => ({ lang: "kmr" as const, v: t })),
  ]
  const kwItems = [
    ...(dto.keywordsCkb ?? []).map((t) => ({ lang: "ckb" as const, v: t })),
    ...(dto.keywordsKmr ?? []).map((t) => ({ lang: "kmr" as const, v: t })),
  ]

  const locationCkb = dto.ckbContent?.location?.trim()
  const typeCkb = dto.projectTypeCkb?.trim()
  const typeKmr = dto.projectTypeKmr?.trim()

  return (
    <TooltipProvider delay={250}>
      <div className="min-h-[50vh]" dir="rtl">
        <header className="bg-background/95 supports-backdrop-filter:backdrop-blur border-border sticky top-0 z-30 border-b">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
            <ProjectBreadcrumbBar
              className="min-w-0 flex-1"
              segments={[
                { label: NS.breadcrumb.dashboard, href: dashboardProjectsCrumbHref() },
                { label: NS.breadcrumb.projects, href: "/dashboard/projects" },
                { label: truncateTitle(titleCkb || titleKmr, 40) },
              ]}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => router.push("/dashboard/projects")}>
                <ArrowRightIcon className="size-4 rtl:rotate-180" />
                {NS.action.back}
              </Button>
              {publicUrl ? (
                <Link
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5 rounded-md")}
                >
                  <ArrowTopRightOnSquareIcon className="size-4 rtl:rotate-180" />
                  {NS.action.view_on_site}
                </Link>
              ) : null}
              <Link
                href={`/dashboard/projects/${dto.id}/edit`}
                className={cn(buttonVariants({ variant: "default", size: "sm" }), "gap-1.5 rounded-md")}
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
                <ProjectStatusPillSidebar status={dto.status} />
                {dto.projectDate ? (
                  <p className="text-muted-foreground text-center text-xs">
                    {dto.status === "COMPLETED" ? NS.status.completed : NS.status.ongoing}{" "}
                    لە {formatNewsDateLong(dto.projectDate)}
                  </p>
                ) : null}
              </section>

              {(typeCkb || typeKmr) ? (
                <section className={cn(sectionDivider, "space-y-2")}>
                  <h4 className="text-muted-foreground text-xs uppercase tracking-wide">
                    {NS.section.type}
                  </h4>
                  <p className="text-foreground">{typeCkb || NS.dash}</p>
                  {typeKmr ? (
                    <p className="text-muted-foreground text-xs">{typeKmr}</p>
                  ) : null}
                </section>
              ) : null}

              {(locationCkb || dto.kmrContent?.location?.trim()) ? (
                <section className={cn(sectionDivider, "space-y-2")}>
                  <h4 className="text-muted-foreground text-xs uppercase tracking-wide">
                    {NS.section.location}
                  </h4>
                  {locationCkb ? (
                    <p className="flex items-start gap-1.5">
                      <MapPinIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                      {locationCkb}
                    </p>
                  ) : null}
                  {dto.kmrContent?.location?.trim() ? (
                    <p className="text-muted-foreground text-xs">
                      {dto.kmrContent.location}
                    </p>
                  ) : null}
                </section>
              ) : null}

              <section className={cn(sectionDivider, "space-y-2")}>
                <h4 className="text-muted-foreground text-xs uppercase tracking-wide">
                  {NS.section.languages}
                </h4>
                <ProjectLanguageChipRow langs={dto.contentLanguages ?? []} />
              </section>

              <section className={cn(sectionDivider, "space-y-3")}>
                <h4 className="text-muted-foreground text-xs uppercase tracking-wide">
                  {NS.section.dates}
                </h4>
                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">{NS.system.project_date}</dt>
                    <dd className="font-mono">
                      {dto.projectDate
                        ? formatNewsDateShort(dto.projectDate)
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
                              <button type="button" className="underline decoration-dashed">
                                {formatRelativeTimeKu(dto.createdAt)}
                              </button>
                            }
                          />
                          <TooltipContent>{formatFullTimestampKu(dto.createdAt)}</TooltipContent>
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
                              <button type="button" className="underline decoration-dashed">
                                {formatRelativeTimeKu(dto.updatedAt)}
                              </button>
                            }
                          />
                          <TooltipContent>{formatFullTimestampKu(dto.updatedAt)}</TooltipContent>
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
                      {NS.system.created_by}
                    </span>
                    <span>{dto.createdBy}</span>
                  </div>
                ) : null}
                {dto.updatedBy ? (
                  <div className="flex justify-between gap-2">
                    <span className="text-muted-foreground">{NS.system.updated_by}</span>
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
                      void navigator.share({ title: titleCkb, url: publicUrl || undefined }).catch(() => {
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
                <span className="text-foreground font-medium">
                  {dto.status === "COMPLETED" ? NS.status.completed : NS.status.ongoing}
                </span>
                {typeCkb ? (
                  <>
                    <MetaDot />
                    <span>
                      {typeCkb}
                      {typeKmr ? (
                        <span className="text-muted-foreground/70 ms-1 text-[10px]">
                          ‹› {typeKmr}
                        </span>
                      ) : null}
                    </span>
                  </>
                ) : null}
                {locationCkb ? (
                  <>
                    <MetaDot />
                    <span className="inline-flex items-center gap-1">
                      <MapPinIcon className="size-3.5" />
                      {locationCkb}
                    </span>
                  </>
                ) : null}
                {dto.projectDate ? (
                  <>
                    <MetaDot />
                    <span className="inline-flex items-center gap-1">
                      <CalendarIcon className="size-3.5" />
                      {formatNewsDateShort(dto.projectDate)}
                    </span>
                  </>
                ) : null}
              </div>

              <div className="relative mt-6 aspect-[21/9] overflow-hidden rounded-xl">
                {dto.coverUrl ? (
                  <>
                    <Image
                      src={dto.coverUrl}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized={dto.coverUrl.startsWith("http")}
                      priority
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                  </>
                ) : (
                  <div className="bg-muted text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
                    <PhotoIcon className="size-10 opacity-40" />
                    <span className="text-sm">{NS.empty.no_cover}</span>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <h1 className="text-4xl font-bold leading-tight">{titleCkb || NS.dash}</h1>
                {titleKmr ? (
                  <p className="text-muted-foreground mt-2 text-xl font-medium leading-snug">
                    {titleKmr}
                  </p>
                ) : null}
              </div>

              <ArticleBodyTabs dto={dto} />

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
                        href={`/dashboard/projects?tag=${encodeURIComponent(item.v)}`}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              {kwItems.length > 0 ? (
                <section className="mt-6">
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
                        href={`/dashboard/projects?keyword=${encodeURIComponent(item.v)}`}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

            </div>
          </main>

        </div>

        <ProjectDeleteDialog
          open={deleteDlg}
          onOpenChange={setDeleteDlg}
          target={{
            id: dto.id,
            coverUrl: dto.coverUrl,
            status: dto.status,
            titleCkb,
          }}
          isPending={deleteMut.isPending}
          onConfirm={() => {
            deleteMut.mutate(dto.id!, {
              onSuccess: () => {
                toast(NS.toast.deleted)
                router.push("/dashboard/projects")
              },
            })
          }}
        />
      </div>
    </TooltipProvider>
  )
}
