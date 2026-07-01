"use client"

import { Suspense, useCallback } from "react"
import Link from "next/link"
import {
  BookOpenIcon,
  MusicalNoteIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline"

import { FeaturedPanel } from "@/components/featured/featured-panel"
import { NS } from "@/components/featured/featured-strings"
import { SoundsErrorState } from "@/components/sounds/sound-error-state"
import { WritingErrorState } from "@/components/writings/writing-error-state"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  usePatchSoundFeaturedMutation,
  useSoundsListQuery,
} from "@/hooks/useSounds"
import {
  usePatchWritingFeaturedMutation,
  useWritingsListQuery,
} from "@/hooks/useWritings"
import { pickFeatured } from "@/lib/featured-utils"
import { formatCkbDigits } from "@/lib/intl-ckb"
import type { SoundsListQueryKeyParts } from "@/types/sounds-ui"
import type { WritingsListQueryKeyParts } from "@/types/writings-ui"

const soundsListParams: SoundsListQueryKeyParts = {
  page: 0,
  size: 500,
  keyword: "",
  stateFilter: "all",
  typeFilter: null,
  topicId: null,
  languageFilter: "all",
}

const writingsListParams: WritingsListQueryKeyParts = {
  page: 0,
  size: 500,
  keyword: "",
  searchMode: "writer",
  topicId: null,
  languageFilter: "all",
}

function PageSkeleton() {
  return (
    <div dir="rtl" className="space-y-6 px-4 py-6 lg:px-6">
      <Skeleton className="h-36 w-full rounded-2xl" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
      <Skeleton className="h-10 w-64 rounded-lg" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[4.5rem] rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export function FeaturedListClient() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <FeaturedListClientInner />
    </Suspense>
  )
}

