"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CheckIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Fragment, useEffect, useMemo, useState } from "react"
import {
  Controller,
  FormProvider,
  useForm,
  type Control,
  type FieldErrors,
  type Resolver,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
} from "react-hook-form"
import { toast } from "sonner"

import {
  dashboardNewsCrumbHref,
  NewsBreadcrumbBar,
  newsListCrumbLabel,
} from "@/components/news/news-breadcrumb"
import { NewsCategoryCombobox } from "@/components/news/news-category-combobox"
import { NewsErrorState } from "@/components/news/news-error-state"
import { NS } from "@/components/news/news-strings"
import { MediaCoverUpload } from "@/components/shared/media-cover-upload"
import { NewsTagInput } from "@/components/news/news-tag-input"
import { TiptapEditor } from "@/components/shared/tiptap-editor-lazy"
import { Button, buttonVariants } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  useCreateNews,
  useNewsDetailQuery,
  useUpdateNews,
} from "@/hooks/useNews"
import {
  useNewsDerivedCategories,
  useNewsDerivedSubcategories,
} from "@/hooks/useNewsDerivedTaxonomy"
import {
  mergeNewsDerivedTaxonomy,
  pushInlineCategory,
  pushInlineSubcategory,
} from "@/lib/news-derived-cache"
import { newsFormValuesToPayload } from "@/lib/news-form-data"
import {
  formatFullTimestampKu,
  formatRelativeTimeKu,
} from "@/lib/news-relative-time"
import {
  defaultNewsFormValues,
  newsFormSchema,
  type NewsFormValues,
} from "@/lib/validations/news"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type { Language, NewsDto } from "@/types/news"
import { useQueryClient } from "@tanstack/react-query"

const sectionDivider =
  "mt-6 border-t border-border/60 pt-6 [&:first-child]:mt-0 [&:first-child]:border-t-0 [&:first-child]:pt-0"

function dtoToFormValues(d: NewsDto): NewsFormValues {
  const date =
    typeof d.datePublished === "string" && d.datePublished.length >= 10
      ? d.datePublished.slice(0, 10)
      : ""
  return {
    contentLanguages:
      Array.isArray(d.contentLanguages) && d.contentLanguages.length
        ? d.contentLanguages
        : ["CKB"],
    category: d.category ?? { ckbName: "", kmrName: "" },
    subCategory: d.subCategory ?? { ckbName: "", kmrName: "" },
    coverUrl: d.coverUrl ?? null,
    existingCoverUrl: d.coverUrl ?? null,
    datePublished: date || undefined,
    ckbContent: {
      title: d.ckbContent?.title ?? "",
      description: d.ckbContent?.description ?? "",
    },
    kmrContent: {
      title: d.kmrContent?.title ?? "",
      description: d.kmrContent?.description ?? "",
    },
    tags: {
      ckb: d.tags?.ckb ?? [],
      kmr: d.tags?.kmr ?? [],
    },
    keywords: {
      ckb: d.keywords?.ckb ?? [],
      kmr: d.keywords?.kmr ?? [],
    },
  }
}

