"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowPathIcon,
  CheckIcon,
  LinkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import {
  FormProvider,
  useForm,
  type Resolver,
} from "react-hook-form"
import { toast } from "sonner"

import {
  AboutBreadcrumbBar,
  dashboardAboutCrumbHref,
} from "@/components/about/about-breadcrumb"
import { AboutErrorState } from "@/components/about/about-error-state"
import { AboutFormSidebar } from "@/components/about/about-form-sidebar"
import { NS } from "@/components/about/about-strings"
import { TiptapEditor } from "@/components/shared/tiptap-editor"
import { SeoCountChip } from "@/components/about/seo-count-chip"
import { aboutSiteBaseUrl } from "@/lib/about-url-helpers"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import {
  useAboutDetailQuery,
  useCreateAbout,
  useUpdateAbout,
} from "@/hooks/useAbout"
import { aboutFormValuesToPayload } from "@/lib/about-form-data"
import {
  aboutDtoToFormValues,
  aboutFormSchema,
  defaultAboutFormValues,
  type AboutFormValues,
} from "@/lib/validations/about"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type { AboutDto, Language } from "@/types/about"

function SlugInput({
  lang,
  required,
  value,
  onChange,
}: {
  lang: "ckb" | "kmr"
  required?: boolean
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="block">
      <div className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs font-medium">
          {lang === "ckb" ? NS.form.slug_ckb : NS.form.slug_kmr}
        </span>
        <span
          className={cn(
            "rounded px-1.5 py-0.5 font-mono text-[10px] uppercase",
            lang === "ckb"
              ? "bg-primary/10 text-primary"
              : "bg-blue-500/10 text-blue-700 dark:text-blue-400",
          )}
        >
          {lang.toUpperCase()}{" "}
          {required ? NS.form.slug_required : NS.form.slug_optional}
        </span>
      </div>
      <div className="relative">
        <LinkIcon className="text-muted-foreground/60 absolute end-3 top-1/2 size-4 -translate-y-1/2" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`derbare-${lang}`}
          className="h-10 pe-10 ps-3 font-mono text-sm"
        />
      </div>
      <p className="text-muted-foreground mt-1 text-[11px]">
        {lang === "ckb" ? NS.form.slug_ckb_hint : NS.form.slug_kmr_hint}
      </p>
    </label>
  )
}

