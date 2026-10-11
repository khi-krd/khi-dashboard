"use client"

import { useCallback, useMemo, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  deleteTextBlock,
  getTextBlocks,
  saveTextBlocks,
  type TextBlockRow,
} from "@/services/textBlocksService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const LOCALES = ["ckb", "ku"] as const
type Locale = (typeof LOCALES)[number]

const QUERY_KEY = ["text-blocks"]

/**
 * Website pages → the message sections that feed them. A key lands on the
 * first page whose section list contains its top-level segment; anything
 * unmatched (including admin-added custom keys) falls into "other".
 */
const PAGES = [
  { id: "home", label: "سەرەکی", sections: ["Home", "Hero", "LatestUpdates"] },
  { id: "news", label: "هەواڵ", sections: ["News"] },
  { id: "projects", label: "پڕۆژە", sections: ["Projects", "ProjectsPage"] },
  { id: "gallery", label: "گەلەری", sections: ["Gallery", "ImageCollection"] },
  { id: "sound", label: "دەنگ", sections: ["Sound", "Audio"] },
  { id: "writings", label: "نووسین", sections: ["Writings"] },
  { id: "video", label: "ڤیدیۆ", sections: ["Video"] },
  { id: "about", label: "دەربارە", sections: ["About"] },
  { id: "services", label: "خزمەتگوزاری", sections: ["Services"] },
  { id: "contact", label: "پەیوەندی", sections: ["Contact"] },
  { id: "donate", label: "بەخشین", sections: ["Donate"] },
  { id: "search", label: "گەڕان", sections: ["Search"] },
  { id: "archive", label: "ئەرشیڤ", sections: ["Archive"] },
  {
    id: "layout",
    label: "مێنیو و فوتەر",
    sections: ["Nav", "Footer", "LanguageSwitcher"],
  },
  {
    id: "other",
    label: "ئاخر",
    sections: ["Ui", "Common", "ErrorBoundary", "NotFound"],
  },
] as const

type PageId = (typeof PAGES)[number]["id"]

const SECTION_TO_PAGE = new Map<string, PageId>()
for (const page of PAGES) {
  for (const section of page.sections) {
    SECTION_TO_PAGE.set(section, page.id)
  }
}

function pageOf(row: TextBlockRow): PageId {
  const section = row.section ?? row.key.split(".")[0]
  return SECTION_TO_PAGE.get(section) ?? "other"
}

type Drafts = Record<string, Record<Locale, string>>

function toDrafts(rows: TextBlockRow[]): Drafts {
  const drafts: Drafts = {}
  for (const row of rows) {
    drafts[row.key] = {
      ckb: row.values?.ckb?.value ?? "",
      ku: row.values?.ku?.value ?? "",
    }
  }
  return drafts
}

