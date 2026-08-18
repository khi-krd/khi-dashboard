"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { useEffect, useRef } from "react"
import { Controller, useForm, type Resolver } from "react-hook-form"
import { toast } from "sonner"

import { NS } from "@/components/settings/settings-strings"
import { MediaCoverUpload } from "@/components/shared/media-cover-upload"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  useSiteSettingsQuery,
  useUpdateSiteSettingsMutation,
} from "@/hooks/useSiteSettings"
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
import {
  MAX_MAX_FEATURED_SLIDES,
  MIN_MAX_FEATURED_SLIDES,
  type SiteSettingsDto,
} from "@/types/site-settings"

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
  const bootstrapped = useRef(false)

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty, errors },
  } = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsSchema) as Resolver<SiteSettingsFormValues>,
    defaultValues: defaultSiteSettingsValues(),
    mode: "onChange",
  })

  useEffect(() => {
    bootstrapped.current = false
  }, [settingsDto?.id])

  useEffect(() => {
    if (bootstrapped.current) return
    if (isLoading) return
    bootstrapped.current = true
    reset(
      settingsDto
        ? siteSettingsDtoToFormValues(settingsDto)
        : defaultSiteSettingsValues(),
    )
  }, [settingsDto, isLoading, reset])

  const logoUrl = watch("logoUrl")
  const donateImageUrl = watch("donateImageUrl")

  const canSave = isDirty && !pending

  const onSubmit = handleSubmit((values) => {
    onSave(formValuesToSiteSettingsPayload(values))
    reset(values)
  })

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="border-border/60 space-y-4 rounded-xl border p-5">
        <div>
          <h2 className="text-base font-semibold">{NS.logo.label}</h2>
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

      <section className="border-border/60 space-y-4 rounded-xl border p-5">
        <div>
          <h2 className="text-base font-semibold">{NS.donate.label}</h2>
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

      <section className="border-border/60 space-y-4 rounded-xl border p-5">
        <div>
          <h2 className="text-base font-semibold">{NS.slides.label}</h2>
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
                min={MIN_MAX_FEATURED_SLIDES}
                max={MAX_MAX_FEATURED_SLIDES}
                value={Number.isFinite(field.value) ? field.value : ""}
                // Kept as a number in form state so the zod `int()` rule sees a
                // number rather than a numeric string. An emptied box becomes
                // NaN, which fails validation rather than silently saving 0.
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

/** The API stores an off-bucket URL happily; the website will not show it yet. */
function OffHostNote({ url }: { url: string }) {
  if (!isOffSiteMediaHost(url)) return null
  return (
    <p className="text-xs leading-relaxed text-amber-600 dark:text-amber-400">
      {NS.offHost}
    </p>
  )
}