export function NewsForm({
  mode,
  newsId,
}: {
  mode: "create" | "edit"
  newsId?: number
}) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const idOk =
    mode === "create" ||
    (typeof newsId === "number" && Number.isFinite(newsId) && newsId > 0)

  const detailQ = useNewsDetailQuery(
    mode === "edit" && typeof newsId === "number" ? newsId : 0,
  )

  const editDto =
    mode === "edit" &&
    detailQ.data?.success === true &&
    detailQ.data.data
      ? detailQ.data.data
      : undefined

  useEffect(() => {
    if (editDto) mergeNewsDerivedTaxonomy(queryClient, [editDto])
  }, [editDto, queryClient])

  const formDefaults = useMemo(
    () => (mode === "create" ? defaultNewsFormValues() : undefined),
    [mode],
  )

  const formMethods = useForm<NewsFormValues>({
    resolver: zodResolver(newsFormSchema) as Resolver<NewsFormValues>,
    defaultValues: formDefaults ?? defaultNewsFormValues(),
    mode: "onChange",
  })

  const {
    handleSubmit,
    control,
    register,
    watch,
    reset,
    setValue,
    formState: { errors, isDirty, isValid },
  } = formMethods

  useEffect(() => {
    if (mode !== "edit" || !editDto?.id) return
    reset(dtoToFormValues(editDto))
  }, [editDto, mode, reset])

  const contentLanguages = watch("contentLanguages")
  const category = watch("category")
  const coverUrl = watch("coverUrl")
  const existingCoverUrl = watch("existingCoverUrl")

  const ckbTitleLen = watch("ckbContent.title")?.trim().length ?? 0
  const kmrTitleLen = watch("kmrContent.title")?.trim().length ?? 0

  const [activeLangTab, setActiveLangTab] = useState<Language>(() =>
    contentLanguages.includes("CKB") ? "CKB" : "KMR",
  )

  useEffect(() => {
    if (
      typeof contentLanguages === "undefined" ||
      contentLanguages.length === 0
    )
      return
    if (!contentLanguages.includes(activeLangTab)) {
      setActiveLangTab(contentLanguages[0] ?? "CKB")
    }
  }, [contentLanguages, activeLangTab])

  const catsQ = useNewsDerivedCategories()
  const derivedCats = catsQ.data ?? []

  const { items: subcatItems } = useNewsDerivedSubcategories(
    category?.ckbName?.trim(),
  )

  const createMut = useCreateNews()
  const updateMut = useUpdateNews()
  const pending = createMut.isPending || updateMut.isPending

  const tabMarkers = {
    CKB: Boolean(errors.ckbContent || errors.tags?.ckb || errors.keywords?.ckb),
    KMR: Boolean(errors.kmrContent || errors.tags?.kmr || errors.keywords?.kmr),
  }

  const coverPreviewUrl =
    (coverUrl?.trim() ? coverUrl.trim() : null) ??
    (existingCoverUrl?.trim() ? existingCoverUrl.trim() : null)

  async function onSubmit(values: NewsFormValues) {
    try {
      const payload = newsFormValuesToPayload(values)
      if (mode === "create") {
        const res = await createMut.mutateAsync(payload)
        const newId = res.data?.id
        toast.success(NS.toast.created, {
          action:
            typeof newId === "number"
              ? {
                  label: NS.action.view,
                  onClick: () => router.push(`/dashboard/news/${newId}`),
                }
              : undefined,
        })
        if (typeof newId === "number") {
          router.push(`/dashboard/news/${newId}`)
        } else {
          router.push("/dashboard/news")
        }
        router.refresh()
        return
      }
      if (!newsId) return
      await updateMut.mutateAsync({ id: newsId, payload })
      toast.success(NS.toast.updated, {
        action: {
          label: NS.action.view,
          onClick: () => router.push(`/dashboard/news/${newsId}`),
        },
      })
      router.push(`/dashboard/news/${newsId}`)
      router.refresh()
    } catch {
      toast.error(NS.error.generic)
    }
  }

  if (!idOk) {
    return (
      <div dir="rtl">
        <p className="text-muted-foreground text-sm">{NS.error.generic}</p>
      </div>
    )
  }

  if (mode === "edit" && detailQ.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center" dir="rtl">
        <Spinner className="size-8" aria-hidden />
      </div>
    )
  }

  if (mode === "edit" && detailQ.isError) {
    return (
      <div dir="rtl">
        <NewsErrorState onRetry={() => void detailQ.refetch()} />
      </div>
    )
  }

  if (mode === "edit" && !editDto?.id) {
    return (
      <div className="text-muted-foreground text-sm" dir="rtl">
        {NS.notFound.title}
      </div>
    )
  }

  const submitDisabled = !isDirty || !isValid || pending

  const bothLangActive =
    contentLanguages.includes("CKB") && contentLanguages.includes("KMR")

  return (
    <FormProvider {...formMethods}>
      <form
        className="pb-24 max-sm:pb-28"
        dir="rtl"
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      >
        <TooltipProvider delay={250}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <NewsBreadcrumbBar
              segments={[
                {
                  label: NS.breadcrumb.dashboard,
                  href: dashboardNewsCrumbHref(),
                },
                {
                  label: newsListCrumbLabel(),
                  href: "/dashboard/news",
                },
                mode === "create"
                  ? { label: NS.action.new }
                  : { label: NS.action.edit },
              ]}
            />
            <Link
              href="/dashboard/news"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "rounded-md shrink-0",
              )}
            >
              {NS.action.back}
            </Link>
          </div>

          <header className="mb-8 space-y-1">
            <h1 className="text-xl font-semibold md:text-2xl">
              {mode === "create" ? NS.action.new : NS.action.edit}
            </h1>
            <p className="text-muted-foreground text-sm">{NS.page.subtitle}</p>
          </header>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="space-y-6 lg:col-span-2">
              <section className={cn("space-y-6", sectionDivider)}>
                {bothLangActive ? (
                  <Tabs
                    value={activeLangTab}
                    onValueChange={(v) => setActiveLangTab(v as Language)}
                  >
                    <TabsList variant="default" className="h-auto w-full flex-wrap p-1">
                      <TabsTrigger
                        value="CKB"
                        className="gap-2 data-active:text-primary"
                      >
                        {NS.lang.ckb}
                        {tabMarkers.CKB ? (
                          <span className="inline-flex size-1.5 rounded-full bg-destructive" aria-hidden />
                        ) : null}
                      </TabsTrigger>
                      <TabsTrigger
                        value="KMR"
                        className="gap-2 data-active:text-primary"
                      >
                        {NS.lang.kmr}
                        {tabMarkers.KMR ? (
                          <span className="inline-flex size-1.5 rounded-full bg-destructive" aria-hidden />
                        ) : null}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="CKB" className="mt-4 space-y-5">
                      <CkbLangFields
                        errors={errors}
                        register={register}
                        watch={watch}
                        setValue={setValue}
                        control={control}
                        ckbTitleLen={ckbTitleLen}
                      />
                    </TabsContent>
                    <TabsContent value="KMR" className="mt-4 space-y-5">
                      <KmrLangFields
                        errors={errors}
                        register={register}
                        watch={watch}
                        setValue={setValue}
                        control={control}
                        kmrTitleLen={kmrTitleLen}
                      />
                    </TabsContent>
                  </Tabs>
                ) : contentLanguages.includes("CKB") ? (
                  <CkbLangFields
                    errors={errors}
                    register={register}
                    watch={watch}
                    setValue={setValue}
                    control={control}
                    ckbTitleLen={ckbTitleLen}
                  />
                ) : (
                  <KmrLangFields
                    errors={errors}
                    register={register}
                    watch={watch}
                    setValue={setValue}
                    control={control}
                    kmrTitleLen={kmrTitleLen}
                  />
                )}
              </section>

              <section className={cn("space-y-4", sectionDivider)}>
                <h2 className="text-sm font-semibold text-foreground">
                  {NS.section.classification}
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <Label htmlFor="nf-category">{NS.field.category}</Label>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <NewsCategoryCombobox
                          variant="category"
                          items={derivedCats}
                          value={
                            field.value.ckbName || field.value.kmrName
                              ? field.value
                              : null
                          }
                          onChange={(c) => {
                            field.onChange(c ?? { ckbName: "", kmrName: "" })
                            setValue("subCategory", { ckbName: "", kmrName: "" })
                          }}
                          labelId="nf-category"
                          allowCreate
                          onCreateInline={(c) =>
                            pushInlineCategory(queryClient, c)
                          }
                        />
                      )}
                    />
                    <FieldError className="text-xs">
                      {errors.category?.ckbName?.message ||
                        errors.category?.kmrName?.message}
                    </FieldError>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="nf-subcategory">{NS.field.subcategory}</Label>
                    <Controller
                      name="subCategory"
                      control={control}
                      render={({ field }) => (
                        <NewsCategoryCombobox
                          variant="subcategory"
                          disabled={!category?.ckbName?.trim()}
                          items={subcatItems.map((s) => ({
                            ckbName: s.ckbName,
                            kmrName: s.kmrName,
                          }))}
                          value={
                            field.value.ckbName || field.value.kmrName
                              ? field.value
                              : null
                          }
                          onChange={(c) =>
                            field.onChange(c ?? { ckbName: "", kmrName: "" })
                          }
                          labelId="nf-subcategory"
                          allowCreate={Boolean(category?.ckbName?.trim())}
                          onCreateInline={
                            category?.ckbName?.trim()
                              ? (s) =>
                                  pushInlineSubcategory(
                                    queryClient,
                                    category.ckbName.trim(),
                                    s,
                                  )
                              : undefined
                          }
                        />
                      )}
                    />
                    <FieldError className="text-xs">
                      {errors.subCategory?.ckbName?.message ||
                        errors.subCategory?.kmrName?.message}
                    </FieldError>
                  </div>
                </div>
              </section>

            </div>

            <aside className="space-y-6 lg:sticky lg:top-20 lg:col-span-1 lg:self-start">
              <section className={cn("space-y-3", sectionDivider)}>
                <h2 className="text-sm font-semibold text-foreground inline-flex flex-wrap items-center gap-2">
                  {NS.section.cover}
                  <span
                    className="text-destructive"
                    aria-hidden
                    title={NS.field.cover_required}
                  >
                    •
                  </span>
                </h2>
                <Controller
                  name="coverUrl"
                  control={control}
                  render={({ field }) => (
                    <MediaCoverUpload
                      previewUrl={coverPreviewUrl}
                      urlValue={field.value ?? ""}
                      urlError={
                        typeof errors.coverUrl?.message === "string"
                          ? errors.coverUrl.message
                          : undefined
                      }
                      onUrlChange={(s) => {
                        field.onChange(s.length ? s : null, {
                          shouldDirty: true,
                        })
                        if (s.trim()) {
                          setValue("existingCoverUrl", null, {
                            shouldDirty: true,
                          })
                        } else if (mode === "edit" && editDto?.coverUrl) {
                          setValue("existingCoverUrl", editDto.coverUrl, {
                            shouldDirty: true,
                          })
                        }
                      }}
                    />
                  )}
                />
              </section>

              <section className={cn("space-y-3", sectionDivider)}>
                <h2 className="text-sm font-semibold text-foreground">
                  {NS.section.languages_content}
                </h2>
                <Controller
                  name="contentLanguages"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-2">
                      {(["CKB", "KMR"] as const).map((code) => {
                        const active = field.value.includes(code)
                        const labelTxt =
                          code === "CKB" ? NS.lang.ckb : NS.lang.kmr
                        return (
                          <button
                            key={code}
                            type="button"
                            aria-pressed={active}
                            onClick={() => {
                              if (active && field.value.length <= 1) return
                              const on = !active
                              let next = [...field.value]
                              if (on) {
                                if (!next.includes(code)) next.push(code)
                              } else {
                                next = next.filter((l: Language) => l !== code)
                              }
                              field.onChange(next.length ? next : field.value)
                            }}
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                              active
                                ? "border-primary bg-primary/15 text-primary"
                                : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50",
                            )}
                          >
                            {labelTxt}
                          </button>
                        )
                      })}
                    </div>
                  )}
                />
                <p className="text-muted-foreground text-xs">
                  {NS.help.languages_min_one}
                </p>
                <FieldError className="text-xs">
                  {errors.contentLanguages?.message}
                </FieldError>
              </section>

              <section className={cn("space-y-3", sectionDivider)}>
                <h2 className="text-sm font-semibold text-foreground">
                  {NS.section.publish}
                </h2>
                <Label htmlFor="nf-date">{NS.field.date_published}</Label>
                <Input
                  id="nf-date"
                  type="date"
                  className="h-10 max-w-[18rem] rounded-md font-mono"
                  {...register("datePublished")}
                />
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {NS.help.scheduled_if_future}
                </p>
                <FieldError className="text-xs">{errors.datePublished?.message}</FieldError>
              </section>

              {mode === "edit" && typeof editDto?.id === "number" ? (
                <section className={cn("space-y-3", sectionDivider)}>
                  <h2 className="text-muted-foreground text-sm font-semibold">
                    {NS.section.system}
                  </h2>
                  <dl className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-3 gap-y-3 text-xs leading-snug">
                    <Fragment>
                      <dt className="text-muted-foreground">{NS.system.id_label}</dt>
                      <dd className="font-mono text-right text-foreground">
                        #{editDto.id}
                      </dd>
                    </Fragment>
                    {editDto.createdAt ? (
                      <Fragment>
                        <dt className="text-muted-foreground">{NS.system.created_at}</dt>
                        <dd className="text-end">
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <button
                                  type="button"
                                  className="text-foreground underline decoration-dashed underline-offset-4 hover:opacity-90"
                                >
                                  {formatRelativeTimeKu(editDto.createdAt)}
                                </button>
                              }
                            />
                            <TooltipContent side="bottom" align="center">
                              {formatFullTimestampKu(editDto.createdAt)}
                            </TooltipContent>
                          </Tooltip>
                        </dd>
                      </Fragment>
                    ) : null}
                    {editDto.updatedAt ? (
                      <Fragment>
                        <dt className="text-muted-foreground">{NS.system.updated_at}</dt>
                        <dd className="text-end">
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <button
                                  type="button"
                                  className="text-foreground underline decoration-dashed underline-offset-4 hover:opacity-90"
                                >
                                  {formatRelativeTimeKu(editDto.updatedAt)}
                                </button>
                              }
                            />
                            <TooltipContent side="bottom" align="center">
                              {formatFullTimestampKu(editDto.updatedAt)}
                            </TooltipContent>
                          </Tooltip>
                        </dd>
                      </Fragment>
                    ) : null}
                  </dl>
                </section>
              ) : null}

              <p className="text-muted-foreground pt-4 text-xs italic leading-relaxed">
                {NS.help.publish_requirements}
              </p>
            </aside>
          </div>
        </TooltipProvider>

        <div
          className={cn(
            "border-border bg-background/95 supports-backdrop-filter:backdrop-blur fixed inset-x-0 bottom-0 z-40 border-t",
            "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
          )}
        >
          <div className="mx-auto flex min-h-14 max-w-full flex-wrap items-center justify-between gap-3 px-4 py-3 lg:gap-6 lg:px-6">
            <div className="text-primary hidden min-h-10 min-w-0 flex-1 flex-wrap items-center gap-2 text-sm lg:flex">
              {isDirty ? (
                <>
                  <span
                    className="bg-primary inline-flex size-2 shrink-0 rounded-full shadow-[0_0_0_3px_oklch(0.511_0.096_186.391_/0.2)] dark:shadow-none"
                    aria-hidden
                  />
                  <span className="max-w-[min(100%,28rem)] leading-snug whitespace-normal">
                    {NS.unsaved.indicator}
                  </span>
                </>
              ) : null}
            </div>
            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-nowrap sm:justify-end sm:gap-3 lg:flex-initial">
              <Button
                type="button"
                variant="outline"
                className="rounded-md sm:flex-initial"
                disabled={pending}
                onClick={() => router.push("/dashboard/news")}
              >
                {NS.action.cancel}
              </Button>
              <Button
                type="submit"
                variant="default"
                className="rounded-md gap-2 sm:flex-initial"
                formNoValidate={false}
                disabled={submitDisabled}
              >
                {pending ? (
                  <>
                    <Spinner className="size-4" aria-hidden />
                    {NS.action.saving}
                  </>
                ) : (
                  <>
                    <CheckIcon className="size-4" aria-hidden />
                    {NS.action.save}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}

function CkbLangFields({
  register,
  control,
  watch,
  setValue,
  errors,
  ckbTitleLen,
}: {
  register: UseFormRegister<NewsFormValues>
  control: Control<NewsFormValues>
  watch: UseFormWatch<NewsFormValues>
  setValue: UseFormSetValue<NewsFormValues>
  errors: FieldErrors<NewsFormValues>
  ckbTitleLen: number
}) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="nf-ckb-title" className="sr-only">
          {NS.field.title}
        </Label>
        <Input
          id="nf-ckb-title"
          className="placeholder:text-muted-foreground/75 h-auto rounded-lg py-3 text-lg font-medium"
          dir="rtl"
          autoComplete="off"
          placeholder={NS.field.title_placeholder_ckb}
          {...register("ckbContent.title")}
        />
        <div className="flex justify-between gap-3 text-muted-foreground text-xs tabular-nums">
          <FieldError>{errors.ckbContent?.title?.message}</FieldError>
          <span dir="ltr" className="shrink-0">
            {formatCkbDigits(ckbTitleLen)} / ٢٥٠
          </span>
        </div>
      </div>

      <TiptapEditor
        lang="CKB"
        label={undefined}
        error={errors.ckbContent?.description?.message}
        value={watch("ckbContent.description") ?? ""}
        placeholder={NS.field.description}
        onChange={(html) =>
          setValue("ckbContent.description", html, {
            shouldValidate: true,
            shouldDirty: true,
          })
        }
      />

      <div className="space-y-3">
        <Label>{`${NS.field.tags} (${NS.lang.ckb})`}</Label>
        <Controller
          name="tags.ckb"
          control={control}
          render={({ field }) => (
            <NewsTagInput
              value={field.value}
              onChange={field.onChange}
              placeholder={NS.field.tags_enter_helper}
            />
          )}
        />
        <p className="text-muted-foreground text-xs">{NS.field.tags_enter_helper}</p>
      </div>

      <div className="space-y-3">
        <Label>{`${NS.field.keywords} (${NS.lang.ckb})`}</Label>
        <Controller
          name="keywords.ckb"
          control={control}
          render={({ field }) => (
            <NewsTagInput
              value={field.value}
              onChange={field.onChange}
              placeholder={NS.field.keywords_enter_helper}
              badgeVariant="outline"
              badgeClassName="border-dashed text-muted-foreground"
            />
          )}
        />
        <p className="text-muted-foreground text-xs">{NS.field.keywords_enter_helper}</p>
      </div>
    </>
  )
}

