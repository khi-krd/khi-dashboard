"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  CheckIcon,
  ExclamationCircleIcon,
  HashtagIcon,
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

import { CollectionAlbumEditor } from "@/components/image-collections/collection-album-editor"
import {
  CollectionBreadcrumbBar,
  dashboardCollectionsCrumbHref,
} from "@/components/image-collections/collection-breadcrumb"
import { CollectionCoverTrio } from "@/components/image-collections/collection-cover-trio"
import { CollectionCreditsInlineRow } from "@/components/image-collections/collection-credits-editor"
import { CollectionErrorState } from "@/components/image-collections/collection-error-state"
import { CollectionLanguageToggleChip } from "@/components/image-collections/collection-language-chip"
import { TiptapEditor } from "@/components/shared/tiptap-editor-lazy"
import { CollectionTopicCombobox } from "@/components/image-collections/collection-topic-combobox"
import { CollectionTypeToggle } from "@/components/image-collections/collection-type-toggle"
import { CollectionTagInput } from "@/components/image-collections/collection-tag-input"
import { NS } from "@/components/image-collections/collections-strings"
import { Button, buttonVariants } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  useCollectionDetailQuery,
  useCreateCollection,
  useUpdateCollection,
} from "@/hooks/useImageCollections"
import { formatCkbDigits } from "@/lib/intl-ckb"
import {
  formatFullTimestampKu,
  formatRelativeTimeKu,
} from "@/lib/news-relative-time"
import { formatBytes } from "@/lib/sound-format"
import {
  collectionDtoToFormValues,
  collectionFormSchema,
  createEmptyAlbumItem,
  defaultCollectionFormValues,
  type CollectionFormValues,
} from "@/lib/validations/image-collections"
import { cn } from "@/lib/utils"
import type { CollectionDto, Language } from "@/types/image-collections"

const sectionDivider =
  "mt-6 border-t border-border/60 pt-6 [&:first-child]:mt-0 [&:first-child]:border-t-0 [&:first-child]:pt-0"

const borderlessTitleClass =
  "w-full border-0 bg-transparent px-0 text-4xl leading-tight font-bold shadow-none placeholder:text-muted-foreground/50 focus:ring-0 focus-visible:ring-0"

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

