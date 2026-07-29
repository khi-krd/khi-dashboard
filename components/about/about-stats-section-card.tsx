"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useRef } from "react"
import { FormProvider, useForm, type Resolver } from "react-hook-form"
import { toast } from "sonner"

import { AboutSectionCardShell } from "@/components/about/about-section-card-shell"
import { AboutStatsEditorFields } from "@/components/about/about-stats-editor-fields"
import { NS } from "@/components/about/about-strings"
import { useUpdateAbout } from "@/hooks/useAbout"
import { aboutPatchToPayload } from "@/lib/about-page-data"
import { extractApiErrorMessage } from "@/lib/api-error"
import { toastError } from "@/lib/toast"
import {
  aboutFormSchema,
  aboutDtoToFormValues,
  type AboutFormValues,
} from "@/lib/validations/about"
import type { AboutDto } from "@/types/about"

export function AboutStatsSectionCard({
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
    handleSubmit,
    reset,
    formState: { isDirty, isValid },
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

  return (
    <AboutSectionCardShell
      index={index}
      titlePreview={NS.section.stats}
      onSave={() => void onSubmit()}
      saveDisabled={submitDisabled}
      pending={pending}
    >
      <FormProvider {...methods}>
        <AboutStatsEditorFields />
      </FormProvider>
    </AboutSectionCardShell>
  )
}
