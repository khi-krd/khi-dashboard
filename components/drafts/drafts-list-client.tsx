"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { DRAFT_NS } from "@/components/shared/draft-strings"
import { buttonVariants } from "@/components/ui/button"
import {
  FORM_DRAFT_PREFIX,
  removeStoredDraft,
  type StoredFormDraft,
} from "@/hooks/use-form-draft"
import {
  formatFullTimestampKu,
  formatRelativeTimeKu,
} from "@/lib/news-relative-time"
import { cn } from "@/lib/utils"

interface DraftEntry {
  key: string
  entity: string
  recordId: string
  userKey: string
  values: Record<string, unknown>
  savedAt: string
}

/** Entity key → sidebar section name + route base. Unknown entities still list. */
const ENTITY_META: Record<string, { label: string; basePath: string }> = {
  news: { label: "هەواڵەکان", basePath: "/dashboard/news" },
  projects: { label: "پرۆژەکان", basePath: "/dashboard/projects" },
  writings: { label: "نووسراوەکان", basePath: "/dashboard/writings" },
  sounds: { label: "دەنگەکان", basePath: "/dashboard/sounds" },
  videos: { label: "ڤیدیۆکان", basePath: "/dashboard/videos" },
  collections: {
    label: "کۆمەڵە وێنەکان",
    basePath: "/dashboard/image-collections",
  },
  "image-collections": {
    label: "کۆمەڵە وێنەکان",
    basePath: "/dashboard/image-collections",
  },
}

const ENTITY_ORDER = [
  "news",
  "projects",
  "writings",
  "sounds",
  "videos",
  "collections",
  "image-collections",
]

function parseDraftKey(key: string): Omit<DraftEntry, "values" | "savedAt"> | null {
  if (!key.startsWith(FORM_DRAFT_PREFIX)) return null
  const [entity, recordId, ...rest] = key.slice(FORM_DRAFT_PREFIX.length).split(":")
  if (!entity || !recordId) return null
  return { key, entity, recordId, userKey: rest.join(":") || "anon" }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value != null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function nonBlank(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

/** First non-empty title-ish field across the known form shapes. */
function draftTitle(values: Record<string, unknown>): string {
  const ckb = asRecord(values.ckbContent)
  const kmr = asRecord(values.kmrContent)
  const candidates = [
    values.titleCkb,
    values.nameCkb,
    values.title,
    values.name,
    ckb?.title,
    ckb?.name,
    kmr?.title,
    kmr?.name,
    values.titleKmr,
    values.nameKmr,
  ]
  for (const c of candidates) {
    const s = nonBlank(c)
    if (s) return s
  }
  return "—"
}

function loadDrafts(): DraftEntry[] {
  const out: DraftEntry[] = []
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i)
      if (!key) continue
      const meta = parseDraftKey(key)
      if (!meta) continue
      try {
        const raw = window.localStorage.getItem(key)
        if (!raw) continue
        const parsed = JSON.parse(raw) as StoredFormDraft
        const values = asRecord(parsed?.values)
        if (!values || typeof parsed.savedAt !== "string") continue
        out.push({ ...meta, values, savedAt: parsed.savedAt })
      } catch {
        // One malformed entry must not hide the rest.
      }
    }
  } catch {
    // localStorage unavailable (private mode) — show the empty state.
  }
  return out
}

export function DraftsListClient() {
  const [entries, setEntries] = useState<DraftEntry[] | null>(null)

  // localStorage only exists on the client — scan after mount, not during SSR.
  useEffect(() => {
    queueMicrotask(() => setEntries(loadDrafts()))
  }, [])

  const discard = useCallback((key: string) => {
    removeStoredDraft(key)
    setEntries((prev) => (prev ? prev.filter((e) => e.key !== key) : prev))
    toast.success(DRAFT_NS.toast.discarded)
  }, [])

  const groups = new Map<string, DraftEntry[]>()
  for (const entry of entries ?? []) {
    const list = groups.get(entry.entity) ?? []
    list.push(entry)
    groups.set(entry.entity, list)
  }
  const orderedEntities = [...groups.keys()].sort((a, b) => {
    const ia = ENTITY_ORDER.indexOf(a)
    const ib = ENTITY_ORDER.indexOf(b)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })
  for (const list of groups.values()) {
    list.sort((a, b) => Date.parse(b.savedAt) - Date.parse(a.savedAt))
  }

  return (
    <div dir="rtl" className="space-y-8 px-4 py-6 lg:px-6">
      <header className="border-border/60 border-b pb-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            {DRAFT_NS.page.title}
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm">
            {DRAFT_NS.page.subtitle}
          </p>
        </div>
      </header>

      {entries === null ? null : entries.length === 0 ? (
        <p className="text-muted-foreground text-sm">{DRAFT_NS.page.empty}</p>
      ) : (
        orderedEntities.map((entity) => {
          const meta = ENTITY_META[entity]
          const list = groups.get(entity) ?? []
          return (
            <section key={entity} className="space-y-3">
              <h2 className="text-sm font-semibold">
                {meta?.label ?? entity}
                <span className="text-muted-foreground ms-2 font-normal">
                  ({list.length})
                </span>
              </h2>
              <ul className="divide-border/60 divide-y rounded-xl border border-border/60 bg-card/50">
                {list.map((entry) => {
                  const href = meta
                    ? entry.recordId === "new"
                      ? `${meta.basePath}/new`
                      : `${meta.basePath}/${entry.recordId}/edit`
                    : null
                  return (
                    <li
                      key={entry.key}
                      className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">
                            {draftTitle(entry.values)}
                          </span>
                          {entry.recordId === "new" ? (
                            <span className="text-muted-foreground rounded-full border border-dashed border-border px-2 py-0.5 text-[10px]">
                              {DRAFT_NS.page.new_record}
                            </span>
                          ) : (
                            <span className="text-muted-foreground font-mono text-[10px]">
                              #{entry.recordId}
                            </span>
                          )}
                        </div>
                        <p
                          className="text-muted-foreground mt-0.5 text-xs"
                          title={formatFullTimestampKu(entry.savedAt)}
                        >
                          {DRAFT_NS.page.saved_at}:{" "}
                          {formatRelativeTimeKu(entry.savedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {href ? (
                          <Link
                            href={href}
                            className={cn(
                              buttonVariants({ variant: "outline", size: "sm" }),
                              "rounded-md",
                            )}
                          >
                            {DRAFT_NS.page.continue}
                          </Link>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => discard(entry.key)}
                          className="text-destructive hover:bg-destructive/10 rounded-md px-3 py-1.5 text-xs font-medium"
                        >
                          {DRAFT_NS.page.discard}
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })
      )}
    </div>
  )
}
