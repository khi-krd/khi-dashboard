"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  CheckIcon,
  ExclamationCircleIcon,
  MapPinIcon,
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

import {
  ProjectBreadcrumbBar,
  dashboardProjectsCrumbHref,
} from "@/components/projects/project-breadcrumb"
import { ProjectStatusPill } from "@/components/projects/project-status-pill"
import { MediaCoverUpload } from "@/components/shared/media-cover-upload"
import { ProjectTagInput } from "@/components/projects/project-tag-input"
import { TiptapEditor } from "@/components/shared/tiptap-editor"
import { ProjectTypeCombobox } from "@/components/projects/project-type-combobox"
import { ProjectsErrorState } from "@/components/projects/projects-error-state"
import { NS } from "@/components/projects/projects-strings"
import { Button, buttonVariants } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  useCreateProject,
  useProjectDetailQuery,
  useUpdateProject,
} from "@/hooks/useProjects"
import { useProjectsDerivedTypes } from "@/hooks/useProjectsDerivedTypes"
import {
  mergeProjectsDerivedTypes,
  pushInlineProjectType,
} from "@/lib/projects-derived-cache"
import { projectFormValuesToPayload } from "@/lib/projects-form-data"
import {
  formatFullTimestampKu,
  formatRelativeTimeKu,
} from "@/lib/news-relative-time"
import {
  defaultProjectFormValues,
  projectFormSchema,
  type ProjectFormValues,
} from "@/lib/validations/projects"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type { Language, ProjectDto } from "@/types/projects"
import { useQueryClient } from "@tanstack/react-query"
import { HashtagIcon, TagIcon } from "@heroicons/react/24/outline"

const sectionDivider =
  "mt-6 border-t border-border/60 pt-6 [&:first-child]:mt-0 [&:first-child]:border-t-0 [&:first-child]:pt-0"

const borderlessTitleClass =
  "w-full border-0 bg-transparent px-0 text-4xl leading-tight font-bold shadow-none placeholder:text-muted-foreground/50 focus:ring-0 focus-visible:ring-0"

const borderlessLocationClass =
  "w-full min-w-0 flex-1 border-0 bg-transparent px-0 text-base shadow-none placeholder:text-muted-foreground/50 focus:ring-0 focus-visible:ring-0"

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

function dtoToFormValues(d: ProjectDto): ProjectFormValues {
  const date =
    typeof d.projectDate === "string" && d.projectDate.length >= 10
      ? d.projectDate.slice(0, 10)
      : ""
  return {
    status: d.status ?? "ONGOING",
    contentLanguages:
      Array.isArray(d.contentLanguages) && d.contentLanguages.length
        ? d.contentLanguages
        : ["CKB"],
    projectTypeCkb: d.projectTypeCkb ?? "",
    projectTypeKmr: d.projectTypeKmr ?? "",
    coverUrl: d.coverUrl ?? null,
    existingCoverUrl: d.coverUrl ?? null,
    projectDate: date || undefined,
    ckbContent: {
      title: d.ckbContent?.title ?? "",
      description: d.ckbContent?.description ?? "",
      location: d.ckbContent?.location ?? "",
    },
    kmrContent: {
      title: d.kmrContent?.title ?? "",
      description: d.kmrContent?.description ?? "",
      location: d.kmrContent?.location ?? "",
    },
    tags: {
      ckb: d.tagsCkb ?? [],
      kmr: d.tagsKmr ?? [],
    },
    keywords: {
      ckb: d.keywordsCkb ?? [],
      kmr: d.keywordsKmr ?? [],
    },
  }
}

