"use client"

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { useRef, useState } from "react"
import {
  Controller,
  useForm,
  type Control,
  type Resolver,
  type UseFormSetValue,
} from "react-hook-form"
import { toast } from "sonner"

import { NS } from "@/components/settings/settings-strings"
import { MediaCoverUpload } from "@/components/shared/media-cover-upload"
import { UploadProgressLine } from "@/components/shared/upload-progress-line"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useServerFormSync } from "@/hooks/use-server-form-sync"
import {
  useSiteSettingsQuery,
  useUpdateSiteSettingsMutation,
} from "@/hooks/useSiteSettings"
import { uploadMedia } from "@/services/mediaService"
import { permissiveResolver } from "@/lib/permissive-resolver"
import { extractApiErrorMessage } from "@/lib/api-error"
import { cn } from "@/lib/utils"
import {
  defaultSiteSettingsValues,
  formValuesToSiteSettingsPayload,
  isOffSiteMediaHost,
  siteSettingsDtoToFormValues,
  siteSettingsSchema,
  type SiteSettingsFormValues,
} from "@/lib/validations/site-settings"
import type { SiteSettingsDto } from "@/types/site-settings"

export function BrandingPanel() {
  const settingsQ = useSiteSettingsQuery()
  const updateMut = useUpdateSiteSettingsMutation()

  if (settingsQ.isError) {
    return (
      <div className="border-border text-muted-foreground flex flex-col items-center gap-3 rounded-xl border border-dashed py-14 text-center">
        <p className="text-sm">{NS.error.generic}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void settingsQ.refetch()}
        >
          {NS.error.retry}
        </Button>
      </div>
    )
  }

  return (
    <BrandingForm
      settingsDto={settingsQ.data}
      isLoading={settingsQ.isLoading}
      pending={updateMut.isPending}
      onSave={(payload) =>
        updateMut.mutate(payload, {
          onSuccess: () => toast.success(NS.toast.saved),
          onError: (err) => {
            // `403` comes back with an empty body — this endpoint is ADMIN and
            // up — so it needs its own copy rather than degrading into a
            // generic failure.
            const status = (err as { response?: { status?: number } })?.response
              ?.status
            toast.error(
              status === 403
                ? NS.error.forbidden
                : (extractApiErrorMessage(err) ?? NS.error.generic),
            )
          },
        })
      }
    />
  )
}

