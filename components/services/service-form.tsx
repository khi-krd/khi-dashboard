"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  CheckIcon,
  ExclamationCircleIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import {
  Controller,
  FormProvider,
  useForm,
  type FieldErrors,
  type Resolver,
} from "react-hook-form"
import { toast } from "sonner"

import {
  ServiceBreadcrumbBar,
  dashboardServicesCrumbHref,
} from "@/components/services/service-breadcrumb"
import { ServiceActiveSwitch } from "@/components/services/service-active-switch"
import { ServiceFormPublishingSummary } from "@/components/services/service-form-publishing-summary"
import { ServiceFormSectionCard } from "@/components/services/service-form-section-card"
import { ServiceGalleryList } from "@/components/services/service-gallery-list"
import { ServicePartnersSelect } from "@/components/services/service-partners-select"
import { ServicePublishDateTime } from "@/components/services/service-publish-datetime"
import { ServiceTypeCombobox } from "@/components/services/service-type-combobox"
import { ServicesErrorState } from "@/components/services/services-error-state"
import { NS } from "@/components/services/services-strings"
import { TiptapEditor } from "@/components/shared/tiptap-editor-lazy"
import { Button, buttonVariants } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
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
import {
  useCreateService,
  useServiceDetailQuery,
  useServiceTypesQuery,
  useUpdateService,
} from "@/hooks/useServices"
import { serviceFormValuesToPayload } from "@/lib/services-form-data"
import { formatRelativeTimeKu } from "@/lib/news-relative-time"
import {
  defaultServiceFormValues,
  serviceDtoToFormValues,
  serviceFormSchema,
  type ServiceFormValues,
} from "@/lib/validations/services"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { toastError } from "@/lib/toast"
import { cn } from "@/lib/utils"
import {
  SERVICE_LAYOUT_TYPES,
  type Language,
  type ServiceLayoutType,
} from "@/types/services"

const borderlessTitleClass =
  "w-full border-0 bg-transparent px-0 text-4xl leading-tight font-bold shadow-none placeholder:text-muted-foreground/50 focus:ring-0 focus-visible:ring-0"

const LAYOUT_LABEL: Record<ServiceLayoutType, string> = {
  MEDIA_HERO: NS.layout.MEDIA_HERO,
  FEATURE_GRID: NS.layout.FEATURE_GRID,
  DEFAULT: NS.layout.DEFAULT,
}

function layoutHint(layout: ServiceLayoutType | null | undefined): string {
  if (layout === "MEDIA_HERO") return NS.layout.hintMediaHero
  if (layout === "FEATURE_GRID") return NS.layout.hintFeatureGrid
  return NS.layout.hintDefault
}

function countFormErrors(errors: FieldErrors): number {
  let n = 0
  for (const value of Object.values(errors)) {
    if (!value) continue
    if (typeof value === "object" && "message" in value && value.message) {
      n += 1
      continue
    }
    if (typeof value === "object") n += countFormErrors(value as FieldErrors)
  }
  return n
}

