"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { LinkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { useEffect, useRef, useState } from "react"
import {
  Controller,
  FormProvider,
  useForm,
  type Resolver,
} from "react-hook-form"
import { toast } from "sonner"

import { AboutSectionCardShell } from "@/components/about/about-section-card-shell"
import { SeoCountChip } from "@/components/about/seo-count-chip"
import { NS } from "@/components/about/about-strings"
import { ServiceActiveSwitch } from "@/components/services/service-active-switch"
import { TiptapEditor } from "@/components/shared/tiptap-editor-lazy"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useUpdateAbout } from "@/hooks/useAbout"
import { aboutPatchToPayload } from "@/lib/about-page-data"
import { aboutSiteBaseUrl } from "@/lib/about-url-helpers"
import { extractApiErrorMessage } from "@/lib/api-error"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { toastError } from "@/lib/toast"
import { cn } from "@/lib/utils"
import {
  aboutFormSchema,
  aboutDtoToFormValues,
  type AboutFormValues,
} from "@/lib/validations/about"
import type { AboutDto, Language } from "@/types/about"

export function AboutContentSectionCard({
  index,
  aboutDto,
  onSaved,
}: {
  index: number
  aboutDto: AboutDto
  onSaved: () => void
}) {
  const updateMut = useUpdateAbout()
  const bootstrapped = useRef(false)
  const [activeLang, setActiveLang] = useState<Language>("CKB")

  const methods = useForm<AboutFormValues>({
    resolver: zodResolver(aboutFormSchema) as Resolver<AboutFormValues>,
    defaultValues: aboutDtoToFormValues(aboutDto),
    mode: "onChange",
  })

  const {
    control,
    handleSubmit,
    reset,
    register,
    watch,
    setValue,
    formState: { isDirty, isValid },
  } = methods

  useEffect(() => {
    if (bootstrapped.current) return
    bootstrapped.current = true
    reset(aboutDtoToFormValues(aboutDto))
  }, [aboutDto, reset])

  const pending = updateMut.isPending
  const submitDisabled = pending || !isValid || !isDirty

  const seoField =
    activeLang === "CKB" ? "seoDescriptionCkb" : "seoDescriptionKmr"
  const titleCkb = watch("titleCkb")
  const titleKmr = watch("titleKmr")
  const slugCkb = watch("slugCkb")
  const seoDescriptionCkb = watch("seoDescriptionCkb")
  const subtitleCkb = watch("subtitleCkb")
  const seoLen = watch(seoField)?.length ?? 0
  const siteBase = aboutSiteBaseUrl() || "yoursite.com"

  const onSubmit = handleSubmit(
    (values) => {
      if (!aboutDto.id) return
      updateMut.mutate(
        { id: aboutDto.id, payload: aboutPatchToPayload(aboutDto, values) },
        {
          onSuccess: () => {
            toast(NS.toast.saved)
            reset(values)
            onSaved()
          },
          onError: (err) => {
            toastError(extractApiErrorMessage(err) ?? NS.error.validation)
          },
        },
      )
    },
    () => toastError(NS.error.validation),
  )

  const titlePreview =
    aboutDto.ckbContent?.title?.trim() ||
    aboutDto.kmrContent?.title?.trim() ||
    NS.section.content

  return (
    <AboutSectionCardShell
      index={index}
      titlePreview={titlePreview}
      onSave={() => void onSubmit()}
      saveDisabled={submitDisabled}
      pending={pending}
    >
      <FormProvider {...methods}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ServiceActiveSwitch
              checked={watch("active")}
              onCheckedChange={(v) =>
                setValue("active", v, { shouldDirty: true })
              }
            />
            <span className="text-muted-foreground text-xs">
              {watch("active") ? NS.status.active : NS.status.inactive}
            </span>
          </div>
          <div className="flex gap-2">
            {(["CKB", "KMR"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setActiveLang(lang)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium",
                  activeLang === lang
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground",
                )}
              >
                {lang === "CKB" ? NS.lang.ckb : NS.lang.kmr}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs">{NS.form.slug_ckb}</Label>
            <div className="relative">
              <LinkIcon className="text-muted-foreground/60 absolute inset-e-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                {...register("slugCkb")}
                className="pe-10 font-mono text-sm"
                placeholder="derbare-ckb"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">{NS.form.slug_kmr}</Label>
            <div className="relative">
              <LinkIcon className="text-muted-foreground/60 absolute inset-e-3 top-1/2 size-4 -translate-y-1/2" />
              <Input
                {...register("slugKmr")}
                className="pe-10 font-mono text-sm"
                placeholder="derbare-kmr"
              />
            </div>
          </div>
        </div>

        <div className="border-border bg-muted/20 rounded-xl border p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <div className="flex items-center gap-1.5">
              <MagnifyingGlassIcon className="text-muted-foreground size-3.5" />
              <span className="text-xs font-medium">{NS.form.seo}</span>
            </div>
            <SeoCountChip value={seoLen} max={2500} />
          </div>
          <Textarea
            rows={3}
            maxLength={2500}
            className="resize-none"
            {...register(seoField)}
          />
          <div className="border-border/40 mt-3 border-t pt-3">
            <div className="text-muted-foreground/70 mb-1.5 text-[10px] uppercase">
              {NS.form.seo_preview}
            </div>
            <div className="border-border/40 bg-background max-w-md rounded-md border p-2.5">
              <div className="truncate text-base text-[#1a0dab] dark:text-blue-400">
                {titleCkb?.trim() || titleKmr?.trim() || "ناونیشان"}
              </div>
              <div className="mt-0.5 truncate font-mono text-xs text-[#006621] dark:text-emerald-500">
                {siteBase}/about/{slugCkb?.trim() || "…"}
              </div>
              <div className="text-foreground/70 mt-1 line-clamp-2 text-xs">
                {seoDescriptionCkb?.trim() ||
                  subtitleCkb?.trim() ||
                  titleCkb?.trim() ||
                  NS.form.seo_fallback}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">{NS.form.body}</Label>
          {activeLang === "CKB" ? (
            <Controller
              name="bodyCkb"
              control={control}
              render={({ field }) => (
                <TiptapEditor
                  stickyToolbar
                  lang="CKB"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
          ) : (
            <Controller
              name="bodyKmr"
              control={control}
              render={({ field }) => (
                <TiptapEditor
                  stickyToolbar
                  lang="KMR"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />
          )}
        </div>
      </FormProvider>
    </AboutSectionCardShell>
  )
}
