"use client"

import { useMemo } from "react"

import { useSiteFontsQuery } from "@/hooks/useSiteFonts"
import type { SiteFontDto } from "@/types/site-fonts"

const FORMAT_BY_EXT: Record<string, string> = {
  woff2: "woff2",
  woff: "woff",
  ttf: "truetype",
  otf: "opentype",
}

function fontFormatHint(url: string): string {
  const ext = url.split(/[?#]/)[0]?.split(".").pop()?.toLowerCase() ?? ""
  const format = FORMAT_BY_EXT[ext]
  return format ? ` format("${format}")` : ""
}

/**
 * The CSS family name a library font is addressed by in rich text. The public
 * site declares the same name (`buildLibraryFontCss`), so a description that
 * says `font-family: "Rabar"` renders identically in the editor and the site.
 */
export function siteFontFamily(font: Pick<SiteFontDto, "name">): string {
  return font.name.replace(/["\\;{}]/g, "").trim()
}

/** Distinct library fonts by family name, for the font picker. */
export function useSiteFontFamilies(): { family: string; lang: string }[] {
  const fontsQ = useSiteFontsQuery()
  return useMemo(() => {
    const seen = new Set<string>()
    const out: { family: string; lang: string }[] = []
    for (const font of fontsQ.data ?? []) {
      const family = siteFontFamily(font)
      if (!family || seen.has(family)) continue
      seen.add(family)
      out.push({ family, lang: font.language })
    }
    return out
  }, [fontsQ.data])
}

/**
 * `@font-face` for every uploaded typeface, through the same-origin
 * `/api/site-font` proxy (the bucket sends no CORS headers and the CSP is
 * `font-src 'self'`). Mounted by the rich-text editor so picked fonts render
 * live while editing.
 */
export function SiteFontFaces() {
  const fontsQ = useSiteFontsQuery()
  const css = useMemo(
    () =>
      (fontsQ.data ?? [])
        .map((font) => {
          const family = siteFontFamily(font)
          if (!family || !font.url) return ""
          return `@font-face{font-family:"${family}";src:url("/api/site-font?src=${encodeURIComponent(font.url)}")${fontFormatHint(font.url)};font-weight:100 900;font-display:swap}`
        })
        .filter(Boolean)
        .join("\n"),
    [fontsQ.data],
  )
  if (!css) return null
  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
