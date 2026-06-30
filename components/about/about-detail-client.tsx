"use client"

import {
  ArrowRightIcon,
  CalendarIcon,
  GlobeAltIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import {
  AboutBreadcrumbBar,
  dashboardAboutCrumbHref,
} from "@/components/about/about-breadcrumb"
import { AboutDeleteDialog } from "@/components/about/about-delete-dialog"
import { AboutDetailSidebar } from "@/components/about/about-detail-sidebar"
import { AboutDetailSkeleton } from "@/components/about/about-detail-skeleton"
import { AboutErrorState } from "@/components/about/about-error-state"
import { AboutStatusPill } from "@/components/about/about-status-pill"
import { NS, truncateTitle } from "@/components/about/about-strings"
import { SlugChip } from "@/components/about/slug-chip"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  useAboutDetailQuery,
  useDeleteAboutMutation,
} from "@/hooks/useAbout"
import { aboutDisplayTitle } from "@/lib/about-normalize"
import { aboutPublicUrl } from "@/lib/about-url-helpers"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { formatRelativeTimeKu } from "@/lib/news-relative-time"
import {
  isRichTextEmpty,
  sanitizeNewsBodyHtml,
} from "@/lib/sanitize-news-html"
import { cn } from "@/lib/utils"
import { aboutContentLanguages } from "@/types/about-ui"
import type { AboutDto, Language } from "@/types/about"

