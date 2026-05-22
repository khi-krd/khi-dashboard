"use client"

import {
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  CalendarIcon,
  LinkIcon,
  MapPinIcon,
  PencilSquareIcon,
  PhotoIcon,
  ShareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import {
  ServiceBreadcrumbBar,
  dashboardServicesCrumbHref,
} from "@/components/services/service-breadcrumb"
import { ServiceActiveSwitch } from "@/components/services/service-active-switch"
import { ServiceCollectionCard } from "@/components/services/service-collection-card"
import { ServiceDeleteDialog } from "@/components/services/service-delete-dialog"
import { ServiceDetailSkeleton } from "@/components/services/service-detail-skeleton"
import { ServiceLanguageChipRow } from "@/components/services/service-language-chip"
import {
  ServiceStatusPillSidebar,
  serviceStatusContextLine,
  serviceStatusInlineWord,
} from "@/components/services/service-status-pill"
import { ServicesErrorState } from "@/components/services/services-error-state"
import { NS, truncateTitle } from "@/components/services/services-strings"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard"
import {
  useDeleteServiceMutation,
  useServiceDetailQuery,
  useToggleServiceActiveMutation,
} from "@/hooks/useServices"
import {
  formatFullTimestampKu,
  formatRelativeTimeKu,
} from "@/lib/news-relative-time"
import {
  isRichTextEmpty,
  sanitizeNewsBodyHtml,
} from "@/lib/sanitize-news-html"
import { formatNewsDateLong, formatNewsDateShort } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type { Language, ServiceDto } from "@/types/services"
import { getServiceContent, getServiceCoverUrl } from "@/types/services-ui"

const sectionDivider =
  "mt-6 border-t border-border/60 pt-6 [&:first-child]:mt-0 [&:first-child]:border-t-0 [&:first-child]:pt-0"

function MetaDot() {
  return (
    <span className="text-muted-foreground/60 mx-2" aria-hidden>
      ·
    </span>
  )
}

function ArticleBodyTabs({ dto }: { dto: ServiceDto }) {
  const langs = dto.contentLanguages ?? dto.contents.map((c) => c.languageCode)
  const hasCkb = langs.includes("CKB")
  const hasKmr = langs.includes("KMR")
  const [tab, setTab] = useState<Language>(hasCkb ? "CKB" : "KMR")

  const ckb = getServiceContent(dto, "CKB")
  const kmr = getServiceContent(dto, "KMR")
  const active = tab === "CKB" ? ckb : kmr
  const html = active?.description ?? ""

  if (!hasCkb && !hasKmr) return null

  return (
    <div className="mt-6">
      {hasCkb && hasKmr ? (
        <div className="border-border mb-4 flex gap-4 border-b">
          {hasCkb ? (
            <button
              type="button"
              className={cn(
                "border-b-2 pb-2 text-sm font-medium transition-colors",
                tab === "CKB"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground",
              )}
              onClick={() => setTab("CKB")}
            >
              {NS.lang.ckb}
            </button>
          ) : null}
          {hasKmr ? (
            <button
              type="button"
              className={cn(
                "border-b-2 pb-2 text-sm font-medium transition-colors",
                tab === "KMR"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground",
              )}
              onClick={() => setTab("KMR")}
            >
              {NS.lang.kmr}
            </button>
          ) : null}
        </div>
      ) : null}
      {isRichTextEmpty(html) ? (
        <p className="text-muted-foreground text-sm italic">{NS.empty.no_body}</p>
      ) : (
        <div
          className="prose prose-base dark:prose-invert mt-6 max-w-none"
          dangerouslySetInnerHTML={{
            __html: sanitizeNewsBodyHtml(html),
          }}
        />
      )}
    </div>
  )
}

export function ServiceDetailClient({ serviceId }: { serviceId: number }) {
  const router = useRouter()
  const { copyToClipboard } = useCopyToClipboard()
  const detailQuery = useServiceDetailQuery(serviceId)
  const deleteMut = useDeleteServiceMutation()
  const toggleMut = useToggleServiceActiveMutation()
  const [deleteDlg, setDeleteDlg] = useState(false)

  const dto = detailQuery.data?.success ? detailQuery.data.data : undefined

  const titleCkb = dto ? getServiceContent(dto, "CKB")?.title ?? "" : ""
  const titleKmr = dto ? getServiceContent(dto, "KMR")?.title ?? "" : ""
  const coverUrl = dto ? getServiceCoverUrl(dto) : null

  const publicUrl = useMemo(() => {
    if (!dto?.id) return null
    return `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/services/${dto.id}`
  }, [dto?.id])

  if (detailQuery.isLoading) return <ServiceDetailSkeleton />

  if (detailQuery.isError) {
    return (
      <div dir="rtl" className="px-4 py-12">
        <ServicesErrorState onRetry={() => void detailQuery.refetch()} />
      </div>
    )
  }

  if (!dto?.id) {
    return (
      <div dir="rtl" className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4">
        <p className="text-lg font-medium">{NS.not_found.title}</p>
        <Link href="/dashboard/services" className={buttonVariants()}>
          {NS.not_found.cta}
        </Link>
      </div>
    )
  }

  const handleToggleActive = (value: boolean) => {
    toggleMut.mutate(
      { id: dto.id!, value },
      {
        onSuccess: () => {
          toast(value ? NS.active.toggleOn : NS.active.toggleOff)
        },
        onError: () => toast.error(NS.error.generic),
      },
    )
  }

  const collections = [...(dto.mediaCollections ?? [])].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  )

  return (
    <TooltipProvider delay={250}>
      <div className="min-h-[50vh]" dir="rtl">
        <header className="bg-background/95 supports-backdrop-filter:backdrop-blur border-border sticky top-0 z-30 border-b">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
            <ServiceBreadcrumbBar
              className="min-w-0 flex-1"
              segments={[
                { label: NS.breadcrumb.dashboard, href: dashboardServicesCrumbHref() },
                { label: NS.breadcrumb.services, href: "/dashboard/services" },
                { label: truncateTitle(titleCkb || titleKmr, 40) },
              ]}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/services")}
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
              <ServiceActiveSwitch
                checked={dto.active}
                onCheckedChange={handleToggleActive}
                disabled={toggleMut.isPending}
              />
              <Link
                href={`/dashboard/services/${dto.id}/edit`}
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
                <ServiceStatusPillSidebar service={dto} />
                <p className="text-muted-foreground text-center text-xs">
                  {serviceStatusContextLine(dto)}
                </p>
              </section>

              <section className={cn(sectionDivider, "space-y-2")}>
                <h4 className="text-muted-foreground text-xs uppercase tracking-wide">
                  {NS.section.visibility}
                </h4>
                <div className="flex items-center justify-between gap-2">
                  <ServiceActiveSwitch
                    checked={dto.active}
                    onCheckedChange={handleToggleActive}
                    disabled={toggleMut.isPending}
                    showLabel={false}
                  />
                  <span className="text-xs">
                    {dto.active ? NS.active.on : NS.active.off}
                  </span>
                </div>
                <p className="text-muted-foreground text-xs">{NS.active.helper}</p>
              </section>

              {dto.serviceType ? (
                <section className={cn(sectionDivider, "space-y-2")}>
                  <h4 className="text-muted-foreground text-xs uppercase tracking-wide">
                    {NS.section.type}
                  </h4>
                  <Link
                    href={`/dashboard/services?type=${encodeURIComponent(dto.serviceType)}`}
                    className="text-foreground hover:text-primary text-sm"
                  >
                    {dto.serviceType}
                  </Link>
                </section>
              ) : null}

              <section className={cn(sectionDivider, "space-y-2")}>
                <h4 className="text-muted-foreground text-xs uppercase tracking-wide">
                  {NS.section.location}
                </h4>
                <p className="flex items-start gap-1.5">
                  <MapPinIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                  {dto.location?.trim() || NS.dash}
                </p>
              </section>

              <section className={cn(sectionDivider, "space-y-2")}>
                <h4 className="text-muted-foreground text-xs uppercase tracking-wide">
                  {NS.section.languages}
                </h4>
                <ServiceLanguageChipRow
                  langs={dto.contentLanguages ?? []}
                />
              </section>

              <section className={cn(sectionDivider, "space-y-3")}>
                <h4 className="text-muted-foreground text-xs uppercase tracking-wide">
                  {NS.section.dates}
                </h4>
                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">
                      {NS.system.publishDate}
                    </dt>
                    <dd className="font-mono">
                      {dto.publishedAt
                        ? formatNewsDateShort(dto.publishedAt)
                        : NS.dash}
                    </dd>
                  </div>
                  {dto.createdAt ? (
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">
                        {NS.system.createdAt}
                      </dt>
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
                      <dt className="text-muted-foreground">
                        {NS.system.updatedAt}
                      </dt>
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
                <span className="text-foreground font-medium">
                  {serviceStatusInlineWord(dto)}
                </span>
                {dto.serviceType ? (
                  <>
                    <MetaDot />
                    <span>{dto.serviceType}</span>
                  </>
                ) : null}
                {dto.location?.trim() ? (
                  <>
                    <MetaDot />
                    <span className="inline-flex items-center gap-1">
                      <MapPinIcon className="size-3.5" />
                      {dto.location}
                    </span>
                  </>
                ) : null}
                {dto.publishedAt ? (
                  <>
                    <MetaDot />
                    <span className="inline-flex items-center gap-1">
                      <CalendarIcon className="size-3.5" />
                      {formatNewsDateLong(dto.publishedAt)}
                    </span>
                  </>
                ) : null}
              </div>

              <div className="relative mt-6 aspect-[21/9] overflow-hidden rounded-xl">
                {coverUrl ? (
                  <Image
                    src={coverUrl}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized={coverUrl.startsWith("http")}
                    priority
                  />
                ) : (
                  <div className="bg-muted text-muted-foreground flex h-full flex-col items-center justify-center gap-2">
                    <PhotoIcon className="size-10 opacity-40" />
                    <span className="text-sm">{NS.empty.no_cover}</span>
                  </div>
                )}
              </div>

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

              <ArticleBodyTabs dto={dto} />

              {collections.length > 0 ? (
                <section className={cn("mt-12", sectionDivider)}>
                  <h3 className="mb-6 text-sm font-semibold">
                    {NS.section.collectionsDetail} ({collections.length})
                  </h3>
                  <div className="space-y-10">
                    {collections.map((col) => (
                      <ServiceCollectionCard
                        key={col.id ?? col.collectionName}
                        collection={col}
                      />
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </main>
        </div>

        <ServiceDeleteDialog
          open={deleteDlg}
          onOpenChange={setDeleteDlg}
          target={{
            mode: "single",
            item: {
              id: dto.id,
              active: dto.active,
              publishedAt: dto.publishedAt,
              titleCkb,
              coverUrl,
            },
          }}
          isPending={deleteMut.isPending}
          onConfirm={() => {
            deleteMut.mutate(dto.id!, {
              onSuccess: () => {
                toast(NS.toast.deleted)
                router.push("/dashboard/services")
              },
            })
          }}
        />
      </div>
    </TooltipProvider>
  )
}
