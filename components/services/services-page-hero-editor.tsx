"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CheckIcon } from "@heroicons/react/24/outline"
import { useEffect, useRef } from "react"
import { Controller, useForm, type Resolver } from "react-hook-form"
import { toast } from "sonner"

import { NS } from "@/components/services/services-strings"
import { MediaCoverUpload } from "@/components/shared/media-cover-upload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { useCreateService, useUpdateService } from "@/hooks/useServices"
import { extractApiErrorMessage } from "@/lib/api-error"
import {
  heroFormValuesToServicePayload,
  serviceDtoToHeroFormValues,
} from "@/lib/services-form-data"
import {
  defaultServicesPageHeroValues,
  heroFormIsValid,
  servicesPageHeroSchema,
  type ServicesPageHeroFormValues,
} from "@/lib/validations/services-page"
import { toastError } from "@/lib/toast"
import { cn } from "@/lib/utils"
import type { Language, ServiceDto } from "@/types/services"

export function ServicesPageHeroEditor({
  heroDto,
  isLoading,
  onSaved,
}: {
  heroDto?: ServiceDto
  isLoading?: boolean
  onSaved: () => void
}) {
  const createMut = useCreateService()
  const updateMut = useUpdateService()
  const bootstrapped = useRef(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<ServicesPageHeroFormValues>({
    resolver: zodResolver(servicesPageHeroSchema) as Resolver<ServicesPageHeroFormValues>,
    defaultValues: defaultServicesPageHeroValues(),
    mode: "onChange",
  })

  useEffect(() => {
    bootstrapped.current = false
  }, [heroDto?.id])

  useEffect(() => {
    if (bootstrapped.current) return
    if (isLoading) return
    bootstrapped.current = true
    if (heroDto) {
      reset(serviceDtoToHeroFormValues(heroDto))
    } else {
      reset(defaultServicesPageHeroValues())
    }
  }, [heroDto, isLoading, reset])

  const pending = createMut.isPending || updateMut.isPending
  const canSave = isDirty && !pending

  const onSubmit = handleSubmit((values) => {
    if (!heroFormIsValid(values)) {
      toastError(NS.validation.titleRequired)
      return
    }

    const payload = heroFormValuesToServicePayload(values, heroDto?.id)
    const onSuccess = (res: { success?: boolean }) => {
      if (!res.success) {
        toastError(NS.error.generic)
        return
      }
      toast(NS.toast.heroSaved)
      reset(values)
      onSaved()
    }

    const onError = (err: unknown) => {
      toastError(extractApiErrorMessage(err) ?? NS.error.generic)
    }

    if (heroDto?.id) {
      updateMut.mutate({ id: heroDto.id, payload }, { onSuccess, onError })
    } else {
      createMut.mutate(payload, { onSuccess, onError })
    }
  })

  if (isLoading) {
    return (
      <div className="border-border flex items-center justify-center rounded-xl border p-12">
        <Spinner className="size-6" />
      </div>
    )
  }

  return (
    <section className="border-border rounded-xl border">
      <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <h2 className="text-base font-semibold">{NS.page.heroTitle}</h2>
          <p className="text-muted-foreground text-xs">{NS.page.heroHint}</p>
        </div>
        <Button
          type="button"
          size="sm"
          disabled={!canSave}
          className="gap-1"
          onClick={() => void onSubmit()}
        >
          {pending ? (
            <Spinner className="size-3.5" />
          ) : (
            <CheckIcon className="size-3.5" />
          )}
          {pending ? NS.action.saving : NS.action.saveHero}
        </Button>
      </div>

      <div className="space-y-6 p-4">
        <Controller
          name="heroImageUrl"
          control={control}
          render={({ field }) => (
            <MediaCoverUpload
              label={NS.page.heroImage}
              variant="image"
              previewUrl={field.value?.trim() || null}
              urlValue={field.value ?? ""}
              onUrlChange={field.onChange}
              aspectClass="aspect-[21/9]"
            />
          )}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <HeroLangFields control={control} lang="CKB" />
          <HeroLangFields control={control} lang="KMR" />
        </div>
      </div>
    </section>
  )
}

function HeroLangFields({
  control,
  lang,
}: {
  control: ReturnType<typeof useForm<ServicesPageHeroFormValues>>["control"]
  lang: Language
}) {
  const isCkb = lang === "CKB"
  const eyebrowName = isCkb ? "eyebrowCkb" : "eyebrowKmr"
  const titleName = isCkb ? "titleCkb" : "titleKmr"
  const subtitleName = isCkb ? "subtitleCkb" : "subtitleKmr"

  return (
    <div className="space-y-4">
      <p
        className={cn(
          "text-xs font-semibold uppercase tracking-wide",
          isCkb ? "text-primary" : "text-blue-600 dark:text-blue-400",
        )}
      >
        {isCkb ? NS.lang.ckb : NS.lang.kmr}
      </p>

      <div className="space-y-2">
        <Label className="text-xs">{NS.page.heroOvertitle}</Label>
        <Controller
          name={eyebrowName}
          control={control}
          render={({ field }) => (
            <Input {...field} placeholder={NS.page.heroOvertitlePlaceholder} />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">{NS.page.fieldTitle}</Label>
        <Controller
          name={titleName}
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              className="text-lg font-semibold"
              placeholder={isCkb ? NS.field.titleCkb : NS.field.titleKmr}
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs">{NS.page.heroSubtitle}</Label>
        <Controller
          name={subtitleName}
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              rows={4}
              placeholder={isCkb ? NS.field.bodyCkb : NS.field.bodyKmr}
            />
          )}
        />
      </div>
    </div>
  )
}