export function AboutDetailClient({ aboutId }: { aboutId: number }) {
  const router = useRouter()
  const { data: about, isLoading, isError, refetch } =
    useAboutDetailQuery(aboutId)
  const deleteMut = useDeleteAboutMutation()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [activeLang, setActiveLang] = useState<Language>("CKB")

  if (isLoading) return <AboutDetailSkeleton />
  if (isError) return <AboutErrorState onRetry={() => void refetch()} />
  if (!about?.id) {
    return (
      <div dir="rtl" className="flex flex-col items-center py-20">
        <h1 className="text-lg font-medium">{NS.not_found.title}</h1>
        <Link
          href="/dashboard/about"
          className={buttonVariants({ variant: "outline" })}
        >
          {NS.not_found.cta}
        </Link>
      </div>
    )
  }

  const langs = aboutContentLanguages(about)
  const bothLangs = langs.includes("CKB") && langs.includes("KMR")
  const titleCkb = about.ckbContent?.title
  const titleKmr = about.kmrContent?.title
  const subtitle =
    activeLang === "CKB"
      ? about.ckbContent?.subtitle
      : about.kmrContent?.subtitle
  const seoDesc =
    activeLang === "CKB"
      ? about.ckbContent?.metaDescription
      : about.kmrContent?.metaDescription
  const body =
    activeLang === "CKB" ? about.ckbContent?.body : about.kmrContent?.body
  const publicUrl = about.slugCkb?.trim()
    ? aboutPublicUrl(about.slugCkb.trim())
    : ""

  return (
    <div dir="rtl" className="mx-auto max-w-[1280px] px-6">
      <nav className="border-border bg-background/95 supports-backdrop-filter:backdrop-blur sticky top-0 z-20 -mx-6 flex items-center justify-between border-b px-6 py-3">
        <AboutBreadcrumbBar
          segments={[
            { label: NS.breadcrumb.dashboard, href: dashboardAboutCrumbHref() },
            { label: NS.breadcrumb.about, href: "/dashboard/about" },
            {
              label: truncateTitle(aboutDisplayTitle(about) || `#${about.id}`, 40),
            },
          ]}
        />
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/about"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <ArrowRightIcon className="me-1 size-4 rtl:rotate-180" />
            {NS.action.back}
          </Link>
          {publicUrl ? (
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              <GlobeAltIcon className="me-1 size-4" />
              {NS.action.view_site}
            </a>
          ) : null}
          <Link
            href={`/dashboard/about/${about.id}/edit`}
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            <PencilSquareIcon className="me-1 size-4" />
            {NS.action.edit}
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteOpen(true)}
          >
            <TrashIcon className="me-1 size-4" />
            {NS.action.delete}
          </Button>
        </div>
      </nav>

      <div className="grid grid-cols-1 gap-8 py-8 lg:grid-cols-[340px_minmax(0,1fr)]">
        <AboutDetailSidebar about={about} />

        <article className="min-w-0">
          <div>
            <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
              <AboutStatusPill active={about.active} />
              <span>·</span>
              <span className="font-mono">#{formatCkbDigits(about.id)}</span>
              {about.createdAt ? (
                <>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarIcon className="size-3.5" />
                    {formatRelativeTimeKu(about.createdAt)}
                  </span>
                </>
              ) : null}
              {about.updatedAt ? (
                <>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <PencilIcon className="size-3.5" />
                    {formatRelativeTimeKu(about.updatedAt)}
                  </span>
                </>
              ) : null}
            </div>

            <div className="text-muted-foreground mt-3 flex items-center gap-2 text-xs">
              <LinkIcon className="size-3.5" />
              <SlugChip lang="ckb" value={about.slugCkb} />
              <SlugChip lang="kmr" value={about.slugKmr} />
            </div>

            <h1 className="mt-5 text-4xl leading-tight font-bold tracking-tight md:text-5xl">
              {titleCkb}
            </h1>
            {titleKmr?.trim() ? (
              <h2 className="text-muted-foreground mt-2 text-xl leading-snug font-medium md:text-2xl">
                {titleKmr}
              </h2>
            ) : null}

            {(about.ckbContent?.subtitle || about.kmrContent?.subtitle) && (
              <div className="mt-5">
                {bothLangs ? (
                  <div className="mb-3 flex gap-2">
                    {(["CKB", "KMR"] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setActiveLang(lang)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                          activeLang === lang
                            ? lang === "CKB"
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400"
                            : "border-border text-muted-foreground",
                        )}
                      >
                        {lang === "CKB" ? NS.lang.ckb : NS.lang.kmr}
                      </button>
                    ))}
                  </div>
                ) : null}
                {subtitle?.trim() ? (
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            )}

            {seoDesc?.trim() ? (
              <aside className="border-border/40 bg-muted/30 mt-6 rounded-lg border p-3.5">
                <div className="text-muted-foreground mb-1.5 flex items-center gap-1.5 text-[10px] font-medium tracking-wide uppercase">
                  <MagnifyingGlassIcon className="size-3" />
                  {NS.detail.seo}
                </div>
                <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                  {seoDesc}
                </p>
              </aside>
            ) : null}

            {!isRichTextEmpty(body) ? (
              <section className="border-border/60 mt-12 border-t pt-8">
                <div
                  className="prose prose-neutral dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeNewsBodyHtml(body ?? ""),
                  }}
                />
              </section>
            ) : null}

            {(about.stats?.length ?? 0) > 0 ? (
              <section className="border-border/60 mt-12 border-t pt-8">
                <h3 className="text-muted-foreground mb-4 text-xs font-medium tracking-wide uppercase">
                  {NS.detail.stats}
                </h3>
                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {about.stats!.map((stat, i) => (
                    <div
                      key={i}
                      className="border-border bg-muted/20 rounded-lg border p-4 text-center"
                    >
                      <dt className="text-muted-foreground text-xs">
                        {stat.labelCkb?.trim() || stat.labelKmr?.trim() || "—"}
                      </dt>
                      {stat.labelKmr?.trim() &&
                      stat.labelCkb?.trim() &&
                      stat.labelKmr !== stat.labelCkb ? (
                        <div className="text-muted-foreground/70 mt-0.5 text-[10px]">
                          {stat.labelKmr}
                        </div>
                      ) : null}
                      <dd className="mt-2 text-2xl font-bold tracking-tight">
                        {stat.value?.trim() || "—"}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}
          </div>
        </article>
      </div>

      <AboutDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        target={about}
        isPending={deleteMut.isPending}
        onConfirm={async () => {
          if (!about.id) return
          try {
            await deleteMut.mutateAsync(about.id)
            toast.success(NS.toast.deleted)
            router.push("/dashboard/about")
          } catch {
            toast.error(NS.error.validation)
          }
        }}
      />
    </div>
  )
}
