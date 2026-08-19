"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CheckIcon } from "@heroicons/react/24/outline"
import { useEffect, useRef } from "react"
import { Controller, useForm, type Resolver } from "react-hook-form"
import { toast } from "sonner"

import { NS } from "@/components/about/about-strings"
import { MediaCoverUpload } from "@/components/shared/media-cover-upload"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { useCreateAbout, useUpdateAbout } from "@/hooks/useAbout"
import { heroFormValuesToAboutPayload } from "@/lib/about-page-data"
import { extractApiErrorMessage } from "@/lib/api-error"
import {
  aboutDtoToHeroFormValues,
  aboutPageHeroSchema,
  defaultAboutPageHeroValues,
  type AboutPageHeroFormValues,
} from "@/lib/validations/about-page"
import { toastError } from "@/lib/toast"
import { cn } from "@/lib/utils"
import type { AboutDto } from "@/types/about"

export function AboutPageHeroEditor({
  aboutDto,
  isLoading,
  onSaved,
}: {
  aboutDto?: AboutDto
  isLoading?: boolean
  onSaved: () => void
}) {
  const createMut = useCreateAbout()
  const updateMut = useUpdateAbout()
  const bootstrapped = useRef(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<AboutPageHeroFormValues>({
    resolver: zodResolver(aboutPageHeroSchema) as Resolver<AboutPageHeroFormValues>,
    defaultValues: defaultAboutPageHeroValues(),
    mode: "onChange",
  })

  useEffect(() => {
    bootstrapped.current = false
  }, [aboutDto?.id])

  useEffect(() => {
    if (bootstrapped.current) return
    if (isLoading) return
    bootstrapped.current = true
    if (aboutDto) {
      reset(aboutDtoToHeroFormValues(aboutDto))
    } else {
      reset(defaultAboutPageHeroValues())
    }
  }, [aboutDto, isLoading, reset])

  const pending = createMut.isPending || updateMut.isPending
  const canSave = isDirty && !pending

  const onSubmit = handleSubmit((values) => {
    // A fully blank hero must stay savable — lib/about-page-data.ts
    // auto-fills the "derbare" slug so the payload is always valid.
    const payload = heroFormValuesToAboutPayload(values, aboutDto)
    const onSuccess = () => {
      toast(NS.toast.heroSaved)
      reset(values)
      onSaved()
    }
    const onError = (err: unknown) => {
      toastError(extractApiErrorMessage(err) ?? NS.error.validation)
    }

    if (aboutDto?.id) {
      updateMut.mutate({ id: aboutDto.id, payload }, { onSuccess, onError })
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
    <section className="border-border bg-card/50 rounded-xl border shadow-xs">
      <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-foreground before:h-3.5 before:w-1 before:rounded-full before:bg-primary/70 before:content-['']">
            {NS.page.heroTitle}
          </h2>
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
          name="heroPosterUrl"
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

        <Controller
          name="heroVideoUrl"
          control={control}
          render={({ field }) => (
            <MediaCoverUpload
              label={NS.form.hero_video}
              variant="video"
              previewUrl={field.value?.trim() || null}
              urlValue={field.value ?? ""}
              onUrlChange={field.onChange}
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
  control: ReturnType<typeof useForm<AboutPageHeroFormValues>>["control"]
  lang: "CKB" | "KMR"
}) {
  const isCkb = lang === "CKB"
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
        <Label className="text-xs">{NS.page.fieldTitle}</Label>
        <Controller
          name={titleName}
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              className="text-lg font-semibold"
              placeholder={isCkb ? "دەربارەی ئێمە…" : "Derbarê me…"}
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
            <Textarea {...field} rows={4} placeholder="وەسفی کورت…" />
          )}
        />
      </div>
    </div>
  )
}
