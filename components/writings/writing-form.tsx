"use client"

import {
  CheckIcon,
  ExclamationCircleIcon,
  HashtagIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  Controller,
  FormProvider,
  useForm,
  type FieldErrors,
  type Resolver,
} from "react-hook-form"
import { toast } from "sonner"

import {
  WritingBreadcrumbBar,
  dashboardWritingsCrumbHref,
} from "@/components/writings/writing-breadcrumb"
import { WritingAudioCdSection } from "@/components/writings/writing-audio-cd-section"
import { WritingBookFileUploader } from "@/components/writings/writing-book-file-uploader"
import { ManagedOptionSegments } from "@/components/shared/managed-option-segments"
import { MO } from "@/components/writings/options/managed-options-strings"
import { WritingBookSearchSelect } from "@/components/writings/writing-book-search-select"
import { WritingCoverTrio } from "@/components/writings/writing-cover-trio"
import { WritingErrorState } from "@/components/writings/writing-error-state"
import { WritingGenreMultiselect } from "@/components/writings/writing-genre-multiselect"
import { WritingInstituteSwitch } from "@/components/writings/writing-institute-switch"
import { WritingLanguageToggleChip } from "@/components/writings/writing-language-chip"
import { WritingManagedOptionSelect } from "@/components/writings/writing-managed-option-select"
import { WritingPersonsSection } from "@/components/writings/writing-persons-section"
import { WritingSeriesSection } from "@/components/writings/writing-series-section"
import { WritingTagInput } from "@/components/writings/writing-tag-input"
import { LocationOptionSegments } from "@/components/shared/location-option-segments"
import { locationNameFor } from "@/components/shared/location-picker"
import { DRAFT_NS } from "@/components/shared/draft-strings"
import { DraftStatus } from "@/components/shared/draft-status"
import { TiptapEditor } from "@/components/shared/tiptap-editor-lazy"
import { UploadProgressLine } from "@/components/shared/upload-progress-line"
import { WritingTopicMultiselect } from "@/components/writings/writing-topic-multiselect"
import { NS } from "@/components/writings/writings-strings"
import { Button, buttonVariants } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useBookGenresQuery } from "@/hooks/useBookGenres"
import { useManagedOptionsQuery } from "@/hooks/useWritingOptions"
import { useFormDraft } from "@/hooks/use-form-draft"
import { useServerFormSync } from "@/hooks/use-server-form-sync"
import {
  useCreateWriting,
  useUpdateWriting,
  useWritingDetailQuery,
} from "@/hooks/useWritings"
import { applyServerFieldErrors } from "@/lib/api-errors"
import { permissiveResolver } from "@/lib/permissive-resolver"
import { preventImplicitFormSubmit } from "@/lib/prevent-implicit-submit"
import { toastApiError } from "@/lib/toast"
import {
  formatFullTimestampKu,
  formatRelativeTimeKu,
} from "@/lib/news-relative-time"
import { writingFormValuesToMultipart } from "@/lib/writings-form-data"
import {
  defaultWritingFormValues,
  writingDtoToFormValues,
  writingFormSchema,
  type WritingFormValues,
} from "@/lib/validations/writings"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/auth.store"
import {
  DEFAULT_EDITION_SLUG,
  DEFAULT_WRITING_TYPE_SLUG,
} from "@/types/managed-option"
import type { Language, WritingDto } from "@/types/writings"

const sectionCard =
  "rounded-xl border border-border/60 bg-card/50 p-5 shadow-xs"

const sectionHeading =
  "inline-flex items-center gap-2 text-sm font-semibold text-foreground before:h-3.5 before:w-1 before:rounded-full before:bg-primary/70 before:content-['']"

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

