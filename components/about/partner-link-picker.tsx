"use client"

import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { getCollectionsList } from "@/services/imageCollectionsService"
import { getNewsList } from "@/services/newsService"
import { getProjectsList } from "@/services/projectsService"
import { getServicesList } from "@/services/servicesService"
import { getSoundsList } from "@/services/soundsService"
import { getVideosList } from "@/services/videosService"
import { getWritingsList } from "@/services/writingsService"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/** One option the partner card can link to. */
type LinkTarget = { url: string; label: string }
type TargetGroup = { key: string; label: string; items: LinkTarget[] }

/** Static routes a partner can point at without picking a record. */
const PAGE_TARGETS: LinkTarget[] = [
  { url: "/", label: "سەرەکی" },
  { url: "/about", label: "دەربارە" },
  { url: "/services", label: "خزمەتگوزاری" },
  { url: "/projects", label: "پڕۆژە" },
  { url: "/writings", label: "نووسین" },
  { url: "/news", label: "هەواڵ" },
  { url: "/gallery", label: "گەلەری" },
  { url: "/audio", label: "دەنگ" },
  { url: "/videos", label: "ڤیدیۆ" },
  { url: "/donate", label: "بەخشین" },
  { url: "/contact", label: "پەیوەندی" },
  { url: "/search", label: "گەڕان" },
]

/**
 * Display label across the differing DTO shapes — CKB first, then KMR, then
 * any name field, then the record id so an untitled row is still pickable.
 */
function pickLabel(record: Record<string, unknown>): string {
  const content = record.ckbContent as { title?: string } | undefined
  const kmrContent = record.kmrContent as { title?: string } | undefined
  const candidates = [
    content?.title,
    record.titleCkb,
    record.nameCkb,
    record.title,
    kmrContent?.title,
    record.titleKmr,
    record.nameKmr,
    record.name,
  ]
  const found = candidates.find(
    (v): v is string => typeof v === "string" && v.trim().length > 0,
  )
  return found?.trim() ?? `#${record.id}`
}

function contentOf(resp: unknown): Record<string, unknown>[] {
  const data = (resp as { data?: { content?: unknown[] } })?.data
  return Array.isArray(data?.content)
    ? (data.content as Record<string, unknown>[])
    : []
}

function toItems(
  records: Record<string, unknown>[],
  urlFor: (record: Record<string, unknown>) => string | null,
): LinkTarget[] {
  return records.flatMap((record) => {
    const url = urlFor(record)
    return url ? [{ url, label: pickLabel(record) }] : []
  })
}

/** Every linkable thing, grouped by where it lives on the site. */
async function loadTargetGroups(): Promise<TargetGroup[]> {
  const groups: TargetGroup[] = []

  const settled = await Promise.allSettled([
    getServicesList(0, 100),
    getNewsList(0, 100),
    getWritingsList(0, 100),
    getVideosList({ page: 0, size: 100 }),
    getCollectionsList(0, 100),
    getProjectsList(0, 100),
    getSoundsList(0, 100),
  ])
  const [services, news, writings, videos, collections, projects, sounds] =
    settled.map((r) => (r.status === "fulfilled" ? r.value : null))

  // Service sections land on /services#<anchor> — the website renders each
  // section with id = navAnchorId ?? id. Their title lives inside per-language
  // `contents`, not a flat field.
  const serviceItems = contentOf(services).flatMap((s) => {
    const anchor =
      (typeof s.navAnchorId === "string" && s.navAnchorId.trim()) ||
      (s.id != null ? String(s.id) : "")
    if (!anchor) return []
    const contents =
      (s.contents as { languageCode?: string; title?: string }[]) ?? []
    const label =
      contents.find((c) => c.languageCode === "CKB")?.title?.trim() ||
      contents.find((c) => c.title?.trim())?.title?.trim() ||
      `خزمەتگوزاری ${anchor}`
    return [{ url: `/services#${anchor}`, label }]
  })
  if (serviceItems.length) {
    groups.push({
      key: "service-sections",
      label: "بەشەکانی خزمەتگوزاری",
      items: serviceItems,
    })
  }

  const simpleGroups: [
    string,
    string,
    unknown,
    (r: Record<string, unknown>) => string,
  ][] = [
    ["news", "هەواڵەکان", news, (r) => `/news/${r.id}`],
    ["writings", "نووسینەکان", writings, (r) => `/writings/${r.id}`],
    [
      "videos",
      "ڤیدیۆکان",
      videos,
      (r) =>
        r.videoType === "FILM"
          ? `/videos/shortfilms/${r.id}`
          : `/videos/${r.id}`,
    ],
    ["gallery", "گەلەرییەکان", collections, (r) => `/gallery/${r.id}`],
    ["projects", "پڕۆژەکان", projects, (r) => `/projects/${r.id}`],
    ["sounds", "دەنگەکان", sounds, (r) => `/audio/${r.id}`],
  ]

  for (const [key, label, resp, urlFor] of simpleGroups) {
    const items = toItems(contentOf(resp), urlFor)
    if (items.length) groups.push({ key, label, items })
  }

  return groups
}

