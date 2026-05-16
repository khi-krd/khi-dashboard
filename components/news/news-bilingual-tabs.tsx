"use client"

import type { Language } from "@/types/news"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { NS } from "@/components/news/news-strings"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function NewsBilingualTabs({
  languages,
  ckbPane,
  kmrPane,
  markers,
}: {
  languages: Language[]
  ckbPane: ReactNode
  kmrPane: ReactNode
  /** Red tab indicator dots for react-hook-form field errors in that pane. */
  markers?: Partial<Record<"CKB" | "KMR", boolean>>
}) {
  if (languages.length <= 1) {
    return languages.includes("CKB") ? ckbPane : kmrPane
  }

  const defaultTab: Language =
    languages[0] === "CKB" || languages.includes("CKB") ? "CKB" : "KMR"

  return (
    <Tabs defaultValue={defaultTab} className="gap-2">
      <TabsList variant="line" className="w-full justify-start rounded-lg">
        {languages.includes("CKB") ? (
          <TabsTrigger value="CKB" className="relative gap-1.5">
            {NS.lang.ckb}
            {markers?.CKB ? (
              <span
                className={cn(
                  "bg-destructive inline-flex size-[6px] shrink-0 rounded-full",
                  "absolute -top-[2px] end-[-2px]",
                )}
                aria-hidden
              />
            ) : null}
          </TabsTrigger>
        ) : null}
        {languages.includes("KMR") ? (
          <TabsTrigger value="KMR" className="relative gap-1.5">
            {NS.lang.kmr}
            {markers?.KMR ? (
              <span
                className={cn(
                  "bg-destructive inline-flex size-[6px] shrink-0 rounded-full",
                  "absolute -top-[2px] end-[-2px]",
                )}
                aria-hidden
              />
            ) : null}
          </TabsTrigger>
        ) : null}
      </TabsList>
      {languages.includes("CKB") ? (
        <TabsContent value="CKB" className="mt-2">
          {ckbPane}
        </TabsContent>
      ) : null}
      {languages.includes("KMR") ? (
        <TabsContent value="KMR" className="mt-2">
          {kmrPane}
        </TabsContent>
      ) : null}
    </Tabs>
  )
}
