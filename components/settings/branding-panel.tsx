"use client"

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import {
  Controller,
  useForm,
  type Control,
  type Resolver,
} from "react-hook-form"
import { toast } from "sonner"

import { NS } from "@/components/settings/settings-strings"
import { FontLibrary } from "@/components/settings/font-library"
import { MediaCoverUpload } from "@/components/shared/media-cover-upload"
import { SectionSaveButton } from "@/components/shared/section-save-button"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useServerFormSync } from "@/hooks/use-server-form-sync"
import {
  useSiteSettingsQuery,
  useUpdateSiteSettingsMutation,
} from "@/hooks/useSiteSettings"
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

  // Every card is one site-settings form behind a full-replace PUT, so a
  // section button just submits the whole form — it saves a scroll to the
  // bottom after touching one card.
  const sectionSave = (
    <SectionSaveButton
      disabled={!canSave}
      pending={pending}
      label={NS.action.save}
      pendingLabel={NS.action.saving}
    />
  )

  const onSubmit = handleSubmit((values) => {
    onSave(formValuesToSiteSettingsPayload(values))
    reset(values)
  })

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="border-border/60 bg-card/50 space-y-4 rounded-xl border p-5 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="inline-flex items-center gap-2 text-base font-semibold before:h-4 before:w-1 before:rounded-full before:bg-primary/70 before:content-['']">{NS.logo.label}</h2>
            <p className="text-muted-foreground text-sm">{NS.logo.hint}</p>
          </div>
          {sectionSave}
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
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="inline-flex items-center gap-2 text-base font-semibold before:h-4 before:w-1 before:rounded-full before:bg-primary/70 before:content-['']">{NS.donate.label}</h2>
            <p className="text-muted-foreground text-sm">{NS.donate.hint}</p>
          </div>
          {sectionSave}
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
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="inline-flex items-center gap-2 text-base font-semibold before:h-4 before:w-1 before:rounded-full before:bg-primary/70 before:content-['']">{NS.colors.title}</h2>
            <p className="text-muted-foreground text-sm">{NS.colors.hint}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                for (const name of [
                  "bodyColor",
                  "navbarColor",
                  "footerColor",
                  "collectionColor",
                ] as const) {
                  setValue(name, "", { shouldDirty: true })
                }
              }}
            >
              {NS.colors.resetAll}
            </Button>
            {sectionSave}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <ColorField
            control={control}
            name="bodyColor"
            label={NS.colors.body}
            defaultHex="#F7F4EC"
          />
          <ColorField
            control={control}
            name="navbarColor"
            label={NS.colors.navbar}
            defaultHex="#F7F4EC"
          />
          <ColorField
            control={control}
            name="footerColor"
            label={NS.colors.footer}
            defaultHex="#0F2A1C"
          />
          <ColorField
            control={control}
            name="collectionColor"
            label={NS.colors.collection}
            defaultHex="#1A1813"
          />
        </div>
      </section>

      <section className="border-border/60 bg-card/50 space-y-4 rounded-xl border p-5 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="inline-flex items-center gap-2 text-base font-semibold before:h-4 before:w-1 before:rounded-full before:bg-primary/70 before:content-['']">{NS.sizes.title}</h2>
            <p className="text-muted-foreground text-sm">{NS.sizes.hint}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                for (const name of [
                  "titleFontScale",
                  "bodyFontScale",
                  "captionFontScale",
                  "navFontScale",
                ] as const) {
                  setValue(name, "", { shouldDirty: true })
                }
              }}
            >
              {NS.sizes.resetAll}
            </Button>
            {sectionSave}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ScaleField
            control={control}
            name="titleFontScale"
            label={NS.sizes.titleField}
            basePx={28}
            options={[20, 22, 24, 26, 28, 32, 36, 40, 44, 48]}
          />
          <ScaleField
            control={control}
            name="bodyFontScale"
            label={NS.sizes.bodyField}
            basePx={17}
            options={[14, 15, 16, 17, 18, 19, 20, 22, 24]}
          />
          <ScaleField
            control={control}
            name="captionFontScale"
            label={NS.sizes.captionField}
            basePx={14}
            options={[10, 11, 12, 13, 14, 15, 16, 18]}
          />
          <ScaleField
            control={control}
            name="navFontScale"
            label={NS.sizes.navField}
            basePx={17}
            options={[14, 15, 16, 17, 18, 19, 20, 22, 24]}
          />
        </div>
        <p className="text-muted-foreground text-[11px]">{NS.sizes.rangeHint}</p>
      </section>

      {/* The typeface library manages itself — activation writes site-settings
          directly, so it lives outside this form's save button. */}
      <FontLibrary />

      <section className="border-border/60 bg-card/50 space-y-4 rounded-xl border p-5 shadow-xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="inline-flex items-center gap-2 text-base font-semibold before:h-4 before:w-1 before:rounded-full before:bg-primary/70 before:content-['']">{NS.slides.label}</h2>
            <p className="text-muted-foreground text-sm">{NS.slides.hint}</p>
          </div>
          {sectionSave}
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