export function WritingForm({
  mode,
  writingId,
}: {
  mode: "create" | "edit"
  writingId?: number
}) {
  const router = useRouter()
  const idOk =
    mode === "create" ||
    (typeof writingId === "number" && Number.isFinite(writingId) && writingId > 0)

  const detailQ = useWritingDetailQuery(
    mode === "edit" && typeof writingId === "number" ? writingId : 0,
  )
  const editDto: WritingDto | undefined =
    mode === "edit" && detailQ.data?.id ? detailQ.data : undefined

  const createMut = useCreateWriting()
  const updateMut = useUpdateWriting()

  const form = useForm<WritingFormValues>({
    resolver: permissiveResolver(writingFormSchema) as Resolver<WritingFormValues>,
    defaultValues: defaultWritingFormValues,
    mode: "onChange",
  })

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = form

  // Re-seed from the server record whenever it changes — a bare `useEffect`
  // reset would also re-run on every refetch and wipe in-progress typing.
  useServerFormSync<WritingFormValues>({
    signature: editDto ? `${editDto.id}:${editDto.updatedAt ?? ""}` : null,
    buildValues: () => writingDtoToFormValues(editDto!),
    reset,
    isDirty,
  })

  const userKey = useAuthStore((s) => s.user?.username)
  const draft = useFormDraft<WritingFormValues>({
    entity: "writings",
    recordId: mode === "edit" ? writingId : undefined,
    form,
    userKey,
    enabled: mode === "create" || Boolean(editDto),
    recordUpdatedAt: editDto?.updatedAt,
  })

  useEffect(() => {
    if (draft.restored) toast.info(DRAFT_NS.toast.restored)
  }, [draft.restored])

  const [activeLang, setActiveLang] = useState<Language>("CKB")

  const contentLanguages = watch("contentLanguages")
  const topicIds = watch("topicIds")
  const newTopics = watch("newTopics")
  const seriesMode = watch("seriesMode")

  useEffect(() => {
    if (!contentLanguages.includes(activeLang) && contentLanguages[0]) {
      setActiveLang(contentLanguages[0])
    }
  }, [contentLanguages, activeLang])

  const pending = createMut.isPending || updateMut.isPending
  const submitDisabled = !isDirty || pending || isSubmitting
  const addAnotherRef = useRef(false)
  const errorCount = countFormErrors(errors)
  const [uploadPct, setUploadPct] = useState<number | null>(null)

  const langLabel = activeLang === "CKB" ? NS.lang.ckb : NS.lang.kmr

  const titleLen =
    activeLang === "CKB"
      ? (watch("ckbContent.title")?.length ?? 0)
      : (watch("kmrContent.title")?.length ?? 0)

  // Same query key the genre picker uses, so this shares its cache rather than
  // issuing a second request; it is read only to turn the picked slugs into ids.
  const genresQ = useBookGenresQuery(false)
  const typesQ = useManagedOptionsQuery("writing-types", false)
  const editionsQ = useManagedOptionsQuery("editions", false)

  // New books get کتێب + چاپی یەکەم pre-selected once the vocabularies load —
  // the spec's defaults, chosen without the editor lifting a finger. A value
  // that is already set (edit mode, or an editor's own pick) is never touched.
  useEffect(() => {
    if (mode !== "create") return
    if (!form.getValues("writingTypeId") && typesQ.data) {
      const book = typesQ.data.find((o) => o.slug === DEFAULT_WRITING_TYPE_SLUG)
      if (book?.id != null) form.setValue("writingTypeId", book.id)
    }
    if (!form.getValues("editionId") && editionsQ.data) {
      const first = editionsQ.data.find((o) => o.slug === DEFAULT_EDITION_SLUG)
      if (first?.id != null) form.setValue("editionId", first.id)
    }
  }, [mode, typesQ.data, editionsQ.data, form])

  const tabMarkers = useMemo(() => {
    const m = { CKB: false, KMR: false }
    if (errors.ckbContent?.title) m.CKB = true
    if (errors.kmrContent?.title) m.KMR = true
    return m
  }, [errors])

  async function onSubmit(values: WritingFormValues) {
    const fd = writingFormValuesToMultipart(
      mode,
      mode === "edit" ? writingId : undefined,
      values,
      genresQ.data,
      {
        wasChild:
          (editDto?.parentBookId ?? editDto?.seriesInfo?.parentBookId) != null,
        hadBookLanguage: editDto?.bookLanguage?.id != null,
        hadWritingType: editDto?.writingType?.id != null,
        hadEdition: editDto?.edition?.id != null,
        hadOriginalBook: editDto?.originalBook?.id != null,
      },
    )
    setUploadPct(0)
    try {
      if (mode === "create") {
        const res = await createMut.mutateAsync({
          formData: fd,
          onProgress: setUploadPct,
        })
        if (res.id) {
          draft.clear()
          if (addAnotherRef.current) {
            addAnotherRef.current = false
            reset(defaultWritingFormValues)
            toast.success(NS.toast.saved)
          } else {
            toast.success(NS.toast.saved, {
              action: {
                label: NS.toast.view_action,
                onClick: () => router.push(`/dashboard/writings/${res.id}`),
              },
            })
            router.push(`/dashboard/writings/${res.id}`)
          }
        }
      } else if (writingId) {
        await updateMut.mutateAsync({
          id: writingId,
          formData: fd,
          onProgress: setUploadPct,
        })
        draft.clear()
        toast.success(NS.toast.saved)
        router.push(`/dashboard/writings/${writingId}`)
      }
    } catch (err) {
      applyServerFieldErrors(form, err)
      toastApiError(err, NS.error.validation)
    } finally {
      addAnotherRef.current = false
      setUploadPct(null)
    }
  }

  if (!idOk) {
    return (
      <div dir="rtl" className="px-6 py-12">
        <WritingErrorState onRetry={() => router.push("/dashboard/writings")} />
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

  if (
    mode === "edit" &&
    (detailQ.isError || (!detailQ.isLoading && !editDto))
  ) {
    return (
      <div dir="rtl" className="px-6 py-12">
        <WritingErrorState onRetry={() => void detailQ.refetch()} />
      </div>
    )
  }

  return (
    <FormProvider {...form}>
      <form
        dir="rtl"
        className="pb-24"
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={preventImplicitFormSubmit}
      >
        <header className="border-border bg-background/95 supports-backdrop-filter:backdrop-blur sticky top-0 z-30 border-b">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
            <WritingBreadcrumbBar
              segments={[
                {
                  label: NS.breadcrumb.dashboard,
                  href: dashboardWritingsCrumbHref(),
                },
                { label: NS.breadcrumb.writings, href: "/dashboard/writings" },
                {
                  label:
                    mode === "create" ? NS.breadcrumb.new : NS.breadcrumb.edit,
                },
              ]}
            />
            <Link
              href={
                mode === "edit" && writingId
                  ? `/dashboard/writings/${writingId}`
                  : "/dashboard/writings"
              }
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "rounded-md",
              )}
            >
              {NS.action.back}
            </Link>
          </div>
        </header>

        <div
          dir="ltr"
          className="grid grid-cols-1 gap-6 px-4 py-6 xl:grid-cols-[340px_minmax(0,1fr)] lg:gap-8 lg:px-6"
        >
          <aside
            dir="rtl"
            className="space-y-6 text-sm xl:sticky xl:top-20 xl:self-start"
          >
            <section className={sectionCard}>
              <Controller
                name="bookGenres"
                control={control}
                render={({ field }) => (
                  <WritingGenreMultiselect
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.bookGenres?.message}
                  />
                )}
              />
            </section>

            <section className={sectionCard}>
              <WritingTopicMultiselect
                selectedIds={topicIds}
                pending={newTopics}
                onToggle={(t) => {
                  const next = topicIds.includes(t.id)
                    ? topicIds.filter((id) => id !== t.id)
                    : [...topicIds, t.id]
                  setValue("topicIds", next, { shouldDirty: true })
                }}
                onRemovePending={(i) => {
                  setValue(
                    "newTopics",
                    newTopics.filter((_, idx) => idx !== i),
                    { shouldDirty: true },
                  )
                }}
                onCreateInline={(names) => {
                  setValue("newTopics", [...newTopics, names], {
                    shouldDirty: true,
                  })
                }}
                onClearAll={() => {
                  setValue("topicIds", [], { shouldDirty: true })
                  setValue("newTopics", [], { shouldDirty: true })
                }}
              />
            </section>

            <section className={sectionCard}>
              <WritingInstituteSwitch
                checked={watch("publishedByInstitute")}
                onCheckedChange={(v) =>
                  setValue("publishedByInstitute", v, { shouldDirty: true })
                }
              />
            </section>

            <section className={cn(sectionCard, "space-y-4")}>
              <div>
                <Label className="text-muted-foreground mb-2 block text-xs uppercase">
                  {NS.section.writing_type}
                </Label>
                <WritingManagedOptionSelect
                  kind="writing-types"
                  value={watch("writingTypeId") ?? null}
                  onChange={(id) =>
                    setValue("writingTypeId", id, { shouldDirty: true })
                  }
                  label={NS.field.writing_type_helper}
                  manageHref="/dashboard/writings/options?tab=writing-types"
                />
              </div>
              <div>
                <Label className="text-muted-foreground mb-2 block text-xs uppercase">
                  {NS.section.edition}
                </Label>
                <WritingManagedOptionSelect
                  kind="editions"
                  value={watch("editionId") ?? null}
                  onChange={(id) =>
                    setValue("editionId", id, { shouldDirty: true })
                  }
                  label={NS.field.edition_helper}
                  manageHref="/dashboard/writings/options?tab=editions"
                />
              </div>
              <div>
                <Label className="text-muted-foreground mb-2 block text-xs uppercase">
                  {NS.section.original_book}
                </Label>
                <WritingBookSearchSelect
                  value={watch("originalBookId") ?? null}
                  selectedTitle={
                    editDto?.originalBook?.titleCkb ??
                    editDto?.originalBook?.titleKmr
                  }
                  excludeId={editDto?.id}
                  onChange={(id) =>
                    setValue("originalBookId", id, { shouldDirty: true })
                  }
                  placeholder={NS.field.original_book_ph}
                  clearLabel={NS.field.original_book_clear}
                  emptyLabel={NS.field.original_book_empty}
                />
                <p className="text-muted-foreground mt-1.5 text-xs">
                  {NS.field.original_book_helper}
                </p>
              </div>
            </section>

            <section className={cn(sectionCard, "space-y-3")}>
              <div className="flex items-center justify-between gap-2">
                <Label className="text-muted-foreground text-xs uppercase">
                  {NS.section.book_language}
                </Label>
                <Link
                  href="/dashboard/writings/options?tab=book-languages"
                  className="text-muted-foreground hover:text-foreground text-xs underline-offset-4 transition-colors hover:underline"
                >
                  {MO.action.manage}
                </Link>
              </div>
              <ManagedOptionSegments
                kind="book-languages"
                value={watch("bookLanguageId") ?? null}
                onChange={(id) =>
                  setValue("bookLanguageId", id, { shouldDirty: true })
                }
                showKmr
              />
            </section>

            <section className={sectionCard}>
              <WritingSeriesSection
                seriesMode={seriesMode}
                onSeriesModeChange={(m) =>
                  setValue("seriesMode", m, { shouldDirty: true })
                }
                parentBookId={watch("parentBookId")}
                onParentBookIdChange={(id) =>
                  setValue("parentBookId", id, { shouldDirty: true })
                }
                seriesTotalBooks={watch("seriesTotalBooks")}
                onSeriesTotalBooksChange={(n) =>
                  setValue("seriesTotalBooks", n, { shouldDirty: true })
                }
                bookTitle={watch("ckbContent.title") ?? ""}
                savedParentId={
                  editDto?.parentBookId ?? editDto?.seriesInfo?.parentBookId
                }
                savedOrder={watch("seriesOrder") ?? null}
                savedTotal={
                  editDto?.seriesInfo?.totalBooks ??
                  editDto?.seriesTotalBooks ??
                  null
                }
                savedSeriesName={
                  editDto?.seriesName ?? editDto?.seriesInfo?.seriesName
                }
                rootChildCount={
                  editDto?.seriesInfo?.isParent === true &&
                  (editDto?.seriesInfo?.memberCount ?? 0) > 1
                    ? (editDto?.seriesInfo?.memberCount ?? 1) - 1
                    : undefined
                }
                excludeId={editDto?.id}
              />
            </section>

            <section className={sectionCard}>
              <Label className={cn(sectionHeading, "mb-2")}>
                {NS.field.location}
              </Label>
              <LocationOptionSegments
                  ckbValue={watch("ckbContent.location")}
                  kmrValue={watch("kmrContent.location")}
                  onPick={(loc) => {
                    setValue("ckbContent.location", loc ? locationNameFor(loc, "CKB") : "", { shouldDirty: true })
                    setValue("kmrContent.location", loc ? locationNameFor(loc, "KMR") : "", { shouldDirty: true })
                  }}
                />
                          </section>

            {mode === "edit" && editDto ? (

              <section className={cn(sectionCard, "space-y-2 text-xs")}>
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
                    <span title={formatFullTimestampKu(editDto.createdAt)}>
                      {formatRelativeTimeKu(editDto.createdAt)}
                    </span>
                  </div>
                ) : null}
                {editDto.updatedAt ? (
                  <div className="flex justify-between">
                    <span>{NS.system.updated_at}</span>
                    <span title={formatFullTimestampKu(editDto.updatedAt)}>
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

          <div dir="rtl" className="mx-auto w-full min-w-0 max-w-[860px] space-y-0">
            <div className="mb-6 flex flex-wrap gap-2">
              {(["CKB", "KMR"] as const).map((code) => (
                <span key={code} className={contentLanguages.includes(code) ? "" : "opacity-50"}>
                  <WritingLanguageToggleChip
                    lang={code}
                    active={contentLanguages.includes(code) && activeLang === code}
                    hasError={tabMarkers[code]}
                    onClick={() => {
                    const on = contentLanguages.includes(code)
                    if (!on) {
                      setValue("contentLanguages", [...contentLanguages, code], { shouldDirty: true })
                      setActiveLang(code)
                    } else if (activeLang === code && contentLanguages.length > 1) {
                      const next = contentLanguages.filter((l) => l !== code)
                      setValue("contentLanguages", next, { shouldDirty: true })
                      setActiveLang(next[0])
                    } else {
                      setActiveLang(code)
                    }
                  }}
                  />
                </span>
              ))}
            </div>

            <WritingCoverTrio
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
              onCkbFileChange={(f) =>
                setValue("ckbCoverFile", f, { shouldDirty: true })
              }
              onKmrFileChange={(f) =>
                setValue("kmrCoverFile", f, { shouldDirty: true })
              }
              onHoverFileChange={(f) =>
                setValue("hoverCoverFile", f, { shouldDirty: true })
              }
              onCkbUrlChange={(s) =>
                setValue("ckbCoverUrl", s, { shouldDirty: true })
              }
              onKmrUrlChange={(s) =>
                setValue("kmrCoverUrl", s, { shouldDirty: true })
              }
              onHoverUrlChange={(s) =>
                setValue("hoverCoverUrl", s, { shouldDirty: true })
              }
            />

            {activeLang === "CKB" ? (
              // The branch key remounts every registered input inside —
              // react-hook-form only writes a value into a field when it
              // attaches to a new element, so a reused element would keep the
              // other language's text and overwrite it on the next keystroke.
              <div key="ckb" className="mt-6 space-y-3">
                <Input
                  className={borderlessTitleClass}
                  placeholder={NS.field.title_ckb}
                  {...register("ckbContent.title")}
                />
                <p className="text-muted-foreground text-xs">
                  {formatCkbDigits(titleLen)}/300
                </p>
                {errors.ckbContent?.title ? (
                  <FieldError>{errors.ckbContent.title.message}</FieldError>
                ) : null}
                <div className="space-y-1">
                  <Label className="text-xs">{NS.section.persons}</Label>
                  <WritingPersonsSection lang="CKB" />
                </div>
                <TiptapEditor entity="writings"
                  stickyToolbar
                  lang="CKB"
                  placeholder={NS.field.body_ckb}
                  value={watch("ckbContent.description") ?? ""}
                  onChange={(v) =>
                    setValue("ckbContent.description", v, { shouldDirty: true })
                  }
                />
              </div>
            ) : (
              <div key="kmr" className="mt-6 space-y-3">
                <Input
                  dir="ltr"
                  className={borderlessTitleClass}
                  placeholder={NS.field.title_kmr}
                  {...register("kmrContent.title")}
                />
                {errors.kmrContent?.title ? (
                  <FieldError>{errors.kmrContent.title.message}</FieldError>
                ) : null}
                <div className="space-y-1">
                  <Label className="text-xs">{NS.section.persons}</Label>
                  <WritingPersonsSection lang="KMR" />
                </div>
                <TiptapEditor entity="writings"
                  stickyToolbar
                  lang="KMR"
                  placeholder={NS.field.body_kmr}
                  value={watch("kmrContent.description") ?? ""}
                  onChange={(v) =>
                    setValue("kmrContent.description", v, { shouldDirty: true })
                  }
                />
              </div>
            )}

            <section className={cn("mt-6", sectionCard)}>
              <h2 className={cn("mb-3", sectionHeading)}>{NS.section.book_files}</h2>
              <div className="space-y-4">
                <WritingBookFileUploader
                  lang="CKB"
                  inactive={!contentLanguages.includes("CKB")}
                  stagedFile={watch("ckbBookFile") ?? null}
                  content={{
                    fileUrl: watch("ckbContent.fileUrl"),
                    fileFormat: watch("ckbContent.fileFormat"),
                    fileSizeBytes: watch("ckbContent.fileSizeBytes"),
                    pageCount: watch("ckbContent.pageCount"),
                  }}
                  existingFileUrl={editDto?.ckbContent?.fileUrl}
                  onStagedFileChange={(f) =>
                    setValue("ckbBookFile", f, { shouldDirty: true })
                  }
                  onContentChange={(patch) => {
                    const cur = watch("ckbContent") ?? { fileSizeBytes: 0 }
                    setValue(
                      "ckbContent",
                      { ...cur, fileSizeBytes: cur.fileSizeBytes ?? 0, ...patch },
                      { shouldDirty: true },
                    )
                  }}
                />
                <WritingBookFileUploader
                  lang="KMR"
                  inactive={!contentLanguages.includes("KMR")}
                  stagedFile={watch("kmrBookFile") ?? null}
                  content={{
                    fileUrl: watch("kmrContent.fileUrl"),
                    fileFormat: watch("kmrContent.fileFormat"),
                    fileSizeBytes: watch("kmrContent.fileSizeBytes"),
                    pageCount: watch("kmrContent.pageCount"),
                  }}
                  existingFileUrl={editDto?.kmrContent?.fileUrl}
                  onStagedFileChange={(f) =>
                    setValue("kmrBookFile", f, { shouldDirty: true })
                  }
                  onContentChange={(patch) => {
                    const cur = watch("kmrContent") ?? { fileSizeBytes: 0 }
                    setValue(
                      "kmrContent",
                      { ...cur, fileSizeBytes: cur.fileSizeBytes ?? 0, ...patch },
                      { shouldDirty: true },
                    )
                  }}
                />
              </div>
            </section>

            <section className={cn("mt-6", sectionCard)}>
              <h2 className={cn("mb-3", sectionHeading)}>{NS.section.audio_cd}</h2>
              <WritingAudioCdSection
                audioFile={watch("audioFile") ?? null}
                audioUrl={watch("audioUrl") ?? ""}
                cdCoverFile={watch("cdCoverFile") ?? null}
                cdCoverUrl={watch("cdCoverUrl") ?? ""}
                onAudioFileChange={(f) =>
                  setValue("audioFile", f, { shouldDirty: true })
                }
                onAudioUrlChange={(s) =>
                  setValue("audioUrl", s, { shouldDirty: true })
                }
                onCdCoverFileChange={(f) =>
                  setValue("cdCoverFile", f, { shouldDirty: true })
                }
                onCdCoverUrlChange={(s) =>
                  setValue("cdCoverUrl", s, { shouldDirty: true })
                }
              />
            </section>

            <section className={cn("mt-6", sectionCard)}>
              <Label className={cn("mb-2", sectionHeading)}>
                <HashtagIcon className="size-4" />
                {NS.section.tags} ({langLabel})
              </Label>
              <Controller
                name={activeLang === "CKB" ? "tags.ckb" : "tags.kmr"}
                control={control}
                render={({ field }) => (
                  <WritingTagInput
                    value={field.value}
                    onChange={field.onChange}
                    variant="solid"
                  />
                )}
              />
            </section>

            <section className={cn("mt-6", sectionCard)}>
              <Label className={cn("mb-2", sectionHeading)}>
                <HashtagIcon className="size-4" />
                {NS.section.keywords} ({langLabel})
              </Label>
              <Controller
                name={activeLang === "CKB" ? "keywords.ckb" : "keywords.kmr"}
                control={control}
                render={({ field }) => (
                  <WritingTagInput
                    value={field.value}
                    onChange={field.onChange}
                    variant="dashed"
                  />
                )}
              />
            </section>

          </div>
        </div>

        <div
          className={cn(
            "border-border bg-background/95 supports-backdrop-filter:backdrop-blur fixed inset-x-0 bottom-0 z-40 border-t",
            "shadow-[0_-8px_24px_-16px_rgb(0_0_0/0.25)]",
            "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
          )}
        >
          {uploadPct != null ? (
            <div className="mx-auto max-w-full px-4 pt-3 lg:px-6">
              <UploadProgressLine value={uploadPct} label={NS.action.saving} />
            </div>
          ) : null}
          <div className="mx-auto flex min-h-14 max-w-full items-center justify-between gap-3 px-4 py-3 lg:px-6">
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
                  <ExclamationCircleIcon className="size-3.5 shrink-0" aria-hidden />
                  {formatCkbDigits(errorCount)} هەڵە
                </span>
              ) : null}
              <DraftStatus status={draft.status} restored={draft.restored} />
            </div>
            <div className="grid w-full grid-cols-2 gap-2 sm:ms-auto sm:flex sm:w-auto">
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  router.push(
                    mode === "edit" && writingId
                      ? `/dashboard/writings/${writingId}`
                      : "/dashboard/writings",
                  )
                }
              >
                {NS.action.cancel}
              </Button>
              {mode === "create" ? (
                <Button
                  type="submit"
                  variant="outline"
                  disabled={submitDisabled}
                  className="gap-2"
                  onClick={() => {
                    addAnotherRef.current = true
                  }}
                >
                  {pending ? (
                    <Spinner className="size-4" />
                  ) : (
                    <CheckIcon className="size-4" />
                  )}
                  {NS.action.save_new}
                </Button>
              ) : null}
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