function KmrLangFields({
  register,
  control,
  watch,
  setValue,
  errors,
  kmrTitleLen,
}: {
  register: UseFormRegister<NewsFormValues>
  control: Control<NewsFormValues>
  watch: UseFormWatch<NewsFormValues>
  setValue: UseFormSetValue<NewsFormValues>
  errors: FieldErrors<NewsFormValues>
  kmrTitleLen: number
}) {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="nf-kmr-title" className="sr-only">
          {NS.field.title}
        </Label>
        <Input
          id="nf-kmr-title"
          className="placeholder:text-muted-foreground/75 h-auto rounded-lg py-3 text-lg font-medium"
          dir="ltr"
          lang="ku"
          autoComplete="off"
          placeholder={NS.field.title_placeholder_kmr}
          {...register("kmrContent.title")}
        />
        <div className="flex justify-between gap-3 text-muted-foreground text-xs tabular-nums">
          <FieldError>{errors.kmrContent?.title?.message}</FieldError>
          <span dir="ltr" className="shrink-0">
            {formatCkbDigits(kmrTitleLen)} / ٢٥٠
          </span>
        </div>
      </div>

      <TiptapEditor
        lang="KMR"
        label={undefined}
        error={errors.kmrContent?.description?.message}
        value={watch("kmrContent.description") ?? ""}
        placeholder={NS.field.description}
        onChange={(html) =>
          setValue("kmrContent.description", html, {
            shouldValidate: true,
            shouldDirty: true,
          })
        }
      />

      <div className="space-y-3">
        <Label>{`${NS.field.tags} (${NS.lang.kmr})`}</Label>
        <Controller
          name="tags.kmr"
          control={control}
          render={({ field }) => (
            <NewsTagInput
              value={field.value}
              onChange={field.onChange}
              placeholder={NS.field.tags_enter_helper}
            />
          )}
        />
        <p className="text-muted-foreground text-xs">{NS.field.tags_enter_helper}</p>
      </div>

      <div className="space-y-3">
        <Label>{`${NS.field.keywords} (${NS.lang.kmr})`}</Label>
        <Controller
          name="keywords.kmr"
          control={control}
          render={({ field }) => (
            <NewsTagInput
              value={field.value}
              onChange={field.onChange}
              placeholder={NS.field.keywords_enter_helper}
              badgeVariant="outline"
              badgeClassName="border-dashed text-muted-foreground"
            />
          )}
        />
        <p className="text-muted-foreground text-xs">{NS.field.keywords_enter_helper}</p>
      </div>
    </>
  )
}
