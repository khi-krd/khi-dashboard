"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useRef } from "react"
import { Controller, FormProvider, useForm, type Resolver } from "react-hook-form"
import { toast } from "sonner"

import { AboutSectionCardShell } from "@/components/about/about-section-card-shell"
import { NS } from "@/components/about/about-strings"
import { MediaCoverUpload } from "@/components/shared/media-cover-upload"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useUpdateAbout } from "@/hooks/useAbout"
import { aboutPatchToPayload } from "@/lib/about-page-data"
import { extractApiErrorMessage } from "@/lib/api-error"
import { toastError } from "@/lib/toast"
import { cn } from "@/lib/utils"
import {
  aboutFormSchema,
  aboutDtoToFormValues,
  type AboutFormValues,
} from "@/lib/validations/about"
import type { AboutDto } from "@/types/about"

export function AboutFounderSectionCard({
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
    formState: { isDirty, isValid, errors },
  } = methods

  useEffect(() => {
    if (bootstrapped.current) return
    bootstrapped.current = true
    reset(aboutDtoToFormValues(aboutDto))
  }, [aboutDto, reset])

  const pending = updateMut.isPending
  const submitDisabled = pending || !isValid || !isDirty

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
    aboutDto.founderNameCkb?.trim() ||
    aboutDto.founderNameKmr?.trim() ||
    NS.section.founder

  return (
    <AboutSectionCardShell
      index={index}
      titlePreview={titlePreview}
      onSave={() => void onSubmit()}
      saveDisabled={submitDisabled}
      pending={pending}
    >
      <FormProvider {...methods}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-3">
            <Label
              className={cn("text-xs font-medium text-primary")}
            >
              {NS.form.section_ckb}
            </Label>
            <Input
              placeholder={NS.form.founder_name_ckb}
              {...register("founderNameCkb")}
            />
            <Textarea
              rows={4}
              placeholder={NS.form.founder_bio_ckb}
              {...register("founderBioCkb")}
            />
          </div>
          <div className="space-y-3">
            <Label
              className={cn(
                "text-xs font-medium text-blue-700 dark:text-blue-400",
              )}
            >
              {NS.form.section_kmr}
            </Label>
            <Input
              placeholder={NS.form.founder_name_kmr}
              {...register("founderNameKmr")}
            />
            <Textarea
              rows={4}
              placeholder={NS.form.founder_bio_kmr}
              {...register("founderBioKmr")}
            />
          </div>
        </div>
        <Controller
          name="founderImageUrl"
          control={control}
          render={({ field }) => (
            <MediaCoverUpload
              label={NS.form.founder_image}
              previewUrl={field.value?.trim() || null}
              urlValue={field.value ?? ""}
              aspectClass="aspect-square max-w-xs"
              onUrlChange={field.onChange}
              urlError={
                typeof errors.founderImageUrl?.message === "string"
                  ? errors.founderImageUrl.message
                  : undefined
              }
            />
          )}
        />
      </FormProvider>
    </AboutSectionCardShell>
  )
}