export function AboutForm({
  mode,
  aboutId,
}: {
  mode: "create" | "edit"
  aboutId?: number
}) {
  const router = useRouter()
  const idOk =
    mode === "create" ||
    (typeof aboutId === "number" && Number.isFinite(aboutId) && aboutId > 0)

  const detailQ = useAboutDetailQuery(
    mode === "edit" && typeof aboutId === "number" ? aboutId : 0,
  )
  const editDto: AboutDto | undefined =
    mode === "edit" && detailQ.data?.id ? detailQ.data : undefined

  const createMut = useCreateAbout()
  const updateMut = useUpdateAbout()

  const form = useForm<AboutFormValues>({
    resolver: zodResolver(aboutFormSchema) as Resolver<AboutFormValues>,
    defaultValues: defaultAboutFormValues,
    mode: "onChange",
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isDirty, isValid },
  } = form

  useEffect(() => {
    if (editDto) reset(aboutDtoToFormValues(editDto))
  }, [editDto, reset])

  const [activeLang, setActiveLang] = useState<Language>("CKB")
  const contentLanguages = watch("contentLanguages")
  const slugCkb = watch("slugCkb")
  const titleCkb = watch("titleCkb")
  const titleKmr = watch("titleKmr")
  const subtitleCkb = watch("subtitleCkb")
  const subtitleKmr = watch("subtitleKmr")
  const seoDescriptionCkb = watch("seoDescriptionCkb")

  useEffect(() => {
    if (!contentLanguages.includes(activeLang) && contentLanguages[0]) {
      setActiveLang(contentLanguages[0])
    }
  }, [contentLanguages, activeLang])

  const pending = createMut.isPending || updateMut.isPending
  const submitDisabled = !isDirty || !isValid || pending

  const titleField = activeLang === "CKB" ? "titleCkb" : "titleKmr"
  const subtitleField = activeLang === "CKB" ? "subtitleCkb" : "subtitleKmr"
  const seoField = activeLang === "CKB" ? "seoDescriptionCkb" : "seoDescriptionKmr"
  const titleLen = (watch(titleField)?.length ?? 0)
  const subtitleLen = (watch(subtitleField)?.length ?? 0)
  const seoLen = (watch(seoField)?.length ?? 0)

  async function onSubmit(values: AboutFormValues) {
    const payload = aboutFormValuesToPayload(values)
    try {
      if (mode === "create") {
        const res = await createMut.mutateAsync(payload)
        if (res.id) {
          toast.success(NS.toast.saved)
          router.push(`/dashboard/about/${res.id}`)
        }
      } else if (aboutId) {
        await updateMut.mutateAsync({ id: aboutId, payload })
        toast.success(NS.toast.saved)
        router.push(`/dashboard/about/${aboutId}`)
      }
    } catch {
      toast.error(NS.error.validation)
    }
  }

  if (!idOk) {
    return (
      <div dir="rtl" className="px-6 py-12">
        <AboutErrorState onRetry={() => router.push("/dashboard/about")} />
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
        <AboutErrorState onRetry={() => void detailQ.refetch()} />
      </div>
    )
  }

  const siteBase = aboutSiteBaseUrl() || "yoursite.com"

  return (
    <FormProvider {...form}>
      <form dir="rtl" className="pb-24" onSubmit={handleSubmit(onSubmit)}>
        <header className="border-border bg-background/95 supports-backdrop-filter:backdrop-blur sticky top-0 z-30 border-b">
          <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
            <AboutBreadcrumbBar
              segments={[
                { label: NS.breadcrumb.dashboard, href: dashboardAboutCrumbHref() },
                { label: NS.breadcrumb.about, href: "/dashboard/about" },
                {
                  label:
                    mode === "create" ? NS.breadcrumb.new : NS.breadcrumb.edit,
                },
              ]}
            />
            <Link
              href={
                mode === "edit" && aboutId
                  ? `/dashboard/about/${aboutId}`
                  : "/dashboard/about"
              }
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              {NS.action.back}
            </Link>
          </div>
        </header>

        <div
          dir="ltr"
          className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-8 lg:px-6"
        >
          <div dir="rtl">
            <AboutFormSidebar mode={mode} editDto={editDto} />
          </div>

          <article dir="rtl" className="mx-auto max-w-[860px] pb-12 pt-2">
            <div className="mb-8 flex items-center gap-2">
              {(["CKB", "KMR"] as const).map((lang) => {
                const isActive = activeLang === lang
                const isInSet = contentLanguages.includes(lang)
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveLang(lang)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                      isActive
                        ? lang === "CKB"
                          ? "border-primary/30 bg-primary/10 text-primary ring-2 ring-primary/15"
                          : "border-blue-500/30 bg-blue-500/10 text-blue-700 ring-2 ring-blue-500/15 dark:text-blue-400"
                        : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/50",
                      !isInSet && "opacity-50",
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        lang === "CKB" ? "bg-primary" : "bg-blue-500",
                      )}
                    />
                    {lang === "CKB" ? NS.lang.ckb : NS.lang.kmr}
                  </button>
                )
              })}
            </div>

            <section>
              <h3 className="mb-3 text-sm font-medium">{NS.form.slugs}</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <SlugInput
                  lang="ckb"
                  required
                  value={watch("slugCkb") ?? ""}
                  onChange={(v) =>
                    setValue("slugCkb", v, { shouldDirty: true, shouldValidate: true })
                  }
                />
                <SlugInput
                  lang="kmr"
                  value={watch("slugKmr") ?? ""}
                  onChange={(v) =>
                    setValue("slugKmr", v, { shouldDirty: true })
                  }
                />
              </div>
            </section>

            <section className="border-border/60 mt-10 space-y-6 border-t pt-6">
              <div>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
                    {NS.form.title}
                  </span>
                  <span className="text-muted-foreground/60 font-mono text-[10px]">
                    {formatCkbDigits(titleLen)}/300
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={300}
                  placeholder="دەربارەی ئێمە…"
                  className="placeholder:text-muted-foreground/40 w-full border-0 bg-transparent px-0 text-3xl leading-tight font-bold focus:ring-0 focus-visible:ring-0 md:text-4xl"
                  {...register(titleField)}
                />
              </div>

              <div>
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
                    {NS.form.subtitle}
                  </span>
                  <span className="text-muted-foreground/60 font-mono text-[10px]">
                    {formatCkbDigits(subtitleLen)}/300
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={300}
                  placeholder="وەسفی کورت…"
                  className="text-muted-foreground placeholder:text-muted-foreground/40 w-full border-0 bg-transparent px-0 text-xl leading-snug focus:ring-0 focus-visible:ring-0"
                  {...register(subtitleField)}
                />
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
                  placeholder="وەسفی کورت بۆ سێرچ ئەنجین…"
                  className="resize-none"
                  {...register(seoField)}
                />
                <div className="border-border/40 mt-3 border-t pt-3">
                  <div className="text-muted-foreground/70 mb-1.5 text-[10px] tracking-wide uppercase">
                    {NS.form.seo_preview}
                  </div>
                  <div className="border-border/40 bg-background max-w-md rounded-md border p-2.5">
                    <div className="truncate text-base text-[#1a0dab] dark:text-blue-400">
                      {titleCkb?.trim() || titleKmr?.trim() || "ناونیشان"}
                    </div>
                    <div className="mt-0.5 truncate font-mono text-xs text-[#006621] dark:text-emerald-500">
                      {siteBase}/about/{slugCkb?.trim() || "…"}
                    </div>
                    <div className="text-foreground/70 mt-1 line-clamp-2 text-xs leading-relaxed">
                      {seoDescriptionCkb?.trim() ||
                        subtitleCkb?.trim() ||
                        titleCkb?.trim() ||
                        NS.form.seo_fallback}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="border-border/60 mt-10 border-t pt-6">
              <h3 className="mb-3 text-sm font-medium">{NS.form.body}</h3>
              {activeLang === "CKB" ? (
                <TiptapEditor
                  stickyToolbar
                  lang="CKB"
                  value={watch("bodyCkb") ?? ""}
                  onChange={(v) =>
                    setValue("bodyCkb", v, { shouldDirty: true })
                  }
                />
              ) : (
                <TiptapEditor
                  stickyToolbar
                  lang="KMR"
                  value={watch("bodyKmr") ?? ""}
                  onChange={(v) =>
                    setValue("bodyKmr", v, { shouldDirty: true })
                  }
                />
              )}
            </section>

          </article>
        </div>

        <div className="border-border bg-background/95 supports-backdrop-filter:backdrop-blur sticky bottom-0 inset-x-0 z-30 border-t">
          <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-6 py-3">
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              {isDirty ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-1.5 animate-pulse rounded-full bg-amber-500" />
                  {NS.form.dirty}
                </span>
              ) : mode === "edit" ? (
                <span className="text-muted-foreground/60 inline-flex items-center gap-1.5">
                  <CheckIcon className="size-3" />
                  {NS.form.clean}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={() =>
                  router.push(
                    mode === "edit" && aboutId
                      ? `/dashboard/about/${aboutId}`
                      : "/dashboard/about",
                  )
                }
              >
                {NS.action.cancel}
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
                disabled={submitDisabled}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
              >
                {pending ? (
                  <>
                    <ArrowPathIcon className="size-3.5 animate-spin" />
                    {NS.action.saving}
                  </>
                ) : (
                  <>
                    <CheckIcon className="size-3.5" />
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