export function ServiceForm({
  mode,
  serviceId,
  variant = "page",
  initialSortOrder,
  onSaved,
  onCancel,
}: {
  mode: "create" | "edit"
  serviceId?: number
  variant?: "page" | "embedded"
  initialSortOrder?: number
  onSaved?: (id: number) => void
  onCancel?: () => void
}) {
  const router = useRouter()
  const isEmbedded = variant === "embedded"
  const detailQuery = useServiceDetailQuery(serviceId ?? 0)
  const typesQuery = useServiceTypesQuery()
  const createMut = useCreateService()
  const updateMut = useUpdateService()

  const [canvasLang, setCanvasLang] = useState<Language>("CKB")

  const methods = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema) as Resolver<ServiceFormValues>,
    defaultValues: defaultServiceFormValues(),
    mode: "onChange",
  })

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isDirty, isValid, errors },
  } = methods

  const dto = detailQuery.data?.success ? detailQuery.data.data : undefined

  useEffect(() => {
    if (mode === "edit" && dto) {
      reset(serviceDtoToFormValues(dto))
    }
  }, [mode, dto, reset])

  useEffect(() => {
    if (mode === "create") {
      reset({
        ...defaultServiceFormValues(),
        sortOrder:
          typeof initialSortOrder === "number" ? initialSortOrder : null,
      })
    }
  }, [mode, initialSortOrder, reset])

  const contentLanguages = watch("contentLanguages")
  const serviceType = watch("serviceType")
  const layoutType = watch("layoutType")
  const partnerIds = watch("partnerIds") ?? []

  const typeOptions = useMemo(() => {
    const set = new Set(typesQuery.data ?? [])
    if (serviceType?.trim()) set.add(serviceType.trim())
    return [...set].sort()
  }, [typesQuery.data, serviceType])

  const contentIndex = watch("contents").findIndex(
    (c) => c.languageCode === canvasLang,
  )
  const titlePath =
    contentIndex >= 0
      ? (`contents.${contentIndex}.title` as const)
      : "contents.0.title"
  const descPath =
    contentIndex >= 0
      ? (`contents.${contentIndex}.description` as const)
      : "contents.0.description"

  const errorCount = countFormErrors(errors)
  const pending = createMut.isPending || updateMut.isPending
  const submitDisabled = !isDirty || !isValid || pending

  const onSubmit = handleSubmit(
    (values) => {
      const payload = serviceFormValuesToPayload(mode, serviceId, values)
      const onSuccess = (res: {
        success?: boolean
        data?: { id?: number }
      }) => {
        if (!res.success) {
          toastError(NS.error.generic)
          return
        }
        toast(NS.toast.saved, {
          action:
            !isEmbedded && res.data?.id
              ? {
                  label: NS.toast.viewAction,
                  onClick: () =>
                    router.push(`/dashboard/services/${res.data!.id}`),
                }
              : undefined,
        })
        if (res.data?.id) {
          if (onSaved) {
            onSaved(res.data.id)
          } else if (mode === "create") {
            router.push(`/dashboard/services/${res.data.id}`)
          } else if (mode === "edit") {
            router.push(`/dashboard/services/${serviceId}`)
          }
        }
      }

      if (mode === "create") {
        createMut.mutate(payload, {
          onSuccess,
          onError: () => toastError(NS.error.generic),
        })
      } else if (serviceId) {
        updateMut.mutate(
          { id: serviceId, payload },
          {
            onSuccess,
            onError: () => toastError(NS.error.generic),
          },
        )
      }
    },
    () => {
      toastError(NS.error.validation)
    },
  )

  function handleCancel() {
    if (onCancel) {
      onCancel()
      return
    }
    router.push(
      mode === "edit" && serviceId
        ? `/dashboard/services/${serviceId}`
        : "/dashboard/services",
    )
  }

  if (mode === "edit" && detailQuery.isLoading) {
    return (
      <div dir="rtl" className="px-6 py-12">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (mode === "edit" && (detailQuery.isError || !dto)) {
    return (
      <div dir="rtl" className="px-6 py-12">
        <ServicesErrorState onRetry={() => void detailQuery.refetch()} />
        <Link
          href="/dashboard/services"
          className={buttonVariants({ className: "mt-4" })}
        >
          {NS.not_found.cta}
        </Link>
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={onSubmit}
        className={cn(isEmbedded ? "pb-20" : "pb-24")}
        dir="rtl"
      >
        {!isEmbedded ? (
          <header className="bg-background/95 supports-backdrop-filter:backdrop-blur border-border sticky top-0 z-30 border-b">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
              <ServiceBreadcrumbBar
                segments={[
                  {
                    label: NS.breadcrumb.dashboard,
                    href: dashboardServicesCrumbHref(),
                  },
                  {
                    label: NS.breadcrumb.services,
                    href: "/dashboard/services",
                  },
                  {
                    label:
                      mode === "create"
                        ? NS.breadcrumb.new
                        : NS.breadcrumb.edit,
                  },
                ]}
              />
              <Link
                href={
                  mode === "edit" && serviceId
                    ? `/dashboard/services/${serviceId}`
                    : "/dashboard/services"
                }
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                {NS.action.back}
              </Link>
            </div>
          </header>
        ) : (
          <div className="border-border bg-muted/20 border-b px-4 py-3">
            <h2 className="text-base font-semibold">
              {mode === "create"
                ? NS.page.panelTitleNew
                : NS.page.panelTitleEdit}
            </h2>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {NS.help.formIntro}
            </p>
          </div>
        )}

        <div
          dir="ltr"
          className={cn(
            "grid grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-8",
            isEmbedded ? "px-0 py-4" : "lg:px-6",
          )}
        >
          <aside
            dir="rtl"
            className="space-y-4 lg:sticky lg:top-20 lg:self-start"
          >
            <ServiceFormPublishingSummary />

            <ServiceFormSectionCard title={NS.section.visibility}>
              <Controller
                name="active"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center justify-between gap-2">
                    <ServiceActiveSwitch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      showLabel={false}
                    />
                    <span className="text-xs">
                      {field.value ? NS.active.on : NS.active.off}
                    </span>
                  </div>
                )}
              />
              <p className="text-muted-foreground text-xs">
                {NS.active.formHelper}
              </p>
            </ServiceFormSectionCard>

            <ServiceFormSectionCard title={NS.section.publish}>
              <Controller
                name="publishedAt"
                control={control}
                render={({ field }) => (
                  <ServicePublishDateTime
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <p className="text-muted-foreground text-xs">
                {NS.field.publishHelper}
              </p>
              <div className="mt-4 space-y-2">
                <Label className="text-xs">{NS.field.sortOrderLabel}</Label>
                <Controller
                  name="sortOrder"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      min={0}
                      dir="ltr"
                      className="font-mono"
                      placeholder="0"
                      value={
                        field.value === null || field.value === undefined
                          ? ""
                          : String(field.value)
                      }
                      onChange={(e) => {
                        const raw = e.target.value.trim()
                        field.onChange(raw === "" ? null : Number(raw))
                      }}
                    />
                  )}
                />
                <p className="text-muted-foreground text-xs">
                  {NS.field.sortOrderHelper}
                </p>
              </div>
            </ServiceFormSectionCard>

            {mode === "edit" && dto ? (
              <ServiceFormSectionCard title={NS.section.system}>
                <dl className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{NS.system.id}</dt>
                    <dd className="font-mono">#{dto.id}</dd>
                  </div>
                  {dto.createdAt ? (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">
                        {NS.system.createdAt}
                      </dt>
                      <dd>{formatRelativeTimeKu(dto.createdAt)}</dd>
                    </div>
                  ) : null}
                  {dto.updatedAt ? (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">
                        {NS.system.updatedAt}
                      </dt>
                      <dd>{formatRelativeTimeKu(dto.updatedAt)}</dd>
                    </div>
                  ) : null}
                </dl>
              </ServiceFormSectionCard>
            ) : null}

            <p className="text-muted-foreground text-xs italic">
              {NS.help.saveRequirements}
            </p>

            {mode === "create" ? (
              <Button
                type="submit"
                className="w-full gap-2"
                disabled={submitDisabled}
              >
                {pending ? (
                  <Spinner className="size-4" />
                ) : (
                  <CheckIcon className="size-4" />
                )}
                {pending ? NS.action.saving : NS.action.create}
              </Button>
            ) : null}
          </aside>

          <div dir="rtl" className="mx-auto min-w-0 max-w-[860px] space-y-6">
            {!isEmbedded ? (
              <div className="border-border bg-muted/30 rounded-lg border px-4 py-3 text-sm">
                <p className="text-muted-foreground leading-relaxed">
                  {NS.help.formIntro}
                </p>
              </div>
            ) : null}

            <ServiceFormSectionCard title={NS.section.languageContent}>
              <div className="mb-4 space-y-3">
                <Label className="text-xs">{NS.section.languages}</Label>
                <Controller
                  name="contentLanguages"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2">
                      {(["CKB", "KMR"] as const).map((code) => {
                        const on = field.value.includes(code)
                        return (
                          <button
                            key={code}
                            type="button"
                            className={cn(
                              "rounded-full border px-3 py-1 text-xs font-medium",
                              on
                                ? "border-primary/30 bg-primary/10 text-primary"
                                : "border-border border-dashed text-muted-foreground",
                            )}
                            onClick={() => {
                              if (on && field.value.length <= 1) return
                              field.onChange(
                                on
                                  ? field.value.filter((l) => l !== code)
                                  : [...field.value, code],
                              )
                              if (!on) setCanvasLang(code)
                            }}
                          >
                            {code === "CKB" ? NS.lang.ckb : NS.lang.kmr}
                          </button>
                        )
                      })}
                    </div>
                  )}
                />
                {errors.contentLanguages ? (
                  <FieldError>{errors.contentLanguages.message}</FieldError>
                ) : null}
              </div>

              <div className="mb-4 flex flex-wrap gap-2 border-b pb-4">
                {contentLanguages.map((code) => (
                  <button
                    key={code}
                    type="button"
                    className={cn(
                      "rounded-full border px-3 py-1 text-sm font-medium",
                      canvasLang === code
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground",
                    )}
                    onClick={() => setCanvasLang(code)}
                  >
                    {code === "CKB" ? NS.lang.ckb : NS.lang.kmr}
                  </button>
                ))}
              </div>

              <Controller
                name={titlePath}
                control={control}
                render={({ field }) => (
                  <div>
                    <Input
                      {...field}
                      className={borderlessTitleClass}
                      placeholder={
                        canvasLang === "CKB"
                          ? NS.field.titleCkb
                          : NS.field.titleKmr
                      }
                    />
                    {errors.contents?.[contentIndex]?.title ? (
                      <FieldError className="mt-1">
                        {errors.contents[contentIndex]?.title?.message}
                      </FieldError>
                    ) : null}
                    <p className="text-muted-foreground mt-1 text-xs">
                      {formatCkbDigits(field.value?.length ?? 0)}/300
                    </p>
                  </div>
                )}
              />

              <div className="mt-4">
                <Controller
                  name={descPath}
                  control={control}
                  render={({ field }) => (
                    <TiptapEditor
                      lang={canvasLang}
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      placeholder={
                        canvasLang === "CKB"
                          ? NS.field.bodyCkb
                          : NS.field.bodyKmr
                      }
                    />
                  )}
                />
                <p className="text-muted-foreground mt-2 text-xs">
                  {NS.field.bodyHelper}
                </p>
              </div>
            </ServiceFormSectionCard>

            <ServiceFormSectionCard title={NS.section.media}>
              <ServiceGalleryList />
            </ServiceFormSectionCard>

            <ServiceFormSectionCard title={NS.section.optionalSettings}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">{NS.section.layout}</Label>
                  <Controller
                    name="layoutType"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ?? "MEDIA_HERO"}
                        onValueChange={(v) => {
                          if (!v) return
                          field.onChange(v as ServiceLayoutType)
                        }}
                      >
                        <SelectTrigger dir="rtl" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent dir="rtl">
                          {SERVICE_LAYOUT_TYPES.map((lt) => (
                            <SelectItem key={lt} value={lt}>
                              {LAYOUT_LABEL[lt]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <p className="text-muted-foreground text-xs">
                    {layoutHint(layoutType)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">{NS.field.navAnchor}</Label>
                  <Controller
                    name="navAnchorId"
                    control={control}
                    render={({ field }) => (
                      <>
                        <Input
                          {...field}
                          dir="ltr"
                          className="font-mono text-sm"
                          placeholder={NS.field.navAnchorPlaceholder}
                        />
                        {errors.navAnchorId ? (
                          <FieldError>
                            {errors.navAnchorId.message as string}
                          </FieldError>
                        ) : null}
                      </>
                    )}
                  />
                  <p className="text-muted-foreground text-xs">
                    {NS.field.navAnchorHelper}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">{NS.section.type}</Label>
                  <Controller
                    name="serviceType"
                    control={control}
                    render={({ field }) => (
                      <ServiceTypeCombobox
                        items={typeOptions}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        error={errors.serviceType?.message as string}
                      />
                    )}
                  />
                  <p className="text-muted-foreground text-xs">
                    {NS.field.typeHelper}
                  </p>
                </div>

                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Label className="text-xs">{NS.section.location}</Label>
                      <div className="flex items-start gap-2">
                        <MapPinIcon className="text-muted-foreground mt-2 size-5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <Input
                            {...field}
                            placeholder={NS.field.location}
                          />
                          <span className="text-muted-foreground text-[10px]">
                            {NS.field.locationHelper}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                />

                <div className="space-y-2 border-t pt-4">
                  <Label className="text-xs">{NS.section.partners}</Label>
                  <p className="text-muted-foreground text-xs">
                    {NS.field.partnersHelper}
                  </p>
                  <ServicePartnersSelect
                    value={partnerIds}
                    onChange={(next) =>
                      setValue("partnerIds", next, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  />
                </div>
              </div>
            </ServiceFormSectionCard>
          </div>
        </div>

        <div
          className={cn(
            "border-border bg-background/95 supports-backdrop-filter:backdrop-blur z-40 border-t pb-[max(0.75rem,env(safe-area-inset-bottom))]",
            isEmbedded
              ? "sticky bottom-0"
              : "fixed inset-x-0 bottom-0",
          )}
        >
          <div
            className={cn(
              "mx-auto flex min-h-14 max-w-full items-center justify-between gap-3 px-4 py-3",
              !isEmbedded && "lg:px-6",
            )}
          >
            <div className="flex min-h-10 flex-1 flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              {isDirty ? (
                <span className="text-primary hidden items-center gap-2 lg:inline-flex">
                  <span
                    className="bg-primary inline-flex size-2 rounded-full"
                    aria-hidden
                  />
                  {NS.unsaved.indicator}
                </span>
              ) : null}
              {errorCount > 0 ? (
                <span className="text-destructive inline-flex items-center gap-1 text-xs">
                  <ExclamationCircleIcon className="size-3.5 shrink-0" />
                  {formatCkbDigits(errorCount)} هەڵە
                </span>
              ) : null}
            </div>
            <div className="grid w-full grid-cols-2 gap-2 sm:ms-auto sm:flex sm:w-auto">
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={handleCancel}
              >
                {isEmbedded ? NS.action.backToSections : NS.action.cancel}
              </Button>
              <Button type="submit" disabled={submitDisabled} className="gap-2">
                {pending ? (
                  <Spinner className="size-4" />
                ) : (
                  <CheckIcon className="size-4" />
                )}
                {pending ? NS.action.saving : NS.action.save}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
