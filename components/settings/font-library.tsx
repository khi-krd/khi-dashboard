"use client"

import { CheckIcon, TrashIcon } from "@heroicons/react/24/outline"
import { useRef, useState } from "react"
import { toast } from "sonner"

import { NS } from "@/components/settings/settings-strings"
import { UploadProgressLine } from "@/components/shared/upload-progress-line"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { extractApiErrorMessage } from "@/lib/api-error"
import {
  useCreateSiteFontMutation,
  useDeleteSiteFontMutation,
  useSiteFontsQuery,
} from "@/hooks/useSiteFonts"
import {
  useSiteSettingsQuery,
  useUpdateSiteSettingsMutation,
} from "@/hooks/useSiteSettings"
import { uploadMedia } from "@/services/mediaService"
import type { SiteFontDto, SiteFontLanguage } from "@/types/site-fonts"
import { cn } from "@/lib/utils"

const FONT_ACCEPT = ".woff2,.woff,.ttf,.otf"
const FONT_FORMATS: Record<string, string> = {
  woff2: "woff2",
  woff: "woff",
  ttf: "truetype",
  otf: "opentype",
}

function fontFormatHint(url: string): string {
  const ext = url.split(/[?#]/)[0].split(".").pop()?.toLowerCase() ?? ""
  return FONT_FORMATS[ext] ? ` format("${FONT_FORMATS[ext]}")` : ""
}

function fontExt(url: string): string {
  return url.split(/[?#]/)[0].split(".").pop()?.toUpperCase() ?? ""
}

/**
 * The site typeface library — upload as many fonts as wanted per language,
 * then activate one. The library rows live in `site_fonts`; activation copies
 * the entry's url+name into site_settings, so the website keeps reading the
 * same two fields.
 */
export function FontLibrary() {
  const fontsQ = useSiteFontsQuery()
  const settingsQ = useSiteSettingsQuery()

  const activeUrl = {
    CKB: settingsQ.data?.ckbFontUrl ?? null,
    KMR: settingsQ.data?.kmrFontUrl ?? null,
  }

  return (
    <section className="border-border/60 bg-card/50 space-y-4 rounded-xl border p-5 shadow-xs">
      <div>
        <h2 className="inline-flex items-center gap-2 text-base font-semibold before:h-4 before:w-1 before:rounded-full before:bg-primary/70 before:content-['']">
          {NS.fonts.title}
        </h2>
        <p className="text-muted-foreground text-sm">{NS.fonts.hint}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FontLangColumn
          lang="CKB"
          title={NS.fonts.ckb.label}
          sample={NS.fonts.ckb.sample}
          fonts={(fontsQ.data ?? []).filter((f) => f.language === "CKB")}
          activeUrl={activeUrl.CKB}
          loading={fontsQ.isLoading}
        />
        <FontLangColumn
          lang="KMR"
          title={NS.fonts.kmr.label}
          sample={NS.fonts.kmr.sample}
          fonts={(fontsQ.data ?? []).filter((f) => f.language === "KMR")}
          activeUrl={activeUrl.KMR}
          loading={fontsQ.isLoading}
        />
      </div>
    </section>
  )
}

function FontLangColumn({
  lang,
  title,
  sample,
  fonts,
  activeUrl,
  loading,
}: {
  lang: SiteFontLanguage
  title: string
  sample: string
  fonts: SiteFontDto[]
  activeUrl: string | null
  loading: boolean
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const createMut = useCreateSiteFontMutation()
  const deleteMut = useDeleteSiteFontMutation()
  const updateMut = useUpdateSiteSettingsMutation()

  const busy = progress != null || createMut.isPending
  const activating = updateMut.isPending

  function activatePayload(font: SiteFontDto | null) {
    return lang === "CKB"
      ? {
          ckbFontUrl: font?.url ?? "",
          ckbFontName: font?.name ?? "",
        }
      : {
          kmrFontUrl: font?.url ?? "",
          kmrFontName: font?.name ?? "",
        }
  }

  function activate(font: SiteFontDto) {
    updateMut.mutate(activatePayload(font), {
      onSuccess: () => toast.success(NS.fonts.toast.activated),
      onError: (err) =>
        toast.error(extractApiErrorMessage(err) ?? NS.error.generic),
    })
  }

  function deactivate() {
    updateMut.mutate(activatePayload(null), {
      onSuccess: () => toast.success(NS.fonts.toast.deactivated),
      onError: (err) =>
        toast.error(extractApiErrorMessage(err) ?? NS.error.generic),
    })
  }

  async function handleFile(file: File) {
    setProgress(0)
    try {
      const uploaded = await uploadMedia(file, "document", setProgress)
      const font = await createMut.mutateAsync({
        language: lang,
        name: file.name.replace(/\.[^.]+$/, ""),
        url: uploaded.fileUrl,
      })
      toast.success(NS.fonts.toast.added)
      // First font for the language: activating it is almost always the intent.
      if (!activeUrl) {
        updateMut.mutate(activatePayload(font))
      }
    } catch (err) {
      toast.error(extractApiErrorMessage(err) ?? NS.fonts.uploadFailed)
    } finally {
      setProgress(null)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  return (
    <div className="border-border/60 space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-muted-foreground text-[11px]">
          {NS.fonts.formats}
        </span>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={FONT_ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleFile(file)
        }}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={busy}
        onClick={() => fileRef.current?.click()}
      >
        {busy ? <Spinner className="me-2 size-3.5" aria-hidden /> : null}
        {busy ? NS.fonts.uploading : NS.fonts.upload}
      </Button>
      <UploadProgressLine value={progress} compact />

      {loading ? (
        <div className="flex justify-center py-4">
          <Spinner className="size-5" />
        </div>
      ) : fonts.length === 0 ? (
        <p className="text-muted-foreground text-xs">{NS.fonts.empty}</p>
      ) : (
        <ul className="space-y-2">
          {fonts.map((font) => (
            <FontRow
              key={font.id}
              font={font}
              lang={lang}
              sample={sample}
              active={font.url === activeUrl}
              activating={activating}
              onActivate={() => activate(font)}
              onDeactivate={deactivate}
              onRemove={() =>
                deleteMut.mutate(font.id, {
                  onSuccess: () => toast.success(NS.fonts.toast.removed),
                  onError: (err) =>
                    toast.error(
                      extractApiErrorMessage(err) ?? NS.error.generic,
                    ),
                })
              }
            />
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * One library entry. The font's own name is rendered in the font itself —
 * loaded through the same-origin proxy because the bucket sends no CORS and
 * CSP is `font-src 'self'`.
 */
function FontRow({
  font,
  lang,
  sample,
  active,
  activating,
  onActivate,
  onDeactivate,
  onRemove,
}: {
  font: SiteFontDto
  lang: SiteFontLanguage
  sample: string
  active: boolean
  activating: boolean
  onActivate: () => void
  onDeactivate: () => void
  onRemove: () => void
}) {
  const family = `khi-fontlib-${font.id}`
  const faceCss = `@font-face{font-family:"${family}";src:url("/api/site-font?src=${encodeURIComponent(font.url)}")${fontFormatHint(font.url)};font-display:swap}`

  return (
    <li
      className={cn(
        "border-border/60 space-y-2 rounded-md border p-2.5",
        active && "border-primary/60 bg-primary/5",
      )}
    >
      <style dangerouslySetInnerHTML={{ __html: faceCss }} />
      <div className="flex items-center gap-2">
        <span
          className="min-w-0 flex-1 truncate text-base"
          style={{ fontFamily: `"${family}"` }}
          dir={lang === "CKB" ? "rtl" : "ltr"}
          lang={lang === "CKB" ? "ckb" : "ku"}
        >
          {font.name} · {sample}
        </span>
        <span className="text-muted-foreground shrink-0 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
          {fontExt(font.url)}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {active ? (
          <>
            <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium">
              <CheckIcon className="size-3" aria-hidden />
              {NS.fonts.active}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              disabled={activating}
              onClick={onDeactivate}
            >
              {NS.fonts.deactivate}
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            disabled={activating}
            onClick={onActivate}
          >
            {NS.fonts.activate}
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive ms-auto size-7"
          onClick={onRemove}
          aria-label={NS.fonts.remove}
        >
          <TrashIcon className="size-4" aria-hidden />
        </Button>
      </div>
    </li>
  )
}