type PartnerLinkPickerProps = {
  value: string
  onPick: (url: string) => void
}

/**
 * Two-step target picker for a partner card: the first select chooses WHERE
 * the link goes — a static page directly, or a content group (service
 * sections, news, writings…); choosing a group opens the second select to
 * pick the exact item. The picked URL lands in the normal website field, so
 * it can still be edited or replaced by a manual/external link afterwards.
 */
export function PartnerLinkPicker({ value, onPick }: PartnerLinkPickerProps) {
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["partner-link-targets"],
    queryFn: loadTargetGroups,
    staleTime: 60_000,
  })

  // Which group the second select lists — reset when the first select moves
  // to a page or a different group.
  const [groupKey, setGroupKey] = useState("")
  const group = groups.find((g) => g.key === groupKey)

  return (
    <div className="flex flex-col gap-2">
      <Select
        value=""
        onValueChange={(v) => {
          if (!v) return
          // Group headers are prefixed so they can't collide with a real URL.
          if (v.startsWith("group:")) {
            setGroupKey(v.slice("group:".length))
          } else {
            setGroupKey("")
            onPick(v)
          }
        }}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full" dir="rtl">
          <SelectValue
            placeholder={
              isLoading ? "چاوەڕێ بکە…" : "١. هەڵبژاردنی پەڕە یان جۆر…"
            }
          />
        </SelectTrigger>
        <SelectContent dir="rtl" className="max-h-80">
          <SelectGroup>
            <SelectLabel className="text-xs text-muted-foreground">
              پەڕە گشتییەکان
            </SelectLabel>
            {PAGE_TARGETS.map((item) => (
              <SelectItem key={item.url} value={item.url}>
                <span className="flex-1 truncate">{item.label}</span>
                <span
                  className="ms-3 shrink-0 font-mono text-[11px] text-muted-foreground"
                  dir="ltr"
                >
                  {item.url}
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
          {groups.length > 0 && (
            <SelectGroup>
              <SelectLabel className="text-xs text-muted-foreground">
                ناوەندی لاپەڕەکان — بەش/بابەت هەڵبژێرە
              </SelectLabel>
              {groups.map((g) => (
                <SelectItem key={g.key} value={`group:${g.key}`}>
                  <span className="flex-1 truncate">
                    {g.label}
                    <span className="ms-2 text-[11px] text-muted-foreground">
                      ({g.items.length})
                    </span>
                  </span>
                  <span className="shrink-0 text-muted-foreground">←</span>
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>

      {group ? (
        <Select
          value={group.items.some((i) => i.url === value) ? value : ""}
          onValueChange={(v) => {
            if (v) onPick(v)
          }}
        >
          <SelectTrigger className="w-full" dir="rtl">
            <SelectValue placeholder={`٢. ${group.label} هەڵبژێرە…`} />
          </SelectTrigger>
          <SelectContent dir="rtl" className="max-h-80">
            {group.items.map((item) => (
              <SelectItem key={item.url} value={item.url}>
                <span className="flex-1 truncate">{item.label}</span>
                <span
                  className="ms-3 shrink-0 font-mono text-[11px] text-muted-foreground"
                  dir="ltr"
                >
                  {item.url}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
    </div>
  )
}
