"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { LinkIcon, TrashIcon } from "@heroicons/react/24/outline"
import { useEffect, useRef } from "react"
import {
  Controller,
  FormProvider,
  useForm,
  type Resolver,
} from "react-hook-form"
import { toast } from "sonner"

import { ContactSectionCardShell } from "@/components/contact/contact-section-card-shell"
import { NS } from "@/components/contact/contact-strings"
import { ServiceActiveSwitch } from "@/components/services/service-active-switch"
import { TiptapEditor } from "@/components/shared/tiptap-editor-lazy"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  useCreateContact,
  useUpdateContact,
} from "@/hooks/useContact"
import { contactFormValuesToPayload } from "@/lib/contact-form-data"
import { contactDisplayTitle } from "@/lib/contact-normalize"
import { extractApiErrorMessage } from "@/lib/api-error"
import { toastError } from "@/lib/toast"
import { cn } from "@/lib/utils"
import {
  contactDtoToFormValues,
  contactFormSchema,
  defaultContactFormValues,
  type ContactFormValues,
} from "@/lib/validations/contact"
import type { ContactDto, Language } from "@/types/contact"

function LangBlock({
  lang,
  register,
  control,
}: {
  lang: Language
  register: ReturnType<typeof useForm<ContactFormValues>>["register"]
  control: ReturnType<typeof useForm<ContactFormValues>>["control"]
}) {
  const isCkb = lang === "CKB"
  const titleField = isCkb ? "titleCkb" : "titleKmr"
  const subtitleField = isCkb ? "subtitleCkb" : "subtitleKmr"
  const addressField = isCkb ? "addressCkb" : "addressKmr"
  const hoursField = isCkb ? "workingHoursCkb" : "workingHoursKmr"
  const descField = isCkb ? "descriptionCkb" : "descriptionKmr"

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
      <Input
        {...register(titleField)}
        placeholder={NS.form.title}
        className="h-10"
      />
      <Input {...register(subtitleField)} placeholder={NS.form.subtitle} />
      <Input {...register(addressField)} placeholder={NS.form.address} />
      <Input {...register(hoursField)} placeholder={NS.form.working_hours} />
      <Controller
        name={descField}
        control={control}
        render={({ field }) => (
          <TiptapEditor
            lang={lang}
            value={field.value ?? ""}
            onChange={field.onChange}
          />
        )}
      />
    </div>
  )
}

export function ContactOfficeSectionCard({
  index,
  dto,
  onSaved,
  onDelete,
}: {
  index: number
  dto?: ContactDto
  onSaved: () => void
  onDelete?: () => void
}) {
  const mode = dto?.id ? "edit" : "create"
  const contactId = dto?.id
  const createMut = useCreateContact()
  const updateMut = useUpdateContact()
  const bootstrapped = useRef(false)

  const methods = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema) as Resolver<ContactFormValues>,
    defaultValues: defaultContactFormValues,
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
    if (dto) {
      reset(contactDtoToFormValues(dto))
      return
    }
    reset({
      ...defaultContactFormValues,
      contentLanguages: ["CKB", "KMR"],
      slugCkb: `peywend-${index + 1}`,
      active: true,
    })
  }, [dto, reset, index])

  const pending = createMut.isPending || updateMut.isPending
  const submitDisabled =
    pending || !isValid || (mode === "edit" && !isDirty)

  const contentLanguages = watch("contentLanguages")

  const onSubmit = handleSubmit(
    (values) => {
      const payload = contactFormValuesToPayload(values)
      const onSuccess = () => {
        toast(NS.toast.saved)
        onSaved()
      }
      const onError = (err: unknown) => {
        toastError(extractApiErrorMessage(err) ?? NS.error.validation)
      }

      if (mode === "create") {
        createMut.mutate(payload, { onSuccess, onError })
      } else if (contactId) {
        updateMut.mutate({ id: contactId, payload }, { onSuccess, onError })
      }
    },
    () => toastError(NS.error.validation),
  )

  const titlePreview = dto
    ? contactDisplayTitle(dto) || NS.section.unnamed
    : undefined

  return (
    <ContactSectionCardShell
      index={index}
      titlePreview={titlePreview}
      onSave={() => void onSubmit()}
      saveDisabled={submitDisabled}
      pending={pending}
      headerActions={
        onDelete ? (
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
        ) : null
      }
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
            {(["CKB", "KMR"] as const).map((lang) => {
              const on = contentLanguages.includes(lang)
              return (
                <button
                  key={lang}
                  type="button"
                  onClick={() => {
                    const next = on
                      ? contentLanguages.filter((l) => l !== lang)
                      : [...contentLanguages, lang]
                    if (next.length) {
                      setValue("contentLanguages", next, { shouldDirty: true })
                    }
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium",
                    on
                      ? lang === "CKB"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {lang === "CKB" ? NS.lang.ckb : NS.lang.kmr}
                </button>
              )
            })}
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
              />
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <LangBlock lang="CKB" register={register} control={control} />
          <LangBlock lang="KMR" register={register} control={control} />
        </div>

        <div className="border-border space-y-3 rounded-lg border p-4">
          <p className="text-xs font-medium">{NS.sidebar.contact_info}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input {...register("phone")} placeholder={NS.form.phone} dir="ltr" />
            <Input
              {...register("secondaryPhone")}
              placeholder={NS.form.secondary_phone}
              dir="ltr"
            />
            <Input
              type="email"
              {...register("email")}
              placeholder={NS.form.email}
              dir="ltr"
            />
            <Input
              {...register("mapEmbedUrl")}
              placeholder={NS.form.map_embed_url}
              dir="ltr"
            />
            <Input
              type="number"
              step="any"
              {...register("latitude", { valueAsNumber: true })}
              placeholder={NS.form.latitude}
              dir="ltr"
            />
            <Input
              type="number"
              step="any"
              {...register("longitude", { valueAsNumber: true })}
              placeholder={NS.form.longitude}
              dir="ltr"
            />
          </div>
        </div>
      </FormProvider>
    </ContactSectionCardShell>
  )
}
