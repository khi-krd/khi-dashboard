"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  CheckIcon,
  ChevronDownIcon,
  ExclamationCircleIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  Controller,
  FormProvider,
  useForm,
  type FieldErrors,
  type Resolver,
} from "react-hook-form"
import { toast } from "sonner"

import { ServiceActiveSwitch } from "@/components/services/service-active-switch"
import { ServiceGalleryEditor } from "@/components/services/service-gallery-editor"
import { ServicePartnersSelect } from "@/components/services/service-partners-select"
import { ServicePublishDateTime } from "@/components/services/service-publish-datetime"
import { ServiceTypeCombobox } from "@/components/services/service-type-combobox"
import { ServicesErrorState } from "@/components/services/services-error-state"
import { NS } from "@/components/services/services-strings"
import { TiptapEditor } from "@/components/shared/tiptap-editor-lazy"
import { Button } from "@/components/ui/button"
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  useCreateService,
  useServiceDetailQuery,
  useServiceTypesQuery,
  useUpdateService,
} from "@/hooks/useServices"
import { serviceFormValuesToPayload } from "@/lib/services-form-data"
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

const LAYOUT_LABEL: Record<ServiceLayoutType, string> = {
  MEDIA_HERO: NS.layout.MEDIA_HERO,
  FEATURE_GRID: NS.layout.FEATURE_GRID,
  DEFAULT: NS.layout.DEFAULT,
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

export function ServiceSectionEditor({
  mode,
  serviceId,
  initialSortOrder,
  onSaved,
  onCancel,
  onDelete,
}: {
  mode: "create" | "edit"
  serviceId?: number
  initialSortOrder?: number
  onSaved?: (id: number) => void
  onCancel?: () => void
  onDelete?: () => void
}) {
  const detailQuery = useServiceDetailQuery(serviceId ?? 0)
  const typesQuery = useServiceTypesQuery()
  const createMut = useCreateService()
  const updateMut = useUpdateService()
  const [canvasLang, setCanvasLang] = useState<Language>("CKB")
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const createBootstrapped = useRef(false)

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
    if (mode !== "create") {
      createBootstrapped.current = false
      return
    }
    if (createBootstrapped.current) return
    createBootstrapped.current = true
    reset({
      ...defaultServiceFormValues(),
      contentLanguages: ["CKB"],
      sortOrder:
        typeof initialSortOrder === "number" ? initialSortOrder : null,
    })
  }, [mode, initialSortOrder, reset])

  useEffect(() => {
    if (mode !== "create") return
    if (typeof initialSortOrder !== "number") return
    setValue("sortOrder", initialSortOrder, { shouldDirty: false })
  }, [mode, initialSortOrder, setValue])

  const contentLanguages = watch("contentLanguages")
  const serviceType = watch("serviceType")
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
  const submitDisabled =
    pending || !isValid || (mode === "edit" && !isDirty)

  const onSubmit = handleSubmit(
    (values) => {
      const payload = serviceFormValuesToPayload(mode, serviceId, values)
      const onSuccess = (res: { success?: boolean; data?: { id?: number } }) => {
        if (!res.success) {
          toastError(NS.error.generic)
          return
        }
        const savedId = res.data?.id
        toast(NS.toast.saved)
        if (typeof savedId === "number") {
          onSaved?.(savedId)
        } else if (mode === "create") {
          toastError(NS.error.generic)
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
          { onSuccess, onError: () => toastError(NS.error.generic) },
        )
      }
    },
    () => toastError(NS.error.validation),
  )

  if (mode === "edit" && detailQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (mode === "edit" && (detailQuery.isError || !dto)) {
    return (
      <div className="p-6">
        <ServicesErrorState onRetry={() => void detailQuery.refetch()} />
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit} className="flex min-h-full flex-col" dir="rtl">
        <div className="border-border bg-background sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b px-4 py-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold">
              {mode === "create"
                ? NS.page.panelTitleNew
                : NS.page.panelTitleEdit}
            </h2>
          </div>

          <Controller
            name="active"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
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

          <Controller
            name="sortOrder"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Label className="text-muted-foreground text-xs whitespace-nowrap">
                  {NS.field.sortOrderLabel}
                </Label>
                <Input
                  type="number"
                  min={0}
                  dir="ltr"
                  className="h-8 w-16 font-mono text-sm"
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
              </div>
            )}
          />

          {errorCount > 0 ? (
            <span className="text-destructive inline-flex items-center gap-1 text-xs">
              <ExclamationCircleIcon className="size-3.5" />
              {formatCkbDigits(errorCount)}
            </span>
          ) : null}

          {onDelete && mode === "edit" ? (
            <Button type="button" variant="ghost" size="sm" onClick={onDelete}>
              {NS.action.delete}
            </Button>
          ) : null}

          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            {NS.action.cancel}
          </Button>
          <Button type="submit" size="sm" disabled={submitDisabled} className="gap-1">
            {pending ? <Spinner className="size-3.5" /> : <CheckIcon className="size-3.5" />}
            {pending ? NS.action.saving : NS.action.save}
          </Button>
        </div>

        <div className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-4 py-6">
          <div className="space-y-3">
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
                            ? "border-primary bg-primary/10 text-primary"
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
            <div className="flex gap-2 border-b pb-2">
              {contentLanguages.map((code) => (
                <button
                  key={code}
                  type="button"
                  className={cn(
                    "rounded-md px-3 py-1 text-sm font-medium",
                    canvasLang === code
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground",
                  )}
                  onClick={() => setCanvasLang(code)}
                >
                  {code === "CKB" ? NS.lang.ckb : NS.lang.kmr}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">
              {NS.page.fieldTitle}
            </Label>
            <Controller
              name={titlePath}
              control={control}
              render={({ field }) => (
                <>
                  <Input
                    {...field}
                    className="border-0 px-0 text-2xl font-bold shadow-none focus-visible:ring-0"
                    placeholder={
                      canvasLang === "CKB"
                        ? NS.field.titleCkb
                        : NS.field.titleKmr
                    }
                  />
                  {errors.contents?.[contentIndex]?.title ? (
                    <FieldError>
                      {errors.contents[contentIndex]?.title?.message}
                    </FieldError>
                  ) : null}
                </>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">
              {NS.page.fieldBody}
            </Label>
            <Controller
              name={descPath}
              control={control}
              render={({ field }) => (
                <TiptapEditor
                  lang={canvasLang}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder={
                    canvasLang === "CKB" ? NS.field.bodyCkb : NS.field.bodyKmr
                  }
                />
              )}
            />
          </div>

          <ServiceGalleryEditor />

          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger
              type="button"
              className="hover:bg-muted/50 flex w-full items-center justify-between rounded-md px-0 py-2 text-sm font-medium"
            >
              {NS.section.optionalSettings}
              <ChevronDownIcon
                className={cn(
                  "size-4 transition-transform",
                  advancedOpen && "rotate-180",
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-2">
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
                      <SelectTrigger dir="rtl">
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
              </div>

              <div className="space-y-2">
                <Label className="text-xs">{NS.field.navAnchor}</Label>
                <Controller
                  name="navAnchorId"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      dir="ltr"
                      className="font-mono text-sm"
                      placeholder={NS.field.navAnchorPlaceholder}
                    />
                  )}
                />
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
                    />
                  )}
                />
              </div>

              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label className="text-xs">{NS.section.location}</Label>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="text-muted-foreground size-4" />
                      <Input {...field} placeholder={NS.field.location} />
                    </div>
                  </div>
                )}
              />

              <div className="space-y-2">
                <Label className="text-xs">{NS.section.publish}</Label>
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
              </div>

              <div className="space-y-2">
                <Label className="text-xs">{NS.section.partners}</Label>
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
            </CollapsibleContent>
          </Collapsible>
        </div>
      </form>
    </FormProvider>
  )
}