export function TextBlocksClient() {
  const queryClient = useQueryClient()
  const {
    data: rows = [],
    isLoading,
    error,
  } = useQuery({ queryKey: QUERY_KEY, queryFn: getTextBlocks })

  const [drafts, setDrafts] = useState<Drafts | null>(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState<PageId>("home")
  const [newKey, setNewKey] = useState("")
  const [saving, setSaving] = useState(false)

  // Local edits must survive background refetches — keep a draft overlay.
  const effectiveDrafts = useMemo<Drafts>(
    () => drafts ?? toDrafts(rows),
    [drafts, rows],
  )

  const dirtyKeys = useMemo(() => {
    const orig = toDrafts(rows)
    return Object.keys(effectiveDrafts).filter(
      (k) =>
        effectiveDrafts[k].ckb !== (orig[k]?.ckb ?? "") ||
        effectiveDrafts[k].ku !== (orig[k]?.ku ?? ""),
    )
  }, [effectiveDrafts, rows])

  const pageCounts = useMemo(() => {
    const counts = new Map<PageId, number>()
    for (const row of rows) {
      const p = pageOf(row)
      counts.set(p, (counts.get(p) ?? 0) + 1)
    }
    return counts
  }, [rows])

  /**
   * Search across the key AND both locales' text. The query may be a single
   * word, a sentence, or any combination of words — every word must appear
   * somewhere in the row, in any order. Arabic-script lookalikes are
   * normalized so ي/ی and ك/ک match either way.
   */
  const normalize = useCallback(
    (s: string) =>
      s.toLowerCase().replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/\s+/g, " "),
    [],
  )
  const searching = search.trim().length > 0
  const visibleRows = useMemo(() => {
    const words = normalize(search).split(" ").filter(Boolean)
    return rows.filter((r) => {
      if (words.length) {
        const haystack = normalize(
          `${r.key} ${effectiveDrafts[r.key]?.ckb ?? ""} ${effectiveDrafts[r.key]?.ku ?? ""}`,
        )
        return words.every((w) => haystack.includes(w))
      }
      return pageOf(r) === page
    })
  }, [rows, effectiveDrafts, search, page, normalize])

  const grouped = useMemo(() => {
    const bySection = new Map<string, TextBlockRow[]>()
    for (const r of visibleRows) {
      const section = r.section ?? r.key.split(".")[0]
      const list = bySection.get(section) ?? []
      list.push(r)
      bySection.set(section, list)
    }
    return [...bySection.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [visibleRows])

  const setValue = useCallback(
    (key: string, locale: Locale, value: string) => {
      setDrafts({ ...effectiveDrafts, [key]: { ...effectiveDrafts[key], [locale]: value } })
    },
    [effectiveDrafts],
  )

  const handleSave = useCallback(async () => {
    const entries = dirtyKeys.flatMap((key) =>
      LOCALES.map((locale) => ({
        key,
        locale,
        value: effectiveDrafts[key]?.[locale] ?? "",
      })),
    )
    if (!entries.length) return
    setSaving(true)
    try {
      await saveTextBlocks(entries)
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      setDrafts(null)
      toast.success(`${entries.length} دەق نوێکرانەوە`)
    } catch {
      toast.error("پاشەکەوتکردن سەرکەوتوو نەبوو")
    } finally {
      setSaving(false)
    }
  }, [dirtyKeys, effectiveDrafts, queryClient])

  const handleAddKey = useCallback(async () => {
    const key = newKey.trim()
    if (!key) return
    setSaving(true)
    try {
      await saveTextBlocks([
        { key, locale: "ckb", value: "" },
        { key, locale: "ku", value: "" },
      ])
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      setNewKey("")
      setDrafts(null)
      toast.success("کلیل زیادکرا")
    } catch {
      toast.error("زیادکردن سەرکەوتوو نەبوو")
    } finally {
      setSaving(false)
    }
  }, [newKey, queryClient])

  const handleDelete = useCallback(
    async (row: TextBlockRow) => {
      setSaving(true)
      try {
        for (const locale of LOCALES) {
          const id = row.values?.[locale]?.id
          if (id) await deleteTextBlock(id)
        }
        await queryClient.invalidateQueries({ queryKey: QUERY_KEY })
        setDrafts(null)
        toast.success("سڕایەوە")
      } catch {
        toast.error("سڕینەوە سەرکەوتوو نەبوو")
      } finally {
        setSaving(false)
      }
    },
    [queryClient],
  )

  if (isLoading) {
    return <div className="p-8 text-muted-foreground">چاوەڕێ بکە…</div>
  }
  if (error) {
    return (
      <div className="p-8 text-destructive">
        نەتوانرا دەقەکان بهێنرێت — مافی ADMIN پێویستە.
      </div>
    )
  }

  const activePage = PAGES.find((p) => p.id === page) ?? PAGES[0]

  return (
    <div className="flex flex-col gap-5 p-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">دەقە ستاتیکەکان</h1>
          <p className="text-sm text-muted-foreground">
            دەقەکانی هەر لاپەڕێکی ماڵپەڕ — گۆڕانکارییەکان ڕاستەوخۆ لەسەر
            ماڵپەڕ دەردەخەن.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="گەڕان بە وشە یان ڕستە لە هەموو دەقەکان…"
            className="w-64"
          />
          <Button onClick={handleSave} disabled={saving || dirtyKeys.length === 0}>
            {saving ? "پاشەکەوت دەکرێت…" : `پاشەکەوت (${dirtyKeys.length})`}
          </Button>
        </div>
      </div>

      {/* Page tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-3">
        {PAGES.map((p) => {
          const count = pageCounts.get(p.id) ?? 0
          const active = !searching && p.id === page
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setPage(p.id)
                setSearch("")
              }}
              className={
                "rounded-full border px-4 py-1.5 text-sm transition-colors " +
                (active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-muted/40 text-foreground hover:bg-muted")
              }
            >
              {p.label}
              <span
                className={
                  "ms-2 rounded-full px-1.5 text-xs " +
                  (active ? "bg-primary-foreground/20" : "bg-muted")
                }
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Add key — lands on the active page's first section by default */}
      <div className="flex items-center gap-2">
        <Input
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder={`کلیلی نوێ — بۆ نموونە ${activePage.sections[0]}.fieldName`}
          className="max-w-md font-mono"
          dir="ltr"
        />
        <Button
          variant="outline"
          onClick={handleAddKey}
          disabled={saving || !newKey.trim()}
        >
          کلیل زیاد بکە
        </Button>
      </div>

      {/* Search result count */}
      {searching && (
        <p className="text-sm text-muted-foreground">
          {visibleRows.length} دەق دۆزرایەوە — دەستکارییەکانی ئێرە پاشەکەوت
          دەکرێن.
        </p>
      )}

      {/* Sections */}
      {grouped.map(([section, sectionRows]) => (
        <section key={section} className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-primary" dir="ltr">
            {section}
          </h2>
          <div className="overflow-hidden rounded-lg border bg-card">
            {sectionRows.map((row) => (
              <div
                key={row.key}
                className="grid grid-cols-[minmax(160px,240px)_1fr_1fr_auto] items-start gap-3 border-b p-3 last:border-b-0"
              >
                <div
                  className="break-all pt-2 font-mono text-xs leading-5 text-muted-foreground"
                  dir="ltr"
                >
                  {row.key}
                </div>
                {LOCALES.map((locale) => (
                  <div key={locale} className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      {locale === "ckb" ? "سۆرانی" : "کورمانجی"}
                    </span>
                    <Textarea
                      value={effectiveDrafts[row.key]?.[locale] ?? ""}
                      onChange={(e) => setValue(row.key, locale, e.target.value)}
                      rows={2}
                      dir={locale === "ku" ? "ltr" : "rtl"}
                      className="resize-y text-sm"
                    />
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-6 text-destructive"
                  onClick={() => handleDelete(row)}
                  disabled={saving}
                >
                  سڕینەوە
                </Button>
              </div>
            ))}
          </div>
        </section>
      ))}

      {grouped.length === 0 && (
        <p className="p-8 text-center text-muted-foreground">
          {searching
            ? "هیچ دەقێک بۆ ئەم گەڕانە نەدۆزرایەوە."
            : "هیچ دەقێک لەم لاپەڕەدا نییە — کلیلێک زیاد بکە."}
        </p>
      )}
    </div>
  )
}