function BrandingForm({
  settingsDto,
  isLoading,
  pending,
  onSave,
}: {
  settingsDto?: SiteSettingsDto
  isLoading?: boolean
  pending?: boolean
  onSave: (payload: ReturnType<typeof formValuesToSiteSettingsPayload>) => void
}) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { isDirty, errors },
  } = useForm<SiteSettingsFormValues>({
    resolver: permissiveResolver(siteSettingsSchema) as Resolver<SiteSettingsFormValues>,
    defaultValues: defaultSiteSettingsValues(),
    mode: "onChange",
  })

  useServerFormSync({
    signature: isLoading
      ? null
      : `${settingsDto?.id ?? "none"}:${settingsDto?.updatedAt ?? ""}`,
    buildValues: () =>
      settingsDto
        ? siteSettingsDtoToFormValues(settingsDto)
        : defaultSiteSettingsValues(),
    reset,
    isDirty,
  })

  const logoUrl = watch("logoUrl")
  const donateImageUrl = watch("donateImageUrl")

  const canSave = isDirty && !pending

  const onSubmit = handleSubmit((values) => {
    onSave(formValuesToSiteSettingsPayload(values))
    reset(values)
  })

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="border-border/60 bg-card/50 space-y-4 rounded-xl border p-5 shadow-xs">
        <div>
          <h2 className="inline-flex items-center gap-2 text-base font-semibold before:h-4 before:w-1 before:rounded-full before:bg-primary/70 before:content-['']">{NS.logo.label}</h2>
          <p className="text-muted-foreground text-sm">{NS.logo.hint}</p>
        </div>

        <p className="flex gap-2 text-xs leading-relaxed text-amber-600 dark:text-amber-400">
          <ExclamationTriangleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{NS.logo.warning}</span>
        </p>

        <Controller
          control={control}
          name="logoUrl"
          render={({ field }) => (
            <div className="space-y-3">
              <MediaCoverUpload
                label={NS.logo.label}
                aspectClass="aspect-square"
                helperText={NS.logo.hint}
                previewUrl={field.value || null}
                urlValue={field.value}
                onUrlChange={field.onChange}
                urlError={errors.logoUrl?.message}
              />
              <LogoContrastPreview url={logoUrl} />
              <OffHostNote url={logoUrl} />
            </div>
          )}
        />
      </section>

      <section className="border-border/60 bg-card/50 space-y-4 rounded-xl border p-5 shadow-xs">
        <div>
          <h2 className="inline-flex items-center gap-2 text-base font-semibold before:h-4 before:w-1 before:rounded-full before:bg-primary/70 before:content-['']">{NS.donate.label}</h2>
          <p className="text-muted-foreground text-sm">{NS.donate.hint}</p>
        </div>

        <p className="flex gap-2 text-xs leading-relaxed text-amber-600 dark:text-amber-400">
          <ExclamationTriangleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{NS.donate.warning}</span>
        </p>

        <Controller
          control={control}
          name="donateImageUrl"
          render={({ field }) => (
            <div className="space-y-3">
              <MediaCoverUpload
                label={NS.donate.label}
                aspectClass="aspect-[4/3]"
                helperText={NS.donate.hint}
                previewUrl={field.value || null}
                urlValue={field.value}
                onUrlChange={field.onChange}
                urlError={errors.donateImageUrl?.message}
              />
              <DonateBandPreview url={donateImageUrl} />
              <OffHostNote url={donateImageUrl} />
            </div>
          )}
        />
      </section>

      <section className="border-border/60 bg-card/50 space-y-4 rounded-xl border p-5 shadow-xs">
        <div>
          <h2 className="inline-flex items-center gap-2 text-base font-semibold before:h-4 before:w-1 before:rounded-full before:bg-primary/70 before:content-['']">{NS.fonts.title}</h2>
          <p className="text-muted-foreground text-sm">{NS.fonts.hint}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <FontSlot
            lang="ckb"
            title={NS.fonts.ckb.label}
            sample={NS.fonts.ckb.sample}
            dir="rtl"
            control={control}
            setValue={setValue}
            getName={() => getValues("ckbFontName")}
          />
          <FontSlot
            lang="kmr"
            title={NS.fonts.kmr.label}
            sample={NS.fonts.kmr.sample}
            dir="ltr"
            control={control}
            setValue={setValue}
            getName={() => getValues("kmrFontName")}
          />
        </div>
      </section>

      <section className="border-border/60 bg-card/50 space-y-4 rounded-xl border p-5 shadow-xs">
        <div>
          <h2 className="inline-flex items-center gap-2 text-base font-semibold before:h-4 before:w-1 before:rounded-full before:bg-primary/70 before:content-['']">{NS.slides.label}</h2>
          <p className="text-muted-foreground text-sm">{NS.slides.hint}</p>
        </div>

        <Controller
          control={control}
          name="maxFeaturedSlides"
          render={({ field }) => (
            <div className="max-w-40 space-y-1.5">
              <Label htmlFor="maxFeaturedSlides" className="sr-only">
                {NS.slides.label}
              </Label>
              <Input
                id="maxFeaturedSlides"
                type="number"
                inputMode="numeric"
                value={Number.isFinite(field.value) ? field.value : ""}
                // Kept as a number in form state so the zod `int()` rule sees a
                // number rather than a numeric string. An emptied box becomes
                // NaN, which the schema maps to "leave the stored value alone"
                // rather than silently saving 0.
                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                onBlur={field.onBlur}
                className="font-mono tabular-nums"
              />
              {errors.maxFeaturedSlides?.message ? (
                <p className="text-destructive text-xs" role="alert">
                  {errors.maxFeaturedSlides.message}
                </p>
              ) : null}
            </div>
          )}
        />
      </section>

      <p className="text-muted-foreground text-xs">{NS.emptyOk}</p>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={!canSave}>
          {pending ? <Spinner className="me-2 size-4" aria-hidden /> : null}
          {pending ? NS.action.saving : NS.action.save}
        </Button>
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "ghost" }), "rounded-md")}
        >
          {NS.action.back}
        </Link>
      </div>
    </form>
  )
}

/**
 * The logo on both grounds it actually lands on. A white box baked into a
 * "transparent" PNG is invisible against the cream header and obvious against
 * the near-black footer, and one preview on one background cannot show that.
 * The two colours approximate the website's header and footer.
 */
