"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowPathIcon,
  CheckIcon,
  PencilIcon,
  TrashIcon,
  LinkIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
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
import Image from "next/image"
import { isOptimizableImageSrc } from "@/lib/image-src"
import { AboutErrorState } from "@/components/about/about-error-state"
import { AboutFormSidebar } from "@/components/about/about-form-sidebar"
import { AboutStatsEditor } from "@/components/about/about-stats-editor"
import { NS } from "@/components/about/about-strings"
import { MediaCoverUpload } from "@/components/shared/media-cover-upload"
import { TiptapEditor } from "@/components/shared/tiptap-editor-lazy"
import { SeoCountChip } from "@/components/about/seo-count-chip"
import { aboutSiteBaseUrl } from "@/lib/about-url-helpers"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import {
  useAboutPartnersQuery,
  useAboutTeamMembersQuery,
  useCreateAboutPartner,
  useCreateAboutTeamMember,
  useDeleteAboutPartner,
  useDeleteAboutTeamMember,
  useAboutDetailQuery,
  useCreateAbout,
  useUpdateAboutPartner,
  useUpdateAboutTeamMember,
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
import type { AboutPartnerDto, AboutTeamMemberDto } from "@/types/about"

const sectionCard =
  "rounded-xl border border-border/60 bg-card/50 p-5 shadow-xs"

const sectionHeading =
  "inline-flex items-center gap-2 text-sm font-semibold text-foreground before:h-3.5 before:w-1 before:rounded-full before:bg-primary/70 before:content-['']"

function SlugInput({
  lang,
  value,
  onChange,
}: {
  lang: "ckb" | "kmr"
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
          {lang.toUpperCase()} {NS.form.slug_optional}
        </span>
      </div>
      <div className="relative">
        <LinkIcon className="text-muted-foreground/60 absolute inset-e-3 top-1/2 size-4 -translate-y-1/2" />
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

function clean(v?: string | null) {
  const t = v?.trim()
  return t ? t : null
}

function BilingualSectionHeader({ lang }: { lang: "CKB" | "KMR" }) {
  return (
    <Label
      className={cn(
        "text-xs font-medium",
        lang === "CKB"
          ? "text-primary"
          : "text-blue-700 dark:text-blue-400",
      )}
    >
      {lang === "CKB" ? NS.form.section_ckb : NS.form.section_kmr}
    </Label>
  )
}

function AboutEditorSectionCard({
  title,
  hint,
  onSave,
  saveDisabled,
  pending,
  children,
}: {
  title: string
  hint?: string
  onSave?: () => void
  saveDisabled?: boolean
  pending?: boolean
  children: React.ReactNode
}) {
  return (
    <section className="border-border bg-card/50 rounded-xl border shadow-xs">
      <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <h2 className={sectionHeading}>{title}</h2>
          {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
        </div>
        {onSave ? (
          <Button
            type="button"
            size="sm"
            disabled={saveDisabled}
            className="gap-1"
            onClick={onSave}
          >
            {pending ? (
              <Spinner className="size-3.5" />
            ) : (
              <CheckIcon className="size-3.5" />
            )}
            {pending ? NS.action.saving : NS.action.save}
          </Button>
        ) : null}
      </div>
      <div className="space-y-6 p-4">{children}</div>
    </section>
  )
}

export function AboutForm({
  mode,
  aboutId,
  embedded,
  onSaved,
  onCancel,
}: {
  mode: "create" | "edit"
  aboutId?: number
  embedded?: boolean
  onSaved?: () => void
  onCancel?: () => void
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
    formState: { isDirty, isValid, errors },
  } = form

  useEffect(() => {
    if (editDto) reset(aboutDtoToFormValues(editDto))
  }, [editDto, reset])

  const [activeLang, setActiveLang] = useState<Language>("CKB")
  const [teamDialogOpen, setTeamDialogOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<AboutTeamMemberDto | null>(null)
  const [partnerDialogOpen, setPartnerDialogOpen] = useState(false)
  const [editingPartner, setEditingPartner] = useState<AboutPartnerDto | null>(null)
  const [teamForm, setTeamForm] = useState({
    nameCkb: "",
    nameKmr: "",
    roleCkb: "",
    roleKmr: "",
    bioCkb: "",
    bioKmr: "",
    office: "",
    imageUrl: "",
    displayOrder: "0",
  })
  const [partnerForm, setPartnerForm] = useState({
    nameCkb: "",
    nameKmr: "",
    descriptionCkb: "",
    descriptionKmr: "",
    logoUrl: "",
    websiteUrl: "",
    displayOrder: "0",
  })
  const contentLanguages = watch("contentLanguages")
  const slugCkb = watch("slugCkb")
  const titleCkb = watch("titleCkb")
  const titleKmr = watch("titleKmr")
  const subtitleCkb = watch("subtitleCkb")
  const subtitleKmr = watch("subtitleKmr")
  const seoDescriptionCkb = watch("seoDescriptionCkb")
  const founderImageUrl = watch("founderImageUrl") ?? ""
  const heroVideoUrl = watch("heroVideoUrl") ?? ""
  const heroPosterUrl = watch("heroPosterUrl") ?? ""

  const teamQ = useAboutTeamMembersQuery()
  const partnersQ = useAboutPartnersQuery()
  const createTeamMut = useCreateAboutTeamMember()
  const updateTeamMut = useUpdateAboutTeamMember()
  const deleteTeamMut = useDeleteAboutTeamMember()
  const createPartnerMut = useCreateAboutPartner()
  const updatePartnerMut = useUpdateAboutPartner()
  const deletePartnerMut = useDeleteAboutPartner()

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

  function openCreateTeamDialog() {
    setEditingTeam(null)
    setTeamForm({
      nameCkb: "",
      nameKmr: "",
      roleCkb: "",
      roleKmr: "",
      bioCkb: "",
      bioKmr: "",
      office: "",
      imageUrl: "",
      displayOrder: String(teamQ.data?.length ?? 0),
    })
    setTeamDialogOpen(true)
  }

  function openEditTeamDialog(item: AboutTeamMemberDto) {
    setEditingTeam(item)
    setTeamForm({
      nameCkb: item.nameCkb ?? "",
      nameKmr: item.nameKmr ?? "",
      roleCkb: item.roleCkb ?? "",
      roleKmr: item.roleKmr ?? "",
      bioCkb: item.bioCkb ?? "",
      bioKmr: item.bioKmr ?? "",
      office: item.office ?? "",
      imageUrl: item.imageUrl ?? "",
      displayOrder: String(item.displayOrder ?? 0),
    })
    setTeamDialogOpen(true)
  }

  async function saveTeamMember() {
    const payload = {
      nameCkb: clean(teamForm.nameCkb),
      nameKmr: clean(teamForm.nameKmr),
      roleCkb: clean(teamForm.roleCkb),
      roleKmr: clean(teamForm.roleKmr),
      bioCkb: clean(teamForm.bioCkb),
      bioKmr: clean(teamForm.bioKmr),
      office: clean(teamForm.office),
      imageUrl: clean(teamForm.imageUrl),
      displayOrder: Number(teamForm.displayOrder || "0"),
      active: true,
    }
    try {
      if (editingTeam?.id) {
        await updateTeamMut.mutateAsync({ id: editingTeam.id, payload })
      } else {
        await createTeamMut.mutateAsync(payload)
      }
      toast.success(NS.toast.saved)
      setTeamDialogOpen(false)
    } catch {
      toast.error(NS.error.validation)
    }
  }

  function openCreatePartnerDialog() {
    setEditingPartner(null)
    setPartnerForm({
      nameCkb: "",
      nameKmr: "",
      descriptionCkb: "",
      descriptionKmr: "",
      logoUrl: "",
      websiteUrl: "",
      displayOrder: String(partnersQ.data?.length ?? 0),
    })
    setPartnerDialogOpen(true)
  }

  function openEditPartnerDialog(item: AboutPartnerDto) {
    setEditingPartner(item)
    setPartnerForm({
      nameCkb: item.nameCkb ?? "",
      nameKmr: item.nameKmr ?? "",
      descriptionCkb: item.descriptionCkb ?? "",
      descriptionKmr: item.descriptionKmr ?? "",
      logoUrl: item.logoUrl ?? "",
      websiteUrl: item.websiteUrl ?? "",
      displayOrder: String(item.displayOrder ?? 0),
    })
    setPartnerDialogOpen(true)
  }

  async function savePartner() {
    const payload = {
      nameCkb: clean(partnerForm.nameCkb),
      nameKmr: clean(partnerForm.nameKmr),
      descriptionCkb: clean(partnerForm.descriptionCkb),
      descriptionKmr: clean(partnerForm.descriptionKmr),
      logoUrl: clean(partnerForm.logoUrl),
      websiteUrl: clean(partnerForm.websiteUrl),
      displayOrder: Number(partnerForm.displayOrder || "0"),
      active: true,
    }
    try {
      if (editingPartner?.id) {
        await updatePartnerMut.mutateAsync({ id: editingPartner.id, payload })
      } else {
        await createPartnerMut.mutateAsync(payload)
      }
      toast.success(NS.toast.saved)
      setPartnerDialogOpen(false)
    } catch {
      toast.error(NS.error.validation)
    }
  }

  async function onSubmit(values: AboutFormValues) {
    const payload = aboutFormValuesToPayload(values)
    try {
      if (mode === "create") {
        const res = await createMut.mutateAsync(payload)
        if (res.id) {
          toast.success(NS.toast.saved)
          if (embedded && onSaved) {
            onSaved()
          } else {
            router.push("/dashboard/about")
          }
        }
      } else if (aboutId) {
        await updateMut.mutateAsync({ id: aboutId, payload })
        toast.success(NS.toast.saved)
        if (embedded && onSaved) {
          onSaved()
        } else {
          router.push("/dashboard/about")
        }
      }
    } catch {
      toast.error(NS.error.validation)
    }
  }

  const triggerSave = () => void handleSubmit(onSubmit)()

  if (!idOk) {
    return (
      <div dir="rtl" className="px-6 py-12">
        <AboutErrorState onRetry={() => router.push("/dashboard/about")} />
      </div>
    )
  }

  if (mode === "edit" && detailQ.isLoading) {
    return embedded ? (
      <div
        dir="rtl"
        className="border-border flex items-center justify-center rounded-xl border p-12"
      >
        <Spinner className="size-6" />
      </div>
    ) : (
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
  const sectionSaveProps = {
    onSave: triggerSave,
    saveDisabled: submitDisabled,
    pending,
  }

  const langTabs = (
    <div className="mb-2 flex items-center gap-2">
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
  )

  return (
    <FormProvider {...form}>
      <form
        dir="rtl"
        className={embedded ? "space-y-4" : "pb-24"}
        onSubmit={handleSubmit(onSubmit)}
      >
        {!embedded ? (
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
                href="/dashboard/about"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                {NS.action.back}
              </Link>
            </div>
          </header>
        ) : null}

        <div
          dir="ltr"
          className={
            embedded
              ? "space-y-4"
              : "mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-8 lg:px-6"
          }
        >
          {!embedded ? (
            <div dir="rtl">
              <AboutFormSidebar mode={mode} editDto={editDto} />
            </div>
          ) : null}

          <article
            dir="rtl"
            className={
              embedded ? "space-y-4" : "mx-auto max-w-[860px] pb-12 pt-2"
            }
          >
            {embedded ? (
              <AboutEditorSectionCard
                title={NS.page.settingsTitle}
                hint={NS.page.settingsHint}
                {...sectionSaveProps}
              >
                <AboutFormSidebar mode={mode} editDto={editDto} embedded />
              </AboutEditorSectionCard>
            ) : null}

            {embedded ? (
              <AboutEditorSectionCard
                title={NS.page.heroTitle}
                hint={NS.page.heroHint}
                {...sectionSaveProps}
              >
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <MediaCoverUpload
                    label={NS.form.hero_video}
                    variant="video"
                    previewUrl={heroVideoUrl.trim() || null}
                    urlValue={heroVideoUrl}
                    onUrlChange={(v) =>
                      setValue("heroVideoUrl", v, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    urlError={
                      typeof errors.heroVideoUrl?.message === "string"
                        ? errors.heroVideoUrl.message
                        : undefined
                    }
                  />
                  <MediaCoverUpload
                    label={NS.form.hero_poster}
                    previewUrl={heroPosterUrl.trim() || null}
                    urlValue={heroPosterUrl}
                    onUrlChange={(v) =>
                      setValue("heroPosterUrl", v, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    urlError={
                      typeof errors.heroPosterUrl?.message === "string"
                        ? errors.heroPosterUrl.message
                        : undefined
                    }
                  />
                </div>
              </AboutEditorSectionCard>
            ) : null}

            {embedded ? (
              <AboutEditorSectionCard
                title={NS.page.contentTitle}
                hint={NS.page.contentHint}
                {...sectionSaveProps}
              >
                {langTabs}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <SlugInput
                    lang="ckb"
                    value={watch("slugCkb") ?? ""}
                    onChange={(v) =>
                      setValue("slugCkb", v, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
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
                    className="placeholder:text-muted-foreground/40 w-full rounded-md border border-input bg-background px-3 py-2 text-2xl leading-tight font-bold focus:ring-0 focus-visible:ring-0"
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
                    className="text-muted-foreground placeholder:text-muted-foreground/40 w-full rounded-md border border-input bg-background px-3 py-2 text-lg leading-snug focus:ring-0 focus-visible:ring-0"
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

                <div>
                  <h3 className={cn("mb-3", sectionHeading)}>{NS.form.body}</h3>
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
                </div>
              </AboutEditorSectionCard>
            ) : (
              <>
                <div className="mb-8 flex items-center gap-2">{langTabs}</div>

                <section className={sectionCard}>
                  <h3 className={cn("mb-3", sectionHeading)}>{NS.form.slugs}</h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <SlugInput
                      lang="ckb"
                      value={watch("slugCkb") ?? ""}
                      onChange={(v) =>
                        setValue("slugCkb", v, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
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
              </>
            )}

            {!embedded ? (
            <section className={cn("mt-10 space-y-6", sectionCard)}>
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
            ) : null}

            {!embedded ? (
            <section className={cn("mt-10", sectionCard)}>
              <h3 className={cn("mb-3", sectionHeading)}>{NS.form.body}</h3>
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
            ) : null}

            {embedded ? (
              <AboutEditorSectionCard
                title={NS.page.founderTitle}
                hint={NS.page.founderHint}
                {...sectionSaveProps}
              >
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <BilingualSectionHeader lang="CKB" />
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
                    <BilingualSectionHeader lang="KMR" />
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
                <MediaCoverUpload
                  label={NS.form.founder_image}
                  previewUrl={founderImageUrl.trim() || null}
                  urlValue={founderImageUrl}
                  aspectClass="aspect-square max-w-xs"
                  onUrlChange={(v) =>
                    setValue("founderImageUrl", v, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  urlError={
                    typeof errors.founderImageUrl?.message === "string"
                      ? errors.founderImageUrl.message
                      : undefined
                  }
                />
              </AboutEditorSectionCard>
            ) : (
            <section className={cn("mt-10", sectionCard)}>
              <h3 className={cn("mb-4", sectionHeading)}>{NS.form.founder}</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <BilingualSectionHeader lang="CKB" />
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
                  <BilingualSectionHeader lang="KMR" />
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
              <div className="mt-6">
                <MediaCoverUpload
                  label={NS.form.founder_image}
                  previewUrl={founderImageUrl.trim() || null}
                  urlValue={founderImageUrl}
                  aspectClass="aspect-square max-w-xs"
                  onUrlChange={(v) =>
                    setValue("founderImageUrl", v, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  urlError={
                    typeof errors.founderImageUrl?.message === "string"
                      ? errors.founderImageUrl.message
                      : undefined
                  }
                />
              </div>
            </section>
            )}

            {!embedded ? (
            <section className={cn("mt-10", sectionCard)}>
              <h3 className={cn("mb-4", sectionHeading)}>{NS.form.hero}</h3>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <MediaCoverUpload
                  label={NS.form.hero_video}
                  variant="video"
                  previewUrl={heroVideoUrl.trim() || null}
                  urlValue={heroVideoUrl}
                  onUrlChange={(v) =>
                    setValue("heroVideoUrl", v, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  urlError={
                    typeof errors.heroVideoUrl?.message === "string"
                      ? errors.heroVideoUrl.message
                      : undefined
                  }
                />
                <MediaCoverUpload
                  label={NS.form.hero_poster}
                  previewUrl={heroPosterUrl.trim() || null}
                  urlValue={heroPosterUrl}
                  onUrlChange={(v) =>
                    setValue("heroPosterUrl", v, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  urlError={
                    typeof errors.heroPosterUrl?.message === "string"
                      ? errors.heroPosterUrl.message
                      : undefined
                  }
                />
              </div>
            </section>
            ) : null}

            {embedded ? (
              <AboutEditorSectionCard
                title={NS.page.statsTitle}
                hint={NS.page.statsHint}
                {...sectionSaveProps}
              >
                <AboutStatsEditor />
              </AboutEditorSectionCard>
            ) : (
              <AboutStatsEditor />
            )}

            {embedded ? (
              <AboutEditorSectionCard title={NS.page.teamTitle}>
                <div className="mb-3 flex items-center justify-end">
                  <Button type="button" size="sm" variant="outline" onClick={openCreateTeamDialog}>
                  <PlusIcon className="me-1 size-4" />
                  {NS.form.team_add}
                </Button>
              </div>
              {(teamQ.data ?? []).length === 0 ? (
                <p className="text-muted-foreground text-sm">{NS.form.team_empty}</p>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {(teamQ.data ?? []).map((item) => (
                    <Card key={item.id ?? `${item.nameCkb}-${item.displayOrder}`}>
                      <CardHeader className="flex-row items-start gap-3 space-y-0">
                        {item.imageUrl?.trim() ? (
                          <Image
                            src={item.imageUrl}
                            alt=""
                            width={56}
                            height={56}
                            className="border-border size-14 shrink-0 rounded-lg border object-cover"
                            unoptimized={!isOptimizableImageSrc(item.imageUrl)}
                          />
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-sm">
                            {item.nameCkb || item.nameKmr || "—"}
                          </CardTitle>
                          <p className="text-muted-foreground mt-1 text-xs">
                            {item.roleCkb || item.roleKmr || "—"}
                          </p>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Button type="button" size="sm" variant="outline" onClick={() => openEditTeamDialog(item)}>
                            <PencilIcon className="me-1 size-3.5" />
                            {NS.action.edit}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => item.id && void deleteTeamMut.mutateAsync(item.id)}
                          >
                            <TrashIcon className="me-1 size-3.5" />
                            {NS.action.delete}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              </AboutEditorSectionCard>
            ) : (
            <section className={cn("mt-10", sectionCard)}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className={sectionHeading}>{NS.form.team}</h3>
                <Button type="button" size="sm" variant="outline" onClick={openCreateTeamDialog}>
                  <PlusIcon className="me-1 size-4" />
                  {NS.form.team_add}
                </Button>
              </div>
              {(teamQ.data ?? []).length === 0 ? (
                <p className="text-muted-foreground text-sm">{NS.form.team_empty}</p>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {(teamQ.data ?? []).map((item) => (
                    <Card key={item.id ?? `${item.nameCkb}-${item.displayOrder}`}>
                      <CardHeader className="flex-row items-start gap-3 space-y-0">
                        {item.imageUrl?.trim() ? (
                          <Image
                            src={item.imageUrl}
                            alt=""
                            width={56}
                            height={56}
                            className="border-border size-14 shrink-0 rounded-lg border object-cover"
                            unoptimized={!isOptimizableImageSrc(item.imageUrl)}
                          />
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-sm">
                            {item.nameCkb || item.nameKmr || "—"}
                          </CardTitle>
                          <p className="text-muted-foreground mt-1 text-xs">
                            {item.roleCkb || item.roleKmr || "—"}
                          </p>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Button type="button" size="sm" variant="outline" onClick={() => openEditTeamDialog(item)}>
                            <PencilIcon className="me-1 size-3.5" />
                            {NS.action.edit}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => item.id && void deleteTeamMut.mutateAsync(item.id)}
                          >
                            <TrashIcon className="me-1 size-3.5" />
                            {NS.action.delete}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
            )}

            {embedded ? (
              <AboutEditorSectionCard title={NS.page.partnersTitle}>
                <div className="mb-3 flex items-center justify-end">
                  <Button type="button" size="sm" variant="outline" onClick={openCreatePartnerDialog}>
                    <PlusIcon className="me-1 size-4" />
                    {NS.form.partner_add}
                  </Button>
                </div>
                {(partnersQ.data ?? []).length === 0 ? (
                  <p className="text-muted-foreground text-sm">{NS.form.partner_empty}</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {(partnersQ.data ?? []).map((item) => (
                      <Card key={item.id ?? `${item.nameCkb}-${item.displayOrder}`}>
                        <CardHeader className="flex-row items-start gap-3 space-y-0">
                          {item.logoUrl?.trim() ? (
                            <Image
                              src={item.logoUrl}
                              alt=""
                              width={56}
                              height={56}
                              className="border-border size-14 shrink-0 rounded-lg border object-contain bg-background p-1"
                              unoptimized={!isOptimizableImageSrc(item.logoUrl)}
                            />
                          ) : null}
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-sm">
                              {item.nameCkb || item.nameKmr || "—"}
                            </CardTitle>
                            <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                              {item.descriptionCkb || item.descriptionKmr || item.websiteUrl || "—"}
                            </p>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2 text-xs">
                          <div className="flex items-center gap-2">
                            <Button type="button" size="sm" variant="outline" onClick={() => openEditPartnerDialog(item)}>
                              <PencilIcon className="me-1 size-3.5" />
                              {NS.action.edit}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => item.id && void deletePartnerMut.mutateAsync(item.id)}
                            >
                              <TrashIcon className="me-1 size-3.5" />
                              {NS.action.delete}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </AboutEditorSectionCard>
            ) : (
            <section className={cn("mt-10", sectionCard)}>
              <div className="mb-3 flex items-center justify-between">
                <h3 className={sectionHeading}>{NS.form.partners}</h3>
                <Button type="button" size="sm" variant="outline" onClick={openCreatePartnerDialog}>
                  <PlusIcon className="me-1 size-4" />
                  {NS.form.partner_add}
                </Button>
              </div>
              {(partnersQ.data ?? []).length === 0 ? (
                <p className="text-muted-foreground text-sm">{NS.form.partner_empty}</p>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {(partnersQ.data ?? []).map((item) => (
                    <Card key={item.id ?? `${item.nameCkb}-${item.displayOrder}`}>
                      <CardHeader className="flex-row items-start gap-3 space-y-0">
                        {item.logoUrl?.trim() ? (
                          <Image
                            src={item.logoUrl}
                            alt=""
                            width={56}
                            height={56}
                            className="border-border size-14 shrink-0 rounded-lg border object-contain bg-background p-1"
                            unoptimized={!isOptimizableImageSrc(item.logoUrl)}
                          />
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-sm">
                            {item.nameCkb || item.nameKmr || "—"}
                          </CardTitle>
                          <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                            {item.descriptionCkb || item.descriptionKmr || item.websiteUrl || "—"}
                          </p>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <Button type="button" size="sm" variant="outline" onClick={() => openEditPartnerDialog(item)}>
                            <PencilIcon className="me-1 size-3.5" />
                            {NS.action.edit}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => item.id && void deletePartnerMut.mutateAsync(item.id)}
                          >
                            <TrashIcon className="me-1 size-3.5" />
                            {NS.action.delete}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>
            )}

          </article>
        </div>

        {!embedded ? (
        <div
          className={cn(
            "border-border bg-background/95 supports-backdrop-filter:backdrop-blur sticky bottom-0 inset-x-0 z-30 border-t",
            "shadow-[0_-8px_24px_-16px_rgb(0_0_0/0.25)]",
          )}
        >
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
                onClick={() => {
                  if (embedded && onCancel) {
                    onCancel()
                    return
                  }
                  router.push("/dashboard/about")
                }}
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
        ) : null}
      </form>

      <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTeam ? NS.form.team_edit : NS.form.team_add}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] space-y-5 overflow-y-auto pe-1">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <BilingualSectionHeader lang="CKB" />
                <Input
                  placeholder={NS.form.name}
                  value={teamForm.nameCkb}
                  onChange={(e) => setTeamForm((p) => ({ ...p, nameCkb: e.target.value }))}
                />
                <Input
                  placeholder={NS.form.role}
                  value={teamForm.roleCkb}
                  onChange={(e) => setTeamForm((p) => ({ ...p, roleCkb: e.target.value }))}
                />
                <Textarea
                  rows={3}
                  placeholder={NS.form.bio}
                  value={teamForm.bioCkb}
                  onChange={(e) => setTeamForm((p) => ({ ...p, bioCkb: e.target.value }))}
                />
              </div>
              <div className="space-y-3">
                <BilingualSectionHeader lang="KMR" />
                <Input
                  placeholder={NS.form.name}
                  value={teamForm.nameKmr}
                  onChange={(e) => setTeamForm((p) => ({ ...p, nameKmr: e.target.value }))}
                />
                <Input
                  placeholder={NS.form.role}
                  value={teamForm.roleKmr}
                  onChange={(e) => setTeamForm((p) => ({ ...p, roleKmr: e.target.value }))}
                />
                <Textarea
                  rows={3}
                  placeholder={NS.form.bio}
                  value={teamForm.bioKmr}
                  onChange={(e) => setTeamForm((p) => ({ ...p, bioKmr: e.target.value }))}
                />
              </div>
            </div>
            <Separator />
            <MediaCoverUpload
              label={NS.form.team_image}
              previewUrl={teamForm.imageUrl.trim() || null}
              urlValue={teamForm.imageUrl}
              aspectClass="aspect-square max-w-xs"
              onUrlChange={(v) => setTeamForm((p) => ({ ...p, imageUrl: v }))}
            />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Input
                placeholder={NS.form.team_office}
                value={teamForm.office}
                onChange={(e) => setTeamForm((p) => ({ ...p, office: e.target.value }))}
              />
              <Input
                placeholder={NS.form.team_display_order}
                value={teamForm.displayOrder}
                onChange={(e) => setTeamForm((p) => ({ ...p, displayOrder: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setTeamDialogOpen(false)}>
              {NS.action.cancel}
            </Button>
            <Button
              type="button"
              disabled={createTeamMut.isPending || updateTeamMut.isPending}
              onClick={() => void saveTeamMember()}
            >
              {NS.action.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={partnerDialogOpen} onOpenChange={setPartnerDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingPartner ? NS.form.partner_edit : NS.form.partner_add}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] space-y-5 overflow-y-auto pe-1">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <BilingualSectionHeader lang="CKB" />
                <Input
                  placeholder={NS.form.name}
                  value={partnerForm.nameCkb}
                  onChange={(e) => setPartnerForm((p) => ({ ...p, nameCkb: e.target.value }))}
                />
                <Textarea
                  rows={4}
                  placeholder={NS.form.description}
                  value={partnerForm.descriptionCkb}
                  onChange={(e) =>
                    setPartnerForm((p) => ({ ...p, descriptionCkb: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-3">
                <BilingualSectionHeader lang="KMR" />
                <Input
                  placeholder={NS.form.name}
                  value={partnerForm.nameKmr}
                  onChange={(e) => setPartnerForm((p) => ({ ...p, nameKmr: e.target.value }))}
                />
                <Textarea
                  rows={4}
                  placeholder={NS.form.description}
                  value={partnerForm.descriptionKmr}
                  onChange={(e) =>
                    setPartnerForm((p) => ({ ...p, descriptionKmr: e.target.value }))
                  }
                />
              </div>
            </div>
            <Separator />
            <MediaCoverUpload
              label={NS.form.partner_logo}
              previewUrl={partnerForm.logoUrl.trim() || null}
              urlValue={partnerForm.logoUrl}
              aspectClass="aspect-square max-w-xs"
              onUrlChange={(v) => setPartnerForm((p) => ({ ...p, logoUrl: v }))}
            />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Input
                dir="ltr"
                placeholder={NS.form.partner_website}
                value={partnerForm.websiteUrl}
                onChange={(e) =>
                  setPartnerForm((p) => ({ ...p, websiteUrl: e.target.value }))
                }
              />
              <Input
                placeholder={NS.form.team_display_order}
                value={partnerForm.displayOrder}
                onChange={(e) =>
                  setPartnerForm((p) => ({ ...p, displayOrder: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPartnerDialogOpen(false)}>
              {NS.action.cancel}
            </Button>
            <Button
              type="button"
              disabled={createPartnerMut.isPending || updatePartnerMut.isPending}
              onClick={() => void savePartner()}
            >
              {NS.action.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FormProvider>
  )
}

