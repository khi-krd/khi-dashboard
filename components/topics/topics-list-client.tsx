"use client"

import { Suspense, useCallback, useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  CollectionTopicsModulePanel,
  SoundTopicsModulePanel,
  VideoTopicsModulePanel,
  WritingTopicsModulePanel,
} from "@/components/topics/topics-module-panels"
import { TOPICS_NS, type TopicsModuleKey } from "@/components/topics/topics-strings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const MODULE_KEYS: TopicsModuleKey[] = [
  "videos",
  "sounds",
  "collections",
  "writings",
]

function isTopicsModuleKey(value: string | null): value is TopicsModuleKey {
  return value != null && MODULE_KEYS.includes(value as TopicsModuleKey)
}

function TopicsListInner() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeModule = useMemo(() => {
    const raw = searchParams.get("module")
    return isTopicsModuleKey(raw) ? raw : "videos"
  }, [searchParams])

  const setActiveModule = useCallback(
    (module: TopicsModuleKey) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("module", module)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  return (
    <div dir="rtl" className="space-y-8 px-4 py-6 lg:px-6">
      <header className="border-border/60 border-b pb-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            {TOPICS_NS.page.title}
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm">
            {TOPICS_NS.page.subtitle}
          </p>
        </div>
      </header>

      <Tabs
        value={activeModule}
        onValueChange={(v) => {
          if (isTopicsModuleKey(v)) setActiveModule(v)
        }}
        className="gap-6"
      >
        <TabsList
          variant="line"
          className="h-auto w-full flex-wrap justify-start gap-1"
        >
          {MODULE_KEYS.map((key) => (
            <TabsTrigger key={key} value={key} className="text-sm">
              {TOPICS_NS.tab[key]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="videos">
          {activeModule === "videos" ? <VideoTopicsModulePanel /> : null}
        </TabsContent>
        <TabsContent value="sounds">
          {activeModule === "sounds" ? <SoundTopicsModulePanel /> : null}
        </TabsContent>
        <TabsContent value="collections">
          {activeModule === "collections" ? (
            <CollectionTopicsModulePanel />
          ) : null}
        </TabsContent>
        <TabsContent value="writings">
          {activeModule === "writings" ? <WritingTopicsModulePanel /> : null}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function TopicsListClient() {
  return (
    <Suspense fallback={null}>
      <TopicsListInner />
    </Suspense>
  )
}
