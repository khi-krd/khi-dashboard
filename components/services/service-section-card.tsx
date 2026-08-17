"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CheckIcon, TrashIcon } from "@heroicons/react/24/outline"
import { useEffect, useRef } from "react"
import {
  Controller,
  FormProvider,
  useForm,
  type Resolver,
} from "react-hook-form"
import { toast } from "sonner"

import { ServiceGalleryEditor } from "@/components/services/service-gallery-editor"
import { NS } from "@/components/services/services-strings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import {
  useCreateService,
  useUpdateService,
} from "@/hooks/useServices"
import { serviceFormValuesToPayload } from "@/lib/services-form-data"
import { extractApiErrorMessage } from "@/lib/api-error"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { toastError } from "@/lib/toast"
import { cn } from "@/lib/utils"
import {
  defaultServiceFormValues,
  serviceDtoToFormValues,
  serviceFormSchema,
  type ServiceFormValues,
} from "@/lib/validations/services"
import type { Language, ServiceDto } from "@/types/services"

const FEATURE_DESCRIPTION_MAX = 1000

function LangFields({
  lang,
  titlePath,
  descPath,
  featureDescPath,
  control,
}: {
  lang: Language
  titlePath: `contents.${number}.title`
  descPath: `contents.${number}.description`
  featureDescPath: `contents.${number}.featureDescription`
  control: ReturnType<typeof useForm<ServiceFormValues>>["control"]
}) {
  const isCkb = lang === "CKB"

  return (
    <div className="space-y-3">
      <p
        className={cn(
          "text-xs font-medium",
          isCkb ? "text-primary" : "text-blue-600 dark:text-blue-400",
        )}
      >
        {isCkb ? NS.lang.ckb : NS.lang.kmr}
      </p>

      <Controller
        name={titlePath}
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            placeholder={isCkb ? NS.field.titleCkb : NS.field.titleKmr}
            className="h-10"
          />
        )}
      />

      <Controller
        name={descPath}
        control={control}
        render={({ field }) => (
          <Textarea
            {...field}
            rows={4}
            placeholder={isCkb ? NS.field.bodyCkb : NS.field.bodyKmr}
            className="min-h-[100px] resize-y text-sm"
          />
        )}
      />

      {/*
        Deliberately a plain textarea, not the rich-text editor the description
        uses: this line is rendered as bare text on the homepage carousel, and
        any markup sent here is stripped on save anyway.
      */}
      <Controller
        name={featureDescPath}
        control={control}
        render={({ field }) => {
          const used = field.value?.length ?? 0
          const over = used > FEATURE_DESCRIPTION_MAX
          return (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-muted-foreground text-xs">
                  {NS.field.featureDescriptionLabel}
                </Label>
                <span
                  className={cn(
                    "font-mono text-[11px] tabular-nums",
                    over ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {formatCkbDigits(used)}/{formatCkbDigits(FEATURE_DESCRIPTION_MAX)}
                </span>
              </div>
              <Textarea
                {...field}
                value={field.value ?? ""}
                rows={2}
                placeholder={
                  isCkb
                    ? NS.field.featureDescriptionCkb
                    : NS.field.featureDescriptionKmr
                }
                className="min-h-[56px] resize-y text-sm"
              />
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                {NS.field.featureDescriptionHelper}
              </p>
            </div>
          )
        }}
      />
    </div>
  )
}

export function ServiceSectionCard({
  index,
  dto,
  sortOrder,
  onSaved,
  onDelete,
}: {
  index: number
  dto?: ServiceDto
  sortOrder: number
  onSaved: () => void
  onDelete?: () => void
}) {
  const mode = dto?.id ? "edit" : "create"
  const serviceId = dto?.id
  const createMut = useCreateService()
  const updateMut = useUpdateService()
  const bootstrapped = useRef(false)

  const methods = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema) as Resolver<ServiceFormValues>,
    defaultValues: defaultServiceFormValues(),
    mode: "onChange",
  })

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty, isValid },
  } = methods

  useEffect(() => {
    if (bootstrapped.current) return
    bootstrapped.current = true
    if (dto) {
      reset(serviceDtoToFormValues(dto))
      return
    }
    reset({
      ...defaultServiceFormValues(),
      contentLanguages: ["CKB", "KMR"],
      sortOrder,
      active: true,
      layoutType: "MEDIA_HERO",
    })
  }, [dto, reset, sortOrder])

  const pending = createMut.isPending || updateMut.isPending
  const submitDisabled =
    pending || !isValid || (mode === "edit" && !isDirty)

  const onSubmit = handleSubmit(
    (values) => {
      const payload = serviceFormValuesToPayload(mode, serviceId, values, {
        sortOrder,
      })

      const onSuccess = (res: { success?: boolean }) => {
        if (!res.success) {
          toastError(NS.error.generic)
          return
        }
        toast(NS.toast.saved)
        onSaved()
      }

      const onError = (err: unknown) => {
        toastError(extractApiErrorMessage(err) ?? NS.error.generic)
      }

      if (mode === "create") {
        createMut.mutate(payload, { onSuccess, onError })
      } else if (serviceId) {
        updateMut.mutate({ id: serviceId, payload }, { onSuccess, onError })
      }
    },
    () => toastError(NS.error.validation),
  )

  const titlePreview =
    dto?.contents.find((c) => c.languageCode === "CKB")?.title?.trim() ||
    dto?.contents.find((c) => c.languageCode === "KMR")?.title?.trim() ||
    ""

  return (
    <section className="bg-card rounded-lg border shadow-sm">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs">
            {NS.page.sectionLabel(formatCkbDigits(index + 1))}
          </p>
          {titlePreview ? (
            <p className="truncate text-sm font-medium">{titlePreview}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {onDelete ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={onDelete}
              aria-label={NS.action.delete}
            >
              <TrashIcon className="size-4" />
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            disabled={submitDisabled}
            className="gap-1"
            onClick={() => void onSubmit()}
          >
            {pending ? (
              <Spinner className="size-3.5" />
            ) : (
              <CheckIcon className="size-3.5" />
            )}
            {pending ? NS.action.saving : NS.action.save}
          </Button>
        </div>
      </div>

      <FormProvider {...methods}>
        <div className="space-y-5 border-t px-4 py-4">
          <div className="grid gap-5 md:grid-cols-2">
            <LangFields
              lang="CKB"
              titlePath="contents.0.title"
              descPath="contents.0.description"
              featureDescPath="contents.0.featureDescription"
              control={control}
            />
            <LangFields
              lang="KMR"
              titlePath="contents.1.title"
              descPath="contents.1.description"
              featureDescPath="contents.1.featureDescription"
              control={control}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs">
              {NS.gallery.section}
            </Label>
            <ServiceGalleryEditor />
          </div>
        </div>
      </FormProvider>
    </section>
  )
}