function LogoContrastPreview({ url }: { url: string }) {
  const src = url.trim()
  if (!src || !/^https:\/\//i.test(src)) {
    return <p className="text-muted-foreground text-xs">{NS.logo.empty}</p>
  }
  const swatches = [
    { label: NS.logo.preview.header, className: "bg-[#F3EEE2]" },
    { label: NS.logo.preview.footer, className: "bg-[#14110E]" },
  ]
  return (
    <div className="grid grid-cols-2 gap-3">
      {swatches.map((swatch) => (
        <div key={swatch.label} className="space-y-1.5">
          <div
            className={cn(
              "border-border flex h-24 items-center justify-center rounded-lg border",
              swatch.className,
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className="size-16 object-contain"
              loading="lazy"
            />
          </div>
          <p className="text-muted-foreground text-center text-xs">
            {swatch.label}
          </p>
        </div>
      ))}
    </div>
  )
}

/**
 * The donate band's two treatments of one file — sharp in the panel, blurred
 * behind it. Editors otherwise expect a second field for the blurred copy.
 */
function DonateBandPreview({ url }: { url: string }) {
  const src = url.trim()
  if (!src || !/^https:\/\//i.test(src)) {
    return <p className="text-muted-foreground text-xs">{NS.donate.empty}</p>
  }
  return (
    <div className="space-y-1.5">
      <div className="border-border relative h-36 overflow-hidden rounded-lg border bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="absolute inset-0 size-full scale-110 object-cover blur-md"
          loading="lazy"
        />
        <div className="absolute inset-y-3 start-6 end-6 overflow-hidden rounded-md [clip-path:polygon(6%_0,100%_0,94%_100%,0_100%)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className="size-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
      <p className="text-muted-foreground text-center text-xs">
        {NS.donate.preview.sharp} + {NS.donate.preview.blurred}
      </p>
    </div>
  )
}

/** Font families for the live previews — fixed, never user-derived. */
const PREVIEW_FAMILY = { ckb: "khi-preview-ckb", kmr: "khi-preview-kmr" } as const

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

/**
 * One language slot of the site-fonts card: pick a font file → it uploads
 * through the normal media pipeline → the URL lands in the hidden form field
 * and a live preview renders via the same-origin font proxy (the bucket sends
 * no CORS headers and CSP is `font-src 'self'`).
 */
function FontSlot({
  lang,
  title,
  sample,
  dir,
  control,
  setValue,
  getName,
}: {
  lang: "ckb" | "kmr"
  title: string
  sample: string
  dir: "rtl" | "ltr"
  control: Control<SiteSettingsFormValues>
  setValue: UseFormSetValue<SiteSettingsFormValues>
  getName: () => string
}) {
  const urlField = `${lang}FontUrl` as const
  const nameField = `${lang}FontName` as const
  const fileRef = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<number | null>(null)

  async function handleFile(file: File) {
    setProgress(0)
    try {
      const result = await uploadMedia(file, "document", setProgress)
      setValue(urlField, result.fileUrl, { shouldDirty: true })
      if (!getName().trim()) {
        setValue(nameField, file.name.replace(/\.[^.]+$/, ""), {
          shouldDirty: true,
        })
      }
    } catch (err) {
      toast.error(extractApiErrorMessage(err) ?? NS.fonts.uploadFailed)
    } finally {
      setProgress(null)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  return (
    <Controller
      control={control}
      name={urlField}
      render={({ field }) => {
        const url = field.value.trim()
        const faceCss = url
          ? `@font-face{font-family:"${PREVIEW_FAMILY[lang]}";src:url("/api/site-font?src=${encodeURIComponent(url)}")${fontFormatHint(url)};font-weight:100 900;font-display:swap}`
          : null
        return (
          <div className="border-border/60 space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-sm font-medium">{title}</Label>
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

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={progress != null}
                onClick={() => fileRef.current?.click()}
              >
                {progress != null
                  ? NS.fonts.uploading
                  : url
                    ? NS.fonts.replace
                    : NS.fonts.upload}
              </Button>
              {url ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    setValue(urlField, "", { shouldDirty: true })
                    setValue(nameField, "", { shouldDirty: true })
                  }}
                >
                  {NS.fonts.clear}
                </Button>
              ) : null}
            </div>
            <UploadProgressLine value={progress} compact />

            {url ? (
              <>
                {faceCss ? (
                  <style dangerouslySetInnerHTML={{ __html: faceCss }} />
                ) : null}
                <div
                  dir={dir}
                  lang={lang === "ckb" ? "ckb" : "ku"}
                  className="border-border/60 bg-muted/30 rounded-md border px-3 py-2.5 text-lg leading-relaxed"
                  style={{ fontFamily: `"${PREVIEW_FAMILY[lang]}"` }}
                >
                  {sample}
                </div>

                <Controller
                  control={control}
                  name={nameField}
                  render={({ field: nameF }) => (
                    <div className="space-y-1">
                      <Label
                        htmlFor={nameField}
                        className="text-muted-foreground text-xs"
                      >
                        {NS.fonts.nameLabel}
                      </Label>
                      <Input
                        id={nameField}
                        value={nameF.value}
                        onChange={nameF.onChange}
                        onBlur={nameF.onBlur}
                        placeholder={NS.fonts.namePlaceholder}
                        className="h-8 text-sm"
                      />
                    </div>
                  )}
                />
              </>
            ) : (
              <p className="text-muted-foreground text-xs">{NS.fonts.empty}</p>
            )}
            <OffHostNote url={url} fallback={NS.fonts.offHost} />
          </div>
        )
      }}
    />
  )
}

/** The API stores an off-bucket URL happily; the website will not show it yet. */
function OffHostNote({ url, fallback }: { url: string; fallback?: string }) {
  if (!isOffSiteMediaHost(url)) return null
  return (
    <p className="text-xs leading-relaxed text-amber-600 dark:text-amber-400">
      {fallback ?? NS.offHost}
    </p>
  )
}