export function CollectionForm({
  mode,
  collectionId,
}: {
  mode: "create" | "edit"
  collectionId?: number
}) {
  const router = useRouter()
  const idOk =
    mode === "create" ||
    (typeof collectionId === "number" && Number.isFinite(collectionId) && collectionId > 0)

  const detailQ = useCollectionDetailQuery(
    mode === "edit" && typeof collectionId === "number" ? collectionId : 0,
  )
  const editDto: CollectionDto | undefined =
    mode === "edit" && detailQ.data?.id ? detailQ.data : undefined

  const createMut = useCreateCollection()
  const updateMut = useUpdateCollection()

  const form = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionFormSchema) as Resolver<CollectionFormValues>,
    defaultValues: defaultCollectionFormValues(),
    mode: "onChange",
  })

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty, isValid },
  } = form

  useEffect(() => {
    if (editDto) reset(collectionDtoToFormValues(editDto))
  }, [editDto, reset])

  const [activeLang, setActiveLang] = useState<Language>("CKB")

  const contentLanguages = watch("contentLanguages")
  const collectionType = watch("collectionType")
  const topicId = watch("topicId")
  const newTopic = watch("newTopic")
  const imageAlbum = watch("imageAlbum")

  useEffect(() => {
    if (!contentLanguages.includes(activeLang) && contentLanguages[0]) {
      setActiveLang(contentLanguages[0])
    }
  }, [contentLanguages, activeLang])

  useEffect(() => {
    if (collectionType === "SINGLE" && imageAlbum.length > 1) {
      setValue("imageAlbum", [imageAlbum[0]!], { shouldDirty: true })
    }
  }, [collectionType, imageAlbum, setValue])

  const pending = createMut.isPending || updateMut.isPending
  const submitDisabled = !isDirty || !isValid || pending
  const errorCount = countFormErrors(errors)
  const langLabel = activeLang === "CKB" ? NS.lang.ckb : NS.lang.kmr

  const titleLen =
    activeLang === "CKB"
      ? (watch("ckbContent.title")?.length ?? 0)
      : (watch("kmrContent.title")?.length ?? 0)

  const tabMarkers = useMemo(() => {
    const m = { CKB: false, KMR: false }
    if (errors.ckbContent?.title) m.CKB = true
    if (errors.kmrContent?.title) m.KMR = true
    return m
  }, [errors])

  const totalBytes = imageAlbum.reduce((s, it) => s + (it.fileSizeBytes ?? 0), 0)

  async function onSubmit(values: CollectionFormValues) {
    try {
      if (mode === "create") {
        const res = await createMut.mutateAsync(values)
        if (res.id) {
          toast.success(NS.toast.created, {
            action: {
              label: NS.toast.view_action,
              onClick: () =>
                router.push(`/dashboard/image-collections/${res.id}`),
            },
          })
          router.push(`/dashboard/image-collections/${res.id}`)
        }
      } else if (collectionId) {
        await updateMut.mutateAsync({ id: collectionId, values })
        toast.success(NS.toast.updated)
        router.push(`/dashboard/image-collections/${collectionId}`)
      }
    } catch {
      toast.error(NS.error.validation)
    }
  }

  if (!idOk) {
    return (
      <div dir="rtl" className="px-6 py-12">
        <CollectionErrorState onRetry={() => router.push("/dashboard/image-collections")} />
      </div>
    )
  }

  if (mode === "edit" && detailQ.isLoading) {
    return (
      <div dir="rtl" className="flex justify-center px-6 py-12">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (mode === "edit" && (detailQ.isError || (!detailQ.isLoading && !editDto))) {
    return (
      <div dir="rtl" className="px-6 py-12">
        <CollectionErrorState onRetry={() => void detailQ.refetch()} />
      </div>
    )
  }

  return (
    <FormProvider {...form}>
      <form dir="rtl" className="pb-24" onSubmit={handleSubmit(onSubmit)}>
        <header className="border-border bg-background/95 supports-backdrop-filter:backdrop-blur sticky top-0 z-30 border-b">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
            <CollectionBreadcrumbBar
              segments={[
                { label: NS.breadcrumb.dashboard, href: dashboardCollectionsCrumbHref() },
                { label: NS.breadcrumb.collections, href: "/dashboard/image-collections" },
                {
                  label:
                    mode === "create" ? NS.breadcrumb.new : NS.breadcrumb.edit,
                },
              ]}
            />
            <Link
              href={
                mode === "edit" && collectionId
                  ? `/dashboard/image-collections/${collectionId}`
                  : "/dashboard/image-collections"
              }
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-md")}
            >
              {NS.action.back}
            </Link>
          </div>
        </header>

        <div
          dir="ltr"
          className="grid grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-8 lg:px-6"
        >
          <aside
            dir="rtl"
            className="space-y-6 rounded-xl border border-border bg-card p-6 text-sm lg:sticky lg:top-20 lg:self-start"
          >
            <section className={sectionDivider}>
              <Label className="text-muted-foreground mb-2 block text-xs uppercase">
                {NS.section.topic}
              </Label>
              <CollectionTopicCombobox
                topicId={topicId ?? null}
                newTopic={newTopic}
                onSelectTopic={(t) => {
                  setValue("topicId", t.id, { shouldDirty: true })
                  setValue("newTopic", undefined, { shouldDirty: true })
                  setValue("clearTopic", false, { shouldDirty: true })
                }}
                onClearTopic={() => {
                  setValue("topicId", null, { shouldDirty: true })
                  setValue("newTopic", undefined, { shouldDirty: true })
                  setValue("clearTopic", true, { shouldDirty: true })
                }}
                onCreateInline={(names) => {
                  setValue("newTopic", names, { shouldDirty: true })
                  setValue("topicId", null, { shouldDirty: true })
                  setValue("clearTopic", false, { shouldDirty: true })
                }}
              />
            </section>

            <section className={sectionDivider}>
              <Label className="text-muted-foreground mb-2 block text-xs uppercase">
                {NS.section.languages}
              </Label>
              <div className="flex flex-wrap gap-2">
                {(["CKB", "KMR"] as const).map((code) => {
                  const on = contentLanguages.includes(code)
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        const next = on
                          ? contentLanguages.filter((l) => l !== code)
                          : [...contentLanguages, code]
                        if (next.length) {
                          setValue("contentLanguages", next, { shouldDirty: true })
                          setActiveLang(code)
                        }
                      }}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs",
                        on
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-dashed text-muted-foreground",
                      )}
                    >
                      {code === "CKB" ? NS.lang.ckb : NS.lang.kmr}
                    </button>
                  )
                })}
              </div>
              {errors.contentLanguages ? (
                <FieldError className="mt-2">
                  {errors.contentLanguages.message}
                </FieldError>
              ) : null}
            </section>

            <section className={sectionDivider}>
              <Label className="text-muted-foreground mb-2 block text-xs uppercase">
                {NS.section.publish}
              </Label>
              <Input
                type="date"
                className="h-9"
                {...register("publishmentDate")}
              />
            </section>

            <section className={cn(sectionDivider, "space-y-2 text-xs")}>
              <Label className="text-muted-foreground uppercase">
                {NS.section.album_summary}
              </Label>
              <div className="flex justify-between">
                <span>{NS.summary.image_count}</span>
                <span>{formatCkbDigits(imageAlbum.length)}</span>
              </div>
              <div className="flex justify-between">
                <span>{NS.summary.total_size}</span>
                <span>{formatBytes(totalBytes)}</span>
              </div>
            </section>

            {mode === "edit" && editDto ? (
              <section className={cn(sectionDivider, "space-y-2 text-xs")}>
                <Label className="text-muted-foreground uppercase">
                  {NS.section.system}
                </Label>
                <div className="flex justify-between">
                  <span>{NS.system.id}</span>
                  <span className="font-mono">#{editDto.id}</span>
                </div>
                {editDto.createdAt ? (
                  <div className="flex justify-between">
                    <span>{NS.system.created_at}</span>
                    <span className="font-mono" title={formatFullTimestampKu(editDto.createdAt)}>
                      {formatRelativeTimeKu(editDto.createdAt)}
                    </span>
                  </div>
                ) : null}
                {editDto.updatedAt ? (
                  <div className="flex justify-between">
                    <span>{NS.system.updated_at}</span>
                    <span className="font-mono" title={formatFullTimestampKu(editDto.updatedAt)}>
                      {formatRelativeTimeKu(editDto.updatedAt)}
                    </span>
                  </div>
                ) : null}
              </section>
            ) : null}

            <p className="text-muted-foreground text-xs italic">
              {NS.help.save_requirements}
            </p>
          </aside>

          <div dir="rtl" className="mx-auto min-w-0 max-w-[860px] space-y-0">
            <div className="mb-6">
              <CollectionTypeToggle
                value={collectionType}
                editMode={mode === "edit"}
                extraItemCount={imageAlbum.length}
                onChange={(v) => {
                  setValue("collectionType", v, { shouldDirty: true })
                  if (v === "SINGLE" && imageAlbum.length > 1) {
                    setValue("imageAlbum", [imageAlbum[0]!], { shouldDirty: true })
                  }
                }}
              />
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              {(["CKB", "KMR"] as const).map((code) => (
                <CollectionLanguageToggleChip
                  key={code}
                  lang={code}
                  active={contentLanguages.includes(code) && activeLang === code}
                  invalid={tabMarkers[code]}
                  onToggle={() => {
                    if (contentLanguages.includes(code)) setActiveLang(code)
                  }}
                />
              ))}
            </div>

            <CollectionCoverTrio
              contentLanguages={contentLanguages}
              ckbCoverFile={watch("ckbCoverFile") ?? null}
              kmrCoverFile={watch("kmrCoverFile") ?? null}
              hoverCoverFile={watch("hoverCoverFile") ?? null}
              ckbCoverUrl={watch("ckbCoverUrl") ?? ""}
              kmrCoverUrl={watch("kmrCoverUrl") ?? ""}
              hoverCoverUrl={watch("hoverCoverUrl") ?? ""}
              existingCkbCoverUrl={watch("existingCkbCoverUrl") ?? null}
              existingKmrCoverUrl={watch("existingKmrCoverUrl") ?? null}
              existingHoverCoverUrl={watch("existingHoverCoverUrl") ?? null}
              onCkbFileChange={(f) => setValue("ckbCoverFile", f, { shouldDirty: true })}
              onKmrFileChange={(f) => setValue("kmrCoverFile", f, { shouldDirty: true })}
              onHoverFileChange={(f) =>
                setValue("hoverCoverFile", f, { shouldDirty: true })
              }
              onCkbUrlChange={(s) => setValue("ckbCoverUrl", s, { shouldDirty: true })}
              onKmrUrlChange={(s) => setValue("kmrCoverUrl", s, { shouldDirty: true })}
              onHoverUrlChange={(s) =>
                setValue("hoverCoverUrl", s, { shouldDirty: true })
              }
            />

            <div className="mt-6 space-y-1">
              <input
                type="text"
                className={borderlessTitleClass}
                placeholder={
                  activeLang === "CKB" ? NS.field.title.ckb : NS.field.title.kmr
                }
                maxLength={300}
                dir={activeLang === "KMR" ? "ltr" : "rtl"}
                {...register(
                  activeLang === "CKB" ? "ckbContent.title" : "kmrContent.title",
                )}
              />
              <p className="text-muted-foreground text-xs">
                {formatCkbDigits(titleLen)}/300
              </p>
              {activeLang === "CKB" && errors.ckbContent?.title ? (
                <FieldError>{errors.ckbContent.title.message}</FieldError>
              ) : null}
              {activeLang === "KMR" && errors.kmrContent?.title ? (
                <FieldError>{errors.kmrContent.title.message}</FieldError>
              ) : null}
            </div>

            <CollectionCreditsInlineRow activeLang={activeLang} />

            <TiptapEditor
              stickyToolbar
              lang={activeLang}
              placeholder={
                activeLang === "CKB" ? NS.field.body.ckb : NS.field.body.kmr
              }
              value={
                activeLang === "CKB"
                  ? (watch("ckbContent.description") ?? "")
                  : (watch("kmrContent.description") ?? "")
              }
              onChange={(v) =>
                setValue(
                  activeLang === "CKB" ? "ckbContent.description" : "kmrContent.description",
                  v,
                  { shouldDirty: true },
                )
              }
            />

            <CollectionAlbumEditor />

            <section className={sectionDivider}>
              <Label className="mb-2 flex items-center gap-2 text-sm">
                <HashtagIcon className="size-4" />
                {NS.section.tags} ({langLabel})
              </Label>
              <Controller
                name={activeLang === "CKB" ? "tags.ckb" : "tags.kmr"}
                control={control}
                render={({ field }) => (
                  <CollectionTagInput
                    value={field.value}
                    onChange={field.onChange}
                    variant="solid"
                  />
                )}
              />
            </section>

            <section className="mt-6">
              <Label className="mb-2 flex items-center gap-2 text-sm">
                <HashtagIcon className="size-4" />
                {NS.section.keywords} ({langLabel})
              </Label>
              <Controller
                name={activeLang === "CKB" ? "keywords.ckb" : "keywords.kmr"}
                control={control}
                render={({ field }) => (
                  <CollectionTagInput
                    value={field.value}
                    onChange={field.onChange}
                    variant="dashed"
                  />
                )}
              />
            </section>
          </div>
        </div>

        <div className="border-border bg-background/95 supports-backdrop-filter:backdrop-blur fixed inset-x-0 bottom-0 z-40 border-t pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex min-h-14 max-w-full items-center justify-between gap-3 px-4 py-3 lg:px-6">
            <div className="flex min-h-10 flex-1 flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              {isDirty ? (
                <span className="text-primary hidden items-center gap-2 lg:inline-flex">
                  <span className="bg-primary inline-flex size-2 rounded-full" aria-hidden />
                  {NS.unsaved.indicator}
                </span>
              ) : null}
              {errorCount > 0 ? (
                <span className="text-destructive inline-flex items-center gap-1 text-xs">
                  <ExclamationCircleIcon className="size-3.5 shrink-0" aria-hidden />
                  {formatCkbDigits(errorCount)} هەڵە
                </span>
              ) : null}
            </div>
            <div className="grid w-full grid-cols-2 gap-2 sm:ms-auto sm:flex sm:w-auto">
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  router.push(
                    mode === "edit" && collectionId
                      ? `/dashboard/image-collections/${collectionId}`
                      : "/dashboard/image-collections",
                  )
                }
              >
                {NS.action.cancel}
              </Button>
              <Button
                type="submit"
                disabled={submitDisabled}
                className="min-w-[9.5rem] shrink-0 gap-2"
              >
                {pending ? <Spinner className="size-4" /> : <CheckIcon className="size-4" />}
                {pending ? NS.action.saving : NS.action.save}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