/**
 * One surface color row: a native color-picker swatch plus a hex text box.
 * Empty = the website's bundled token renders (the reset state).
 */
function ColorField({
  control,
  name,
  label,
  defaultHex,
}: {
  control: Control<SiteSettingsFormValues>
  name: "bodyColor" | "navbarColor" | "footerColor" | "collectionColor"
  label: string
  defaultHex: string
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const value = field.value.trim()
        // input[type=color] only understands #rrggbb — anything else (blank,
        // shorthand, a typo mid-edit) shows the surface's default swatch.
        const swatch = /^#[0-9a-f]{6}$/i.test(value) ? value : defaultHex
        return (
          <div className="border-border/60 space-y-2 rounded-lg border p-3">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor={name} className="text-sm font-medium">
                {label}
              </Label>
              <span className="text-muted-foreground text-[11px]">
                {value ? NS.colors.custom : NS.colors.defaultTag}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={swatch}
                onChange={(e) => field.onChange(e.target.value)}
                className="border-border h-9 w-12 shrink-0 cursor-pointer rounded-md border bg-transparent p-1"
                aria-label={label}
              />
              <Input
                id={name}
                dir="ltr"
                value={value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder={defaultHex}
                className="h-9 font-mono text-sm uppercase"
              />
              {value ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 shrink-0 text-xs"
                  onClick={() => field.onChange("")}
                >
                  {NS.colors.resetField}
                </Button>
              ) : null}
            </div>
          </div>
        )
      }}
    />
  )
}

/**
 * One type-scale row: a Word-style size combo — a box showing the px size
 * with a dropdown of sizes to pick, and free typing allowed (like Word's
 * font-size box). The form holds px; conversion to the API's percent lives
 * in the payload builder. Empty = the website's bundled size (the reset).
 */
function ScaleField({
  control,
  name,
  label,
  basePx,
  options,
}: {
  control: Control<SiteSettingsFormValues>
  name:
    | "titleFontScale"
    | "bodyFontScale"
    | "captionFontScale"
    | "navFontScale"
  label: string
  /** The group's bundled base size in px — what "default" means. */
  basePx: number
  /** Pickable px sizes, Word-style. */
  options: readonly number[]
}) {
  const listId = `${name}-size-list`
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const value = field.value.trim()
        const px = /^\d{1,3}$/.test(value) ? Number(value) : basePx
        return (
          <div className="border-border/60 space-y-2 rounded-lg border p-3">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor={name} className="text-sm font-medium">
                {label}
              </Label>
              <span className="text-muted-foreground text-[11px]">
                {value ? `${px}px` : NS.sizes.defaultTag}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                id={name}
                dir="ltr"
                inputMode="numeric"
                list={listId}
                value={value}
                placeholder={String(basePx)}
                onChange={field.onChange}
                onBlur={field.onBlur}
                className="h-9 font-mono text-sm"
              />
              <datalist id={listId}>
                {options.map((size) => (
                  <option key={size} value={size} />
                ))}
              </datalist>
              <span className="text-muted-foreground shrink-0 text-xs">px</span>
              {value ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 shrink-0 text-xs"
                  onClick={() => field.onChange("")}
                >
                  {NS.sizes.resetField}
                </Button>
              ) : null}
            </div>
            <p
              className="text-foreground overflow-hidden leading-snug whitespace-nowrap"
              style={{ fontSize: `${Math.min(34, Math.max(10, px))}px` }}
              aria-hidden
            >
              {NS.sizes.preview}
            </p>
          </div>
        )
      }}
    />
  )
}

/** The API stores an off-bucket URL happily; the website will not show it yet. */
function OffHostNote({ url }: { url: string }) {
  if (!isOffSiteMediaHost(url)) return null
  return (
    <p className="text-xs leading-relaxed text-amber-600 dark:text-amber-400">
      {NS.offHost}
    </p>
  )
}
