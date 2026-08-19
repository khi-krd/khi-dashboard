"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  CheckIcon,
  ChevronDownIcon,
  LockClosedIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { useEffect, useRef, useState } from "react"
import {
  Controller,
  FormProvider,
  useForm,
  type Resolver,
} from "react-hook-form"

import { NavMenuLinksEditor } from "@/components/menu/nav-menu-links-editor"
import { NM, truncateLabel } from "@/components/menu/nav-menu-strings"
import { MediaCoverUpload } from "@/components/shared/media-cover-upload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  useCreateNavMenuItem,
  useUpdateNavMenuItem,
} from "@/hooks/useNavMenu"
import { extractApiErrorMessage } from "@/lib/api-error"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { navMenuFormValuesToPayload } from "@/lib/nav-menu-form-data"
import { toastError, toastSuccess } from "@/lib/toast"
import { cn } from "@/lib/utils"
import {
  defaultNavMenuItemValues,
  navMenuItemDtoToFormValues,
  navMenuItemSchema,
  type NavMenuItemFormValues,
} from "@/lib/validations/nav-menu"
import { isDerivedLinksKey, type NavMenuItemDto } from "@/types/nav-menu"

const sectionCard =
  "rounded-xl border border-border/60 bg-card/50 p-5 shadow-xs"

const sectionHeading =
  "inline-flex items-center gap-2 text-sm font-semibold text-foreground before:h-3.5 before:w-1 before:rounded-full before:bg-primary/70 before:content-['']"

/**
 * §3.6 — a `403` comes back with an empty body, so `extractApiErrorMessage`
 * finds nothing to read and the toast needs its own copy. `409` does carry a
 * body, but its `messageEn` is the bare word "Conflict"; the duplicate-key case
 * is the only way this endpoint conflicts, so naming it is more useful.
 */
function navMenuErrorMessage(err: unknown): string {
  const status = (err as { response?: { status?: number } })?.response?.status
  if (status === 403) return NM.error.forbidden
  if (status === 409) return NM.error.duplicateKey
  return extractApiErrorMessage(err) ?? NM.error.generic
}