function FeaturedListClientInner() {
  const soundsQ = useSoundsListQuery(soundsListParams)
  const writingsQ = useWritingsListQuery(writingsListParams)
  const soundFeaturedMut = usePatchSoundFeaturedMutation()
  const writingFeaturedMut = usePatchWritingFeaturedMutation()

  const featuredSounds = pickFeatured(soundsQ.data?.content ?? [])
  const featuredWritings = pickFeatured(writingsQ.data?.content ?? [])

  const patchSound = useCallback(
    async (
      id: number,
      payload: { featured?: boolean; featuredOrder?: number },
    ) => {
      await soundFeaturedMut.mutateAsync({ id, payload })
    },
    [soundFeaturedMut],
  )

  const patchWriting = useCallback(
    async (
      id: number,
      payload: { featured?: boolean; featuredOrder?: number },
    ) => {
      await writingFeaturedMut.mutateAsync({ id, payload })
    },
    [writingFeaturedMut],
  )

  return (
    <div dir="rtl" className="space-y-6 px-4 py-6 lg:px-6">
      <header className="from-primary/10 via-primary/5 relative overflow-hidden rounded-2xl border bg-gradient-to-br to-transparent p-6 sm:p-8">
        <div className="relative z-[1] max-w-2xl space-y-2">
          <div className="text-primary mb-2 flex items-center gap-2">
            <SparklesIcon className="size-5" aria-hidden />
            <span className="text-xs font-medium tracking-wide uppercase">
              {NS.breadcrumb.featured}
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {NS.title}
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm sm:text-base">
            {NS.subtitle}
          </p>
        </div>
        <div
          className="pointer-events-none absolute -start-10 -top-10 size-40 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -end-6 bottom-0 size-32 rounded-full bg-primary/5 blur-2xl"
          aria-hidden
        />
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card size="sm" className="ring-primary/15 bg-card/80">
          <CardHeader className="pb-2">
            <CardDescription>{NS.stats.sounds}</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums">
              {formatCkbDigits(featuredSounds.length)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Link
              href="/dashboard/sounds"
              className="text-primary text-xs hover:underline"
            >
              بینینی هەموو دەنگەکان
            </Link>
          </CardContent>
        </Card>
        <Card size="sm" className="ring-primary/15 bg-card/80">
          <CardHeader className="pb-2">
            <CardDescription>{NS.stats.writings}</CardDescription>
            <CardTitle className="text-3xl font-semibold tabular-nums">
              {formatCkbDigits(featuredWritings.length)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Link
              href="/dashboard/writings"
              className="text-primary text-xs hover:underline"
            >
              بینینی هەموو نووسراوەکان
            </Link>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sounds" className="gap-4">
        <TabsList variant="line" className="w-full justify-start">
          <TabsTrigger value="sounds" className="gap-1.5">
            <MusicalNoteIcon className="size-4" aria-hidden />
            {NS.tabs.sounds}
            <span className="text-muted-foreground font-mono text-xs tabular-nums">
              ({formatCkbDigits(featuredSounds.length)})
            </span>
          </TabsTrigger>
          <TabsTrigger value="writings" className="gap-1.5">
            <BookOpenIcon className="size-4" aria-hidden />
            {NS.tabs.writings}
            <span className="text-muted-foreground font-mono text-xs tabular-nums">
              ({formatCkbDigits(featuredWritings.length)})
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sounds">
          {soundsQ.isError ? (
            <SoundsErrorState onRetry={() => void soundsQ.refetch()} />
          ) : (
            <FeaturedPanel
              items={soundsQ.data?.content ?? []}
              isLoading={soundsQ.isLoading}
              emptyTitle={NS.empty.sounds_title}
              emptySubtitle={NS.empty.sounds_subtitle}
              dialogTitle={NS.dialog.sounds_title}
              addLabel={NS.actions.add}
              fallbackIcon={<MusicalNoteIcon className="size-6" aria-hidden />}
              getId={(item) => item.id!}
              getTitle={(item) =>
                item.ckbContent?.title?.trim() ||
                item.kmrContent?.title?.trim() ||
                ""
              }
              getSubtitle={(item) =>
                item.topicNameCkb?.trim() ||
                item.topicNameKmr?.trim() ||
                item.soundType?.trim() ||
                null
              }
              getCoverUrl={(item) =>
                item.ckbCoverUrl?.trim() ||
                item.kmrCoverUrl?.trim() ||
                item.hoverCoverUrl?.trim() ||
                null
              }
              detailHref={(id) => `/dashboard/sounds/${id}`}
              editHref={(id) => `/dashboard/sounds/${id}/edit`}
              onPatch={patchSound}
            />
          )}
        </TabsContent>

        <TabsContent value="writings">
          {writingsQ.isError ? (
            <WritingErrorState onRetry={() => void writingsQ.refetch()} />
          ) : (
            <FeaturedPanel
              items={writingsQ.data?.content ?? []}
              isLoading={writingsQ.isLoading}
              emptyTitle={NS.empty.writings_title}
              emptySubtitle={NS.empty.writings_subtitle}
              dialogTitle={NS.dialog.writings_title}
              addLabel={NS.actions.add}
              coverAspect="book"
              fallbackIcon={<BookOpenIcon className="size-6" aria-hidden />}
              getId={(item) => item.id!}
              getTitle={(item) =>
                item.ckbContent?.title?.trim() ||
                item.kmrContent?.title?.trim() ||
                ""
              }
              getSubtitle={(item) =>
                item.ckbContent?.writer?.trim() ||
                item.kmrContent?.writer?.trim() ||
                item.topicNameCkb?.trim() ||
                item.topicNameKmr?.trim() ||
                null
              }
              getCoverUrl={(item) =>
                item.ckbCoverUrl?.trim() ||
                item.kmrCoverUrl?.trim() ||
                item.hoverCoverUrl?.trim() ||
                null
              }
              detailHref={(id) => `/dashboard/writings/${id}`}
              editHref={(id) => `/dashboard/writings/${id}/edit`}
              onPatch={patchWriting}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
