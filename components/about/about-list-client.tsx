"use client"

import { Suspense, useMemo, useState } from "react"
import { PencilSquareIcon, PlusIcon } from "@heroicons/react/24/outline"

import {
  AboutBreadcrumbBar,
  dashboardAboutCrumbHref,
} from "@/components/about/about-breadcrumb"
import { AboutContentSectionCard } from "@/components/about/about-content-section-card"
import { AboutFounderSectionCard } from "@/components/about/about-founder-section-card"
import { AboutPageHeroEditor } from "@/components/about/about-page-hero-editor"
import { AboutPagePreview } from "@/components/about/about-page-preview"
import { AboutPartnersSectionCard } from "@/components/about/about-partners-section-card"
import { AboutStatsSectionCard } from "@/components/about/about-stats-section-card"
import { AboutTeamSectionCard } from "@/components/about/about-team-section-card"
import { AboutErrorState } from "@/components/about/about-error-state"
import { NS } from "@/components/about/about-strings"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAboutListQuery } from "@/hooks/useAbout"
import type { AboutDto } from "@/types/about"

function PageSkeleton() {
  return (
    <div className="space-y-4" dir="rtl">
      <Skeleton className="h-64 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  )
}

export function AboutListClient() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <AboutListClientInner />
    </Suspense>
  )
}

function AboutListClientInner() {
  const listQuery = useAboutListQuery({ page: 0, size: 10 })
  const [pageMode, setPageMode] = useState<"view" | "edit">("view")

  const aboutRecord = useMemo((): AboutDto | undefined => {
    const rows = listQuery.data?.content ?? []
    return rows.find((row) => (row.id ?? 0) > 0)
  }, [listQuery.data?.content])

  const hasAbout = !!aboutRecord?.id
  const isEditing = pageMode === "edit"

  function startEditing() {
    setPageMode("edit")
  }

  function backToPreview() {
    setPageMode("view")
  }

  function handleSaved() {
    void listQuery.refetch()
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-16" dir="rtl">
      <AboutBreadcrumbBar
        segments={[
          { label: NS.breadcrumb.dashboard, href: dashboardAboutCrumbHref() },
          { label: NS.page.title },
        ]}
      />

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{NS.page.title}</h1>
          <p className="text-muted-foreground text-sm">
            {isEditing ? NS.page.subtitleSimple : NS.page.previewHint}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {!isEditing ? (
            <Button type="button" onClick={startEditing}>
              {hasAbout ? (
                <>
                  <PencilSquareIcon className="size-4" />
                  {NS.action.editPage}
                </>
              ) : (
                <>
                  <PlusIcon className="size-4 rtl:rotate-180" />
                  {NS.action.createPage}
                </>
              )}
            </Button>
          ) : (
            <Button type="button" variant="outline" onClick={backToPreview}>
              {NS.action.backToPreview}
            </Button>
          )}
        </div>
      </header>

      {listQuery.isError ? (
        <AboutErrorState onRetry={() => void listQuery.refetch()} />
      ) : !isEditing ? (
        <AboutPagePreview
          about={aboutRecord}
          isLoading={listQuery.isLoading}
        />
      ) : (
        <>
          <AboutPageHeroEditor
            aboutDto={aboutRecord}
            isLoading={listQuery.isLoading}
            onSaved={handleSaved}
          />

          {hasAbout && aboutRecord ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-semibold">{NS.page.sectionsTitle}</h2>
              </div>
              <div className="space-y-3">
                <AboutContentSectionCard
                  index={0}
                  aboutDto={aboutRecord}
                  onSaved={handleSaved}
                />
                <AboutStatsSectionCard
                  index={1}
                  aboutDto={aboutRecord}
                  onSaved={handleSaved}
                />
                <AboutFounderSectionCard
                  index={2}
                  aboutDto={aboutRecord}
                  onSaved={handleSaved}
                />
                <AboutTeamSectionCard index={3} />
                <AboutPartnersSectionCard index={4} />
              </div>
            </div>
          ) : !listQuery.isLoading ? (
            <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
              {NS.page.previewEmptyHint}
            </p>
          ) : null}
        </>
      )}
    </div>
  )
}