export function ProjectForm({
  mode,
  projectId,
}: {
  mode: "create" | "edit"
  projectId?: number
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const idOk =
    mode === "create" ||
    (typeof projectId === "number" && Number.isFinite(projectId) && projectId > 0)

  const detailQ = useProjectDetailQuery(
    mode === "edit" && typeof projectId === "number" ? projectId : 0,
  )
  const editDto =
    mode === "edit" && detailQ.data?.success === true && detailQ.data.data
      ? detailQ.data.data
      : undefined

  useEffect(() => {
    if (editDto) mergeProjectsDerivedTypes(queryClient, [editDto])
  }, [editDto, queryClient])

  const derivedTypes = useProjectsDerivedTypes()
  const createMut = useCreateProject()
  const updateMut = useUpdateProject()

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema) as Resolver<ProjectFormValues>,
    defaultValues: defaultProjectFormValues(),
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
    if (editDto) reset(dtoToFormValues(editDto))
  }, [editDto, reset])

  const [activeLang, setActiveLang] = useState<Language>("CKB")
  const contentLanguages = watch("contentLanguages")
  const coverUrl = watch("coverUrl")
  const existingCoverUrl = watch("existingCoverUrl")
  const status = watch("status")

  const coverPreviewUrl =
    (coverUrl?.trim() ? coverUrl.trim() : null) ??
    (existingCoverUrl?.trim() ? existingCoverUrl.trim() : null)

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

  async function onSubmit(values: ProjectFormValues) {
    const payload = projectFormValuesToPayload(values)
    try {
      if (mode === "create") {
        const res = await createMut.mutateAsync(payload)
        if (res.success && res.data?.id) {
          toast.success(NS.toast.saved, {
            action: {
              label: NS.toast.view_action,
              onClick: () => router.push(`/dashboard/projects/${res.data!.id}`),
            },
          })
          router.push(`/dashboard/projects/${res.data.id}`)
        }
      } else if (projectId) {
        const res = await updateMut.mutateAsync({ id: projectId, payload })
        if (res.success) {
          toast.success(NS.toast.saved)
          router.push(`/dashboard/projects/${projectId}`)
        }
      }
    } catch {
      toast.error(NS.validation.generic)
    }
  }

  if (mode === "edit" && detailQ.isLoading) {
    return (
      <div dir="rtl" className="px-6 py-12">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (mode === "edit" && (detailQ.isError || (!detailQ.isLoading && !editDto))) {
    return (
      <div dir="rtl" className="px-6 py-12">
        <ProjectsErrorState onRetry={() => void detailQ.refetch()} />
      </div>
    )
  }

  return (
    <FormProvider {...form}>
      <form
        dir="rtl"
        className="pb-24"
        onSubmit={handleSubmit(onSubmit)}
      >
        <header className="border-border bg-background/95 supports-backdrop-filter:backdrop-blur sticky top-0 z-30 border-b">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
            <ProjectBreadcrumbBar
              segments={[
                { label: NS.breadcrumb.dashboard, href: dashboardProjectsCrumbHref() },
                { label: NS.breadcrumb.projects, href: "/dashboard/projects" },
                {
                  label:
                    mode === "create" ? NS.breadcrumb.new : NS.breadcrumb.edit,
                },
              ]}
            />
            <Link
              href="/dashboard/projects"
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
            <div className="flex justify-center">
              {mode === "create" ? (
                <span className="text-muted-foreground rounded-md bg-muted px-2 py-1 text-xs">
                  {NS.status.draft_new}
                </span>
              ) : (
                <ProjectStatusPill status={status} />
              )}
            </div>

            <section className={sectionDivider}>
              <Label className="text-muted-foreground mb-2 block text-xs uppercase">
                {NS.col.status}
              </Label>
              <div className="grid grid-cols-2 gap-1 rounded-md border border-border p-1">
                {(["ONGOING", "COMPLETED"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setValue("status", s, { shouldDirty: true })}
                    className={cn(
                      "rounded-md py-1.5 text-xs font-medium",
                      status === s && s === "ONGOING" &&
                        "bg-amber-500/10 text-amber-700 dark:text-amber-400",
                      status === s && s === "COMPLETED" &&
                        "bg-primary/10 text-primary",
                      status !== s && "text-muted-foreground hover:bg-muted/50",
                    )}
                  >
                    {s === "ONGOING" ? NS.status.ongoing : NS.status.completed}
                  </button>
                ))}
              </div>
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
                <FieldError className="mt-2">{errors.contentLanguages.message}</FieldError>
              ) : null}
              <p className="text-muted-foreground mt-2 text-xs">لانیکەم زمانێک پێویستە</p>
            </section>

            <section className={sectionDivider}>
              <Label className="text-muted-foreground mb-2 block text-xs uppercase">
                {NS.section.type}
              </Label>
              <ProjectTypeCombobox
                items={derivedTypes.data ?? []}
                valueCkb={watch("projectTypeCkb") ?? ""}
                valueKmr={watch("projectTypeKmr") ?? ""}
                onChange={(ckb, kmr) => {
                  setValue("projectTypeCkb", ckb, { shouldDirty: true })
                  setValue("projectTypeKmr", kmr, { shouldDirty: true })
                  pushInlineProjectType(queryClient, {
                    projectTypeCkb: ckb,
                    projectTypeKmr: kmr,
                  })
                }}
              />
            </section>

            <section className={sectionDivider}>
              <Label className="text-muted-foreground mb-2 block text-xs uppercase">
                {NS.section.schedule}
              </Label>
              <Input type="date" {...register("projectDate")} className="h-9" />
              <p className="text-muted-foreground mt-1 text-xs">{NS.field.schedule_helper}</p>
            </section>

            {mode === "edit" && editDto ? (
              <section className={cn(sectionDivider, "space-y-2 text-xs")}>
                <Label className="text-muted-foreground uppercase">{NS.section.system}</Label>
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
                {editDto.createdBy ? (
                  <div className="flex justify-between">
                    <span>{NS.system.created_by}</span>
                    <span>{editDto.createdBy}</span>
                  </div>
                ) : null}
                {editDto.updatedBy ? (
                  <div className="flex justify-between">
                    <span>{NS.system.updated_by}</span>
                    <span>{editDto.updatedBy}</span>
                  </div>
                ) : null}
              </section>
            ) : null}

            <p className="text-muted-foreground text-xs italic">{NS.help.save_requirements}</p>
          </aside>

          <div dir="rtl" className="mx-auto min-w-0 max-w-[860px] space-y-0">
            <div className="mb-6 flex flex-wrap gap-2">
              {(["CKB", "KMR"] as const).map((code) => {
                const active = contentLanguages.includes(code)
                const current = activeLang === code
                return (
                  <button
                    key={code}
                    type="button"
                    disabled={!active}
                    onClick={() => setActiveLang(code)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      !active && "border-dashed opacity-40",
                      active && current && "border-primary bg-primary/10 text-primary",
                      active && !current && "border-border bg-muted text-muted-foreground",
                    )}
                  >
                    {code === "CKB" ? NS.lang.ckb : NS.lang.kmr}
                    {tabMarkers[code] ? (
                      <span className="bg-destructive ms-1 inline-block size-1.5 rounded-full" />
                    ) : null}
                  </button>
                )
              })}
            </div>

            <MediaCoverUpload
              previewUrl={coverPreviewUrl}
              urlValue={coverUrl ?? ""}
              onUrlChange={(v) => {
                setValue("coverUrl", v.length ? v : null, { shouldDirty: true })
                if (v.trim()) {
                  setValue("existingCoverUrl", null, { shouldDirty: true })
                } else if (mode === "edit" && editDto?.coverUrl) {
                  setValue("existingCoverUrl", editDto.coverUrl, {
                    shouldDirty: true,
                  })
                }
              }}
              urlError={
                typeof errors.coverUrl?.message === "string"
                  ? errors.coverUrl.message
                  : undefined
              }
            />

            {activeLang === "CKB" ? (
              <div className="mt-6 space-y-2">
                <Input
                  className={borderlessTitleClass}
                  placeholder={NS.field.title_ckb}
                  maxLength={255}
                  {...register("ckbContent.title")}
                />
                <p className="text-muted-foreground text-xs">
                  {formatCkbDigits(titleLen)}/255
                </p>
                {errors.ckbContent?.title ? (
                  <FieldError>{errors.ckbContent.title.message}</FieldError>
                ) : null}
                <div className="flex items-center gap-2">
                  <MapPinIcon className="text-muted-foreground size-4 shrink-0" />
                  <Input
                    className={borderlessLocationClass}
                    placeholder={NS.field.location_ckb}
                    maxLength={255}
                    {...register("ckbContent.location")}
                  />
                </div>
                <TiptapEditor
                  stickyToolbar
                  lang="CKB"
                  className="mt-6"
                  placeholder={NS.field.body_ckb}
                  value={watch("ckbContent.description") ?? ""}
                  onChange={(v) =>
                    setValue("ckbContent.description", v, { shouldDirty: true })
                  }
                />
              </div>
            ) : (
              <div className="mt-6 space-y-2">
                <Input
                  dir="ltr"
                  className={borderlessTitleClass}
                  placeholder={NS.field.title_kmr}
                  maxLength={255}
                  {...register("kmrContent.title")}
                />
                <div className="flex items-center gap-2">
                  <MapPinIcon className="text-muted-foreground size-4 shrink-0" />
                  <Input
                    dir="ltr"
                    className={borderlessLocationClass}
                    placeholder={NS.field.location_kmr}
                    {...register("kmrContent.location")}
                  />
                </div>
                <TiptapEditor
                  stickyToolbar
                  lang="KMR"
                  className="mt-6"
                  placeholder={NS.field.body_kmr}
                  value={watch("kmrContent.description") ?? ""}
                  onChange={(v) =>
                    setValue("kmrContent.description", v, { shouldDirty: true })
                  }
                />
              </div>
            )}

            <section className="mt-6">
              <Label className="mb-2 flex items-center gap-2 text-sm">
                <TagIcon className="size-4" />
                {NS.section.tags} ({langLabel})
              </Label>
              <Controller
                name={activeLang === "CKB" ? "tags.ckb" : "tags.kmr"}
                control={control}
                render={({ field }) => (
                  <ProjectTagInput
                    value={field.value}
                    onChange={field.onChange}
                    chipClassName="bg-muted text-foreground border border-border"
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
                  <ProjectTagInput
                    value={field.value}
                    onChange={field.onChange}
                    chipClassName="bg-transparent text-muted-foreground border border-dashed border-border"
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
                onClick={() => router.push("/dashboard/projects")}
              >
                {NS.action.cancel}
              </Button>
              <Button type="submit" disabled={submitDisabled} className="gap-2">
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
