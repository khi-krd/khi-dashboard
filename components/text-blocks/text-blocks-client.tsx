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

/** The current draft text for one (key, locale) cell. */
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
  const { data: rows = [], isLoading, error } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: getTextBlocks,
  })

  const [drafts, setDrafts] = useState<Drafts | null>(null)
  const [search, setSearch] = useState("")
  const [newKey, setNewKey] = useState("")
  const [saving, setSaving] = useState(false)

  // Seed drafts once rows arrive — local edits must survive refetches.
  const effectiveDrafts = useMemo<Drafts>(() => {
    if (drafts) return drafts
    return toDrafts(rows)
  }, [drafts, rows])

  const dirtyKeys = useMemo(() => {
    const orig = toDrafts(rows)
    return Object.keys(effectiveDrafts).filter(
      (k) =>
        effectiveDrafts[k].ckb !== (orig[k]?.ckb ?? "") ||
        effectiveDrafts[k].ku !== (orig[k]?.ku ?? ""),
    )
  }, [effectiveDrafts, rows])

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = rows.filter(
      (r) =>
        !q ||
        r.key.toLowerCase().includes(q) ||
        effectiveDrafts[r.key]?.ckb?.toLowerCase().includes(q) ||
        effectiveDrafts[r.key]?.ku?.toLowerCase().includes(q),
    )
    const bySection = new Map<string, TextBlockRow[]>()
    for (const r of filtered) {
      const section = r.section ?? r.key.split(".")[0]
      const list = bySection.get(section) ?? []
      list.push(r)
      bySection.set(section, list)
    }
    return [...bySection.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [rows, effectiveDrafts, search])

  const setValue = useCallback((key: string, locale: Locale, value: string) => {
    setDrafts((prev) => {
      const base = prev ?? {}
      return {
        ...base,
        [key]: { ...(base[key] ?? { ckb: "", ku: "" }), [locale]: value },
      }
    })
  }, [])

  const handleSave = useCallback(async () => {
    const entries = dirtyKeys.flatMap((key) =>
      LOCALES.map((locale) => ({
        key,
        locale,
        value: effectiveDrafts[key]?.[locale] ?? "",
      })),
    )
    if (entries.length === 0) return
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
        نەتوانرا دەقەکان بهێنرێت — تەواوی مافەکان پێویستە (ADMIN).
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">دەقە ستاتیکەکان</h1>
          <p className="text-sm text-muted-foreground">
            دەقەکانی ماڵپەڕ لێرە دەگۆڕدرێن — گۆڕانکارییەکان ڕاستەوخۆ لەسەر
            ماڵپەڕ دەردەخەن.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="گەڕان بە کلیل یان دەق…"
            className="w-64"
          />
          <Button
            onClick={handleSave}
            disabled={saving || dirtyKeys.length === 0}
          >
            {saving
              ? "پاشەکەوت دەکرێت…"
              : `پاشەکەوت (${dirtyKeys.length})`}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg border p-3">
        <Input
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="کلیلی نوێ — بۆ نموونە Home.Hero.subtitle"
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

      {grouped.map(([section, sectionRows]) => (
        <section key={section} className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-primary">{section}</h2>
          <div className="rounded-lg border">
            {sectionRows.map((row) => (
              <div
                key={row.key}
                className="grid grid-cols-[minmax(180px,280px)_1fr_1fr_auto] items-start gap-3 border-b p-3 last:border-b-0"
              >
                <div
                  className="break-all pt-2 font-mono text-xs text-muted-foreground"
                  dir="ltr"
                >
                  {row.key}
                </div>
                {LOCALES.map((locale) => (
                  <div key={locale} className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      {locale === "ckb" ? "کوردی (سۆرانی)" : "کوردی (کورمانجی)"}
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
                  className="text-destructive"
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
        <p className="p-6 text-center text-muted-foreground">
          هیچ دەقێک نەدۆزرایەوە.
        </p>
      )}
    </div>
  )
}
