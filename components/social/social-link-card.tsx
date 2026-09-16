"use client"

import {
  ArrowTopRightOnSquareIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { useEffect, useRef } from "react"
import { Controller, useForm, type Resolver } from "react-hook-form"

import {
  SL,
  platformLabel,
  platformUrlHint,
} from "@/components/social/social-links-strings"
import { SocialPlatformIcon } from "@/components/social/social-platform-icon"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { useCreateSocialLink, useUpdateSocialLink } from "@/hooks/useSocialLinks"
import { permissiveResolver } from "@/lib/permissive-resolver"
import { extractApiErrorMessage } from "@/lib/api-error"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { socialLinkFormValuesToPayload } from "@/lib/social-links-form-data"
import { toastError, toastSuccess } from "@/lib/toast"
import { cn } from "@/lib/utils"
import {
  defaultSocialLinkValues,
  socialLinkDtoToFormValues,
  socialLinkSchema,
  type SocialLinkFormValues,
} from "@/lib/validations/social-links"
import {
  SOCIAL_PLATFORM_CATALOG,
  isWebsiteRenderedPlatform,
  normalizePlatformKey,
  type SocialLinkDto,
} from "@/types/social-links"

const sectionCard =
  "rounded-xl border border-border/60 bg-card/50 p-4 shadow-xs"

/**
 * §4 — a `403` comes back with an empty body, so `extractApiErrorMessage` finds
 * nothing to read and the toast needs its own copy. `409` does carry a body,
 * but its text is the generic "A record with this data already exists"; a
 * duplicate `platform` is the only way this endpoint conflicts (§7 rule 1), so
 * naming it — and saying what to do instead — is more useful.
 */
function socialLinkErrorMessage(err: unknown): string {
  const status = (err as { response?: { status?: number } })?.response?.status
  if (status === 403) return SL.error.forbidden
  if (status === 409) return SL.error.duplicatePlatform
  if (status === 404) return SL.error.notFound
  return extractApiErrorMessage(err) ?? SL.error.generic
}

export function SocialLinkCard({
  index,
  dto,
  nextDisplayOrder,
  takenPlatforms,
  onSaved,
  onDelete,
  onDiscard,
}: {
  index: number
  dto?: SocialLinkDto
  nextDisplayOrder: number
  /** Platforms already spoken for by *other* rows — §7 rule 1, one row each. */
  takenPlatforms: string[]
  onSaved: () => void
  onDelete?: () => void
  /** Only passed for unsaved draft cards. */
  onDiscard?: () => void
}) {
  const mode = dto?.id ? "edit" : "create"
  const rowId = dto?.id ?? null
  const createMut = useCreateSocialLink()
  const updateMut = useUpdateSocialLink()
  const bootstrapped = useRef(false)

  const {
    control,
    handleSubmit,
    register,
    reset,
    watch,
    formState: { isDirty, errors },
  } = useForm<SocialLinkFormValues>({
    resolver: permissiveResolver(socialLinkSchema) as Resolver<SocialLinkFormValues>,
    defaultValues: defaultSocialLinkValues(nextDisplayOrder),
    mode: "onChange",
  })

  useEffect(() => {
    if (bootstrapped.current) return
    bootstrapped.current = true
    reset(
      dto
        ? socialLinkDtoToFormValues(dto)
        : defaultSocialLinkValues(nextDisplayOrder),
    )
  }, [dto, nextDisplayOrder, reset])

  const pending = createMut.isPending || updateMut.isPending
  const platform = normalizePlatformKey(watch("platform") ?? "")
  const url = watch("url") ?? ""
  const active = watch("active")

  const onSubmit = handleSubmit(
    (values) => {
      const payload = socialLinkFormValuesToPayload(values)

      const handleSuccess = (created: boolean) => {
        toastSuccess(created ? SL.toast.created : SL.toast.saved)
        onSaved()
      }
      const handleError = (err: unknown) =>
        toastError(socialLinkErrorMessage(err))

      if (mode === "create") {
        createMut.mutate(payload, {
          onSuccess: () => handleSuccess(true),
          onError: handleError,
        })
      } else if (rowId) {
        updateMut.mutate(
          { id: rowId, payload },
          { onSuccess: () => handleSuccess(false), onError: handleError },
        )
      }
    },
    () => toastError(SL.error.validation),
  )

  // A row saved before the dashboard knew about a platform still has to render
  // its own value, so it is added to the picker alongside the catalog.
  const platformOptions = platform && !(SOCIAL_PLATFORM_CATALOG as readonly string[]).includes(platform)
    ? [platform, ...SOCIAL_PLATFORM_CATALOG]
    : [...SOCIAL_PLATFORM_CATALOG]

  const switchId = `social-active-${rowId ?? `draft-${index}`}`
  const invisibleOnSite = platform !== "" && !isWebsiteRenderedPlatform(platform)

  return (
    <section className="bg-card/50 rounded-lg border border-border/60 shadow-xs">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <SocialPlatformIcon
            platform={platform}
            className="text-muted-foreground size-5 shrink-0"
          />
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs">
              {SL.page.rowLabel(formatCkbDigits(index + 1))}
              {platform ? (
                <span className="font-mono" dir="ltr">
                  {" · "}
                  {platform}
                </span>
              ) : null}
            </p>
            <p className="truncate text-sm font-medium">
              {platform ? platformLabel(platform) : SL.dash}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {!active ? (
            <span className="text-muted-foreground bg-muted rounded-full px-2 py-0.5 text-xs">
              {SL.field.active}
              {": "}
              {SL.dash}
            </span>
          ) : null}
          {/^https?:\/\//i.test(url.trim()) ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
              aria-label={SL.action.open}
              render={
                <a
                  href={url.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <ArrowTopRightOnSquareIcon className="size-4 rtl:-scale-x-100" />
            </Button>
          ) : null}
          {onDelete ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={onDelete}
              aria-label={SL.action.delete}
            >
              <TrashIcon className="size-4" />
            </Button>
          ) : null}
          {onDiscard ? (
            <Button type="button" variant="ghost" size="sm" onClick={onDiscard}>
              {SL.action.cancel}
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            className="gap-1"
            disabled={pending || (mode === "edit" && !isDirty)}
            onClick={() => void onSubmit()}
          >
            {pending ? (
              <Spinner className="size-3.5" />
            ) : (
              <CheckIcon className="size-3.5" />
            )}
            {pending ? SL.action.saving : SL.action.save}
          </Button>
        </div>
      </div>

      <div className="space-y-4 px-4 py-4">
        <div className={cn("grid gap-4 md:grid-cols-[220px_1fr_110px]", sectionCard)}>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">
              {SL.field.platform}
            </Label>
            <Controller
              name="platform"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={(v) => field.onChange(String(v))}
                >
                  <SelectTrigger dir="rtl" className="h-9 w-full">
                    <SelectValue>
                      {field.value
                        ? platformLabel(String(field.value))
                        : SL.field.platformPlaceholder}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent dir="rtl">
                    {platformOptions.map((p) => {
                      const taken = takenPlatforms.includes(p)
                      return (
                        <SelectItem key={p} value={p} disabled={taken}>
                          <span className="flex items-center gap-2">
                            <SocialPlatformIcon
                              platform={p}
                              className="text-muted-foreground"
                            />
                            <span>{platformLabel(p)}</span>
                            {taken ? (
                              <span className="text-muted-foreground text-xs">
                                ({SL.field.platformUsed})
                              </span>
                            ) : null}
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.platform ? (
              <p className="text-destructive text-xs">
                {errors.platform.message === "platform_format"
                  ? SL.error.platformFormat
                  : SL.error.tooLong}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">
              {SL.field.url}
            </Label>
            <Input
              dir="ltr"
              inputMode="url"
              placeholder={platformUrlHint(platform)}
              className="h-9 font-mono text-xs"
              {...register("url")}
            />
            {errors.url ? (
              <p className="text-destructive text-xs">
                {errors.url.message === "url_absolute"
                  ? SL.error.urlAbsolute
                  : SL.error.tooLong}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">
              {SL.field.displayOrder}
            </Label>
            <Input
              type="number"
              dir="ltr"
              className="h-9 font-mono text-xs"
              {...register("displayOrder", {
                // `valueAsNumber` turns an emptied field into NaN, which fails
                // the schema and blocks the save behind a generic toast. Treat
                // "cleared" as 0 instead.
                setValueAs: (v) => {
                  const n = Number(v)
                  return Number.isFinite(n) ? n : 0
                },
              })}
            />
          </div>
        </div>

        {invisibleOnSite ? (
          <p className="text-muted-foreground border-border/60 bg-muted/40 flex items-start gap-2 rounded-lg border p-3 text-xs leading-relaxed">
            <ExclamationTriangleIcon
              className="mt-0.5 size-4 shrink-0"
              aria-hidden
            />
            <span>{SL.warn.notRendered}</span>
          </p>
        ) : null}

        <div className={cn("grid gap-4 md:grid-cols-2", sectionCard)}>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">
              {SL.field.labelCkb}
            </Label>
            <Input className="h-9" {...register("labelCkb")} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">
              {SL.field.labelKmr}
            </Label>
            <Input className="h-9" {...register("labelKmr")} />
          </div>
          <p className="text-muted-foreground text-xs md:col-span-2">
            {SL.field.labelHint}
          </p>
        </div>

        <div className={cn("flex items-center gap-2", sectionCard)}>
          <Controller
            name="active"
            control={control}
            render={({ field }) => (
              <Switch
                id={switchId}
                checked={field.value !== false}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <div className="space-y-0.5">
            <Label
              htmlFor={switchId}
              className="cursor-pointer text-sm font-medium"
            >
              {SL.field.active}
            </Label>
            <p className="text-muted-foreground text-xs">
              {SL.field.activeHint}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