export function NavMenuItemCard({
  index,
  dto,
  nextDisplayOrder,
  defaultOpen = false,
  onSaved,
  onDelete,
  onDiscard,
}: {
  index: number
  dto?: NavMenuItemDto
  nextDisplayOrder: number
  defaultOpen?: boolean
  onSaved: () => void
  onDelete?: () => void
  /** Only passed for unsaved draft cards. */
  onDiscard?: () => void
}) {
  const mode = dto?.id ? "edit" : "create"
  const itemId = dto?.id ?? null
  const createMut = useCreateNavMenuItem()
  const updateMut = useUpdateNavMenuItem()
  const [open, setOpen] = useState(defaultOpen || mode === "create")
  const bootstrapped = useRef(false)

  const methods = useForm<NavMenuItemFormValues>({
    resolver: zodResolver(navMenuItemSchema) as Resolver<NavMenuItemFormValues>,
    defaultValues: defaultNavMenuItemValues(nextDisplayOrder),
    mode: "onChange",
  })

  const {
    control,
    handleSubmit,
    register,
    reset,
    watch,
    formState: { isDirty, errors },
  } = methods

  useEffect(() => {
    if (bootstrapped.current) return
    bootstrapped.current = true
    reset(
      dto
        ? navMenuItemDtoToFormValues(dto)
        : defaultNavMenuItemValues(nextDisplayOrder),
    )
  }, [dto, nextDisplayOrder, reset])

  const pending = createMut.isPending || updateMut.isPending
  const itemKey = watch("itemKey") ?? ""
  const labelCkb = watch("labelCkb") ?? ""
  const active = watch("active")

  const onSubmit = handleSubmit(
    (values) => {
      const payload = navMenuFormValuesToPayload(values)

      const handleSuccess = (created: boolean) => {
        toastSuccess(created ? NM.toast.created : NM.toast.saved)
        onSaved()
      }
      const handleError = (err: unknown) => toastError(navMenuErrorMessage(err))

      if (mode === "create") {
        createMut.mutate(payload, {
          onSuccess: () => handleSuccess(true),
          onError: handleError,
        })
      } else if (itemId) {
        updateMut.mutate(
          { id: itemId, payload },
          { onSuccess: () => handleSuccess(false), onError: handleError },
        )
      }
    },
    () => toastError(NM.error.validation),
  )

  const headerLabel = truncateLabel(labelCkb || dto?.labelCkb || "", 60)
  const derived = isDerivedLinksKey(itemKey)
  // Rule 5: the key is the join between this row and the website's automatic
  // secondary links, so it is fixed once the row exists.
  const keyLocked = mode === "edit"

  return (
    <section className="bg-card/50 rounded-lg border border-border/60 shadow-xs">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-3 text-start"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <ChevronDownIcon
            className={cn(
              "text-muted-foreground size-4 shrink-0 transition-transform",
              !open && "-rotate-90 rtl:rotate-90",
            )}
            aria-hidden
          />
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs">
              {NM.page.itemLabel(formatCkbDigits(index + 1))}
              {itemKey ? (
                <span className="font-mono" dir="ltr">
                  {" · "}
                  {itemKey}
                </span>
              ) : null}
            </p>
            <p className="truncate text-sm font-medium">
              {headerLabel || NM.dash}
            </p>
          </div>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          {!active ? (
            <span className="text-muted-foreground bg-muted rounded-full px-2 py-0.5 text-xs">
              {NM.field.active}
              {": "}
              {NM.dash}
            </span>
          ) : null}
          {onDelete ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={onDelete}
              aria-label={NM.action.delete}
            >
              <TrashIcon className="size-4" />
            </Button>
          ) : null}
          {onDiscard ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onDiscard}
            >
              {NM.action.cancel}
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
            {pending ? NM.action.saving : NM.action.save}
          </Button>
        </div>
      </div>

      {open ? (
        <FormProvider {...methods}>
          <div className="space-y-5 border-t px-4 py-4">
            <div
              className={cn(
                "grid gap-4 md:grid-cols-[200px_1fr_120px]",
                sectionCard,
              )}
            >
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">
                  {NM.field.itemKey}
                </Label>
                <div className="relative">
                  <Input
                    dir="ltr"
                    readOnly={keyLocked}
                    placeholder={NM.field.itemKeyPlaceholder}
                    className={cn(
                      "font-mono text-xs",
                      keyLocked && "bg-muted cursor-not-allowed pe-8",
                    )}
                    {...register("itemKey")}
                  />
                  {keyLocked ? (
                    <LockClosedIcon
                      className="text-muted-foreground pointer-events-none absolute end-2 top-1/2 size-3.5 -translate-y-1/2"
                      aria-hidden
                    />
                  ) : null}
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {keyLocked ? NM.field.itemKeyLocked : NM.field.itemKeyHint}
                </p>
                {errors.itemKey ? (
                  <p className="text-destructive text-xs">
                    {errors.itemKey.message === "item_key_format"
                      ? NM.error.itemKeyFormat
                      : NM.error.required}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">
                  {NM.field.href}
                </Label>
                <Input
                  dir="ltr"
                  placeholder={NM.field.hrefPlaceholder}
                  className="font-mono text-xs"
                  {...register("href")}
                />
                {errors.href ? (
                  <p className="text-destructive text-xs">
                    {errors.href.message === "href_relative"
                      ? NM.error.hrefRelative
                      : NM.error.required}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-xs">
                  {NM.field.displayOrder}
                </Label>
                <Input
                  type="number"
                  min={0}
                  dir="ltr"
                  className="font-mono text-xs"
                  {...register("displayOrder", {
                    // `valueAsNumber` turns an emptied field into NaN, which
                    // fails the schema and blocks the save behind a generic
                    // toast. Treat "cleared" as 0 instead.
                    setValueAs: (v) => {
                      const n = Number(v)
                      return Number.isFinite(n) ? n : 0
                    },
                  })}
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className={cn("space-y-3", sectionCard)}>
                <p className={sectionHeading}>{NM.lang.ckb}</p>
                <Input
                  placeholder={NM.field.labelCkb}
                  className="h-10"
                  {...register("labelCkb")}
                />
                <Textarea
                  rows={4}
                  placeholder={NM.field.descriptionCkb}
                  className="min-h-[100px] resize-y text-sm"
                  {...register("descriptionCkb")}
                />
              </div>
              <div className={cn("space-y-3", sectionCard)}>
                <p className={sectionHeading}>{NM.lang.kmr}</p>
                <Input
                  placeholder={NM.field.labelKmr}
                  className="h-10"
                  {...register("labelKmr")}
                />
                <Textarea
                  rows={4}
                  placeholder={NM.field.descriptionKmr}
                  className="min-h-[100px] resize-y text-sm"
                  {...register("descriptionKmr")}
                />
              </div>
            </div>

            <div className={sectionCard}>
              <Controller
                name="imageUrl"
                control={control}
                render={({ field }) => (
                  <MediaCoverUpload
                    label={NM.field.image}
                    previewUrl={field.value ?? ""}
                    urlValue={field.value ?? ""}
                    onUrlChange={field.onChange}
                    helperText={NM.field.imageHint}
                    aspectClass="aspect-[21/9]"
                  />
                )}
              />
            </div>

            <div className={cn("flex items-center gap-2", sectionCard)}>
              <Controller
                name="active"
                control={control}
                render={({ field }) => (
                  <Switch
                    id={`nav-menu-active-${itemId ?? `draft-${index}`}`}
                    checked={field.value !== false}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <div className="space-y-0.5">
                <Label
                  htmlFor={`nav-menu-active-${itemId ?? `draft-${index}`}`}
                  className="cursor-pointer text-sm font-medium"
                >
                  {NM.field.active}
                </Label>
                <p className="text-muted-foreground text-xs">
                  {NM.field.activeHint}
                </p>
              </div>
            </div>

            <div className={sectionCard}>
              <NavMenuLinksEditor derivedKey={derived} />
            </div>
          </div>
        </FormProvider>
      ) : null}
    </section>
  )
}
