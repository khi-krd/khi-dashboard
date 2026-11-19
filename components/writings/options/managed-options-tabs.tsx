"use client"

import { useSearchParams } from "next/navigation"

import { ManagedOptionsList } from "@/components/writings/options/managed-options-list"
import { OPTION_PAGE } from "@/components/writings/options/managed-options-strings"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { MANAGED_OPTION_KINDS, type ManagedOptionKind } from "@/types/managed-option"

/**
 * The three writing vocabularies under one page — جۆری نووسین / چاپ /
 * زمانی کتێب — each rendering the shared genre-style management list.
 */
export function ManagedOptionsTabs() {
  const params = useSearchParams()
  const requested = params.get("tab")
  const initial = MANAGED_OPTION_KINDS.includes(
    requested as ManagedOptionKind,
  )
    ? (requested as ManagedOptionKind)
    : "writing-types"

  return (
    <Tabs defaultValue={initial} dir="rtl" className="space-y-6">
      <TabsList>
        {MANAGED_OPTION_KINDS.map((kind) => (
          <TabsTrigger key={kind} value={kind}>
            {OPTION_PAGE[kind].tab}
          </TabsTrigger>
        ))}
      </TabsList>
      {MANAGED_OPTION_KINDS.map((kind) => (
        <TabsContent key={kind} value={kind}>
          <ManagedOptionsList kind={kind} />
        </TabsContent>
      ))}
    </Tabs>
  )
}
