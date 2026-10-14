"use client"

import { useQuery } from "@tanstack/react-query"

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
export type LinkTarget = { url: string; label: string }
type TargetGroup = { label: string; items: LinkTarget[] }

/** Static routes every partner can point at without picking a record. */
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

function toItems(
  records: Record<string, unknown>[],
  urlFor: (record: Record<string, unknown>) => string | null,
): LinkTarget[] {
  return records.flatMap((record) => {
    const url = urlFor(record)
    return url ? [{ url, label: pickLabel(record) }] : []
  })
}

async function loadTargetGroups(): Promise<TargetGroup[]> {
  const groups: TargetGroup[] = [{ label: "پەڕە گشتییەکان", items: PAGE_TARGETS }]

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

  const content = (resp: unknown): Record<string, unknown>[] => {
    const data = (resp as { data?: { content?: unknown[] } })?.data
    return Array.isArray(data?.content)
      ? (data.content as Record<string, unknown>[])
      : []
  }

  // Service sections land on /services#<anchor> — the website renders each
  // section with id = navAnchorId ?? id, so the same fallback builds the
  // link. Their title lives inside per-language `contents`, not a flat field.
  const serviceItems = content(services).flatMap((s) => {
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
    groups.push({ label: "بەشەکانی خزمەتگوزاری", items: serviceItems })
  }

  const simpleGroups: [string, unknown, (r: Record<string, unknown>) => string][] = [
    ["هەواڵەکان", news, (r) => `/news/${r.id}`],
    ["نووسینەکان", writings, (r) => `/writings/${r.id}`],
    [
      "ڤیدیۆکان",
      videos,
      (r) =>
        r.videoType === "FILM"
          ? `/videos/shortfilms/${r.id}`
          : `/videos/${r.id}`,
    ],
    ["گەلەرییەکان", collections, (r) => `/gallery/${r.id}`],
    ["پڕۆژەکان", projects, (r) => `/projects/${r.id}`],
    ["دەنگەکان", sounds, (r) => `/audio/${r.id}`],
  ]

  for (const [label, resp, urlFor] of simpleGroups) {
    const items = toItems(content(resp), urlFor)
    if (items.length) groups.push({ label, items })
  }

  return groups
}

type PartnerLinkPickerProps = {
  value: string
  onPick: (url: string) => void
}

/**
 * Lets the editor point a partner card at an existing page/record instead of
 * typing a URL — grouped list of static pages, service sections, and every
 * content entity. The picked URL lands in the normal website field, so it can
 * still be edited or replaced by a manual/external link afterwards.
 */
export function PartnerLinkPicker({ value, onPick }: PartnerLinkPickerProps) {
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["partner-link-targets"],
    queryFn: loadTargetGroups,
    staleTime: 60_000,
  })

  const total = groups.reduce((n, g) => n + g.items.length, 0)
  const matched = groups.some((g) => g.items.some((i) => i.url === value))

  return (
    <Select
      value={matched ? value : ""}
      onValueChange={(url) => {
        if (url) onPick(url)
      }}
      disabled={isLoading || total === 0}
    >
      <SelectTrigger className="w-full" dir="rtl">
        <SelectValue
          placeholder={
            isLoading ? "چاوەڕێ بکە…" : "هەڵبژاردنی پەڕە یان ناوەندێک…"
          }
        />
      </SelectTrigger>
      <SelectContent dir="rtl" className="max-h-80">
        {groups.map((group) => (
          <SelectGroup key={group.label}>
            <SelectLabel className="text-xs text-muted-foreground">
              {group.label}
            </SelectLabel>
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
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}
