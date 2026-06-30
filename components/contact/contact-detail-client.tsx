"use client"

import {
  ArrowRightIcon,
  CalendarIcon,
  EnvelopeIcon,
  LinkIcon,
  MapPinIcon,
  PencilIcon,
  PencilSquareIcon,
  PhoneIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import {
  ContactBreadcrumbBar,
  dashboardContactCrumbHref,
} from "@/components/contact/contact-breadcrumb"
import { ContactDeleteDialog } from "@/components/contact/contact-delete-dialog"
import { ContactDetailSidebar } from "@/components/contact/contact-detail-sidebar"
import { ContactErrorState } from "@/components/contact/contact-error-state"
import { ContactStatusPill } from "@/components/contact/contact-status-pill"
import { NS, truncateTitle } from "@/components/contact/contact-strings"
import { SlugChip } from "@/components/about/slug-chip"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  useContactDetailQuery,
  useDeleteContactMutation,
} from "@/hooks/useContact"
import { contactDisplayTitle } from "@/lib/contact-normalize"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { formatRelativeTimeKu } from "@/lib/news-relative-time"
import {
  isRichTextEmpty,
  sanitizeNewsBodyHtml,
} from "@/lib/sanitize-news-html"
import { cn } from "@/lib/utils"
import { contactContentLanguages } from "@/types/contact-ui"
import type { ContactDto, Language } from "@/types/contact"

export function ContactDetailClient({ contactId }: { contactId: number }) {
  const router = useRouter()
  const { data: contact, isLoading, isError, refetch } =
    useContactDetailQuery(contactId)
  const deleteMut = useDeleteContactMutation()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [activeLang, setActiveLang] = useState<Language>("CKB")

  if (isLoading) {
    return (
      <div dir="rtl" className="flex justify-center px-6 py-12">
        <div className="text-muted-foreground text-sm">بارکردن…</div>
      </div>
    )
  }
  if (isError) return <ContactErrorState onRetry={() => void refetch()} />
  if (!contact?.id) {
    return (
      <div dir="rtl" className="flex flex-col items-center py-20">
        <h1 className="text-lg font-medium">{NS.not_found.title}</h1>
        <Link
          href="/dashboard/contact"
          className={buttonVariants({ variant: "outline" })}
        >
          {NS.not_found.cta}
        </Link>
      </div>
    )
  }

  const langs = contactContentLanguages(contact)
  const bothLangs = langs.includes("CKB") && langs.includes("KMR")
  const titleCkb = contact.ckbContent?.title
  const titleKmr = contact.kmrContent?.title
  const subtitle =
    activeLang === "CKB"
      ? contact.ckbContent?.subtitle
      : contact.kmrContent?.subtitle
  const address =
    activeLang === "CKB"
      ? contact.ckbContent?.address
      : contact.kmrContent?.address
  const workingHours =
    activeLang === "CKB"
      ? contact.ckbContent?.workingHours
      : contact.kmrContent?.workingHours
  const description =
    activeLang === "CKB"
      ? contact.ckbContent?.description
      : contact.kmrContent?.description

  return (
    <div dir="rtl" className="mx-auto max-w-[1280px] px-6">
      <nav className="border-border bg-background/95 supports-backdrop-filter:backdrop-blur sticky top-0 z-20 -mx-6 flex items-center justify-between border-b px-6 py-3">
        <ContactBreadcrumbBar
          segments={[
            { label: NS.breadcrumb.dashboard, href: dashboardContactCrumbHref() },
            { label: NS.breadcrumb.contact, href: "/dashboard/contact" },
            {
              label: truncateTitle(contactDisplayTitle(contact) || `#${contact.id}`, 40),
            },
          ]}
        />
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/contact"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <ArrowRightIcon className="me-1 size-4 rtl:rotate-180" />
            {NS.action.back}
          </Link>
          <Link
            href={`/dashboard/contact/${contact.id}/edit`}
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            <PencilSquareIcon className="me-1 size-4" />
            {NS.action.edit}
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteOpen(true)}
          >
            <TrashIcon className="me-1 size-4" />
            {NS.action.delete}
          </Button>
        </div>
      </nav>

      <div className="grid grid-cols-1 gap-8 py-8 lg:grid-cols-[340px_minmax(0,1fr)]">
        <ContactDetailSidebar contact={contact} />

        <article className="min-w-0">
          <div>
            <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
              <ContactStatusPill active={contact.active} />
              <span>·</span>
              <span className="font-mono">#{formatCkbDigits(contact.id)}</span>
              {contact.createdAt ? (
                <>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarIcon className="size-3.5" />
                    {formatRelativeTimeKu(contact.createdAt)}
                  </span>
                </>
              ) : null}
              {contact.updatedAt ? (
                <>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <PencilIcon className="size-3.5" />
                    {formatRelativeTimeKu(contact.updatedAt)}
                  </span>
                </>
              ) : null}
            </div>

            <div className="text-muted-foreground mt-3 flex items-center gap-2 text-xs">
              <LinkIcon className="size-3.5" />
              <SlugChip lang="ckb" value={contact.slugCkb} />
              <SlugChip lang="kmr" value={contact.slugKmr} />
            </div>

            <h1 className="mt-5 text-4xl leading-tight font-bold tracking-tight md:text-5xl">
              {titleCkb}
            </h1>
            {titleKmr?.trim() ? (
              <h2 className="text-muted-foreground mt-2 text-xl leading-snug font-medium md:text-2xl">
                {titleKmr}
              </h2>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-4 text-sm">
              {contact.phone?.trim() ? (
                <a
                  href={`tel:${contact.phone}`}
                  className="text-muted-foreground inline-flex items-center gap-1.5 hover:text-foreground"
                  dir="ltr"
                >
                  <PhoneIcon className="size-4" />
                  {contact.phone}
                </a>
              ) : null}
              {contact.email?.trim() ? (
                <a
                  href={`mailto:${contact.email}`}
                  className="text-muted-foreground inline-flex items-center gap-1.5 hover:text-foreground"
                  dir="ltr"
                >
                  <EnvelopeIcon className="size-4" />
                  {contact.email}
                </a>
              ) : null}
            </div>

            {(subtitle?.trim() ||
              address?.trim() ||
              workingHours?.trim() ||
              !isRichTextEmpty(description)) && (
              <div className="mt-8">
                {bothLangs ? (
                  <div className="mb-4 flex gap-2">
                    {(["CKB", "KMR"] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => setActiveLang(lang)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                          activeLang === lang
                            ? lang === "CKB"
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400"
                            : "border-border text-muted-foreground",
                        )}
                      >
                        {lang === "CKB" ? NS.lang.ckb : NS.lang.kmr}
                      </button>
                    ))}
                  </div>
                ) : null}

                {subtitle?.trim() ? (
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {subtitle}
                  </p>
                ) : null}

                {address?.trim() ? (
                  <div className="mt-4 flex items-start gap-2 text-sm">
                    <MapPinIcon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                    <span>{address}</span>
                  </div>
                ) : null}

                {workingHours?.trim() ? (
                  <div className="text-muted-foreground mt-2 text-sm">
                    {NS.detail.working_hours}: {workingHours}
                  </div>
                ) : null}

                {!isRichTextEmpty(description) ? (
                  <section className="border-border/60 mt-8 border-t pt-6">
                    <h3 className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
                      {NS.detail.description}
                    </h3>
                    <div
                      className="prose prose-neutral dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeNewsBodyHtml(description ?? ""),
                      }}
                    />
                  </section>
                ) : null}
              </div>
            )}

            {contact.mapEmbedUrl?.trim() ? (
              <section className="border-border/60 mt-10 border-t pt-8">
                <h3 className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
                  {NS.detail.map}
                </h3>
                <div className="border-border aspect-video overflow-hidden rounded-lg border">
                  <iframe
                    src={contact.mapEmbedUrl}
                    title={NS.detail.map}
                    className="size-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </section>
            ) : null}
          </div>
        </article>
      </div>

      <ContactDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        target={contact}
        isPending={deleteMut.isPending}
        onConfirm={async () => {
          if (!contact.id) return
          try {
            await deleteMut.mutateAsync(contact.id)
            toast.success(NS.toast.deleted)
            router.push("/dashboard/contact")
          } catch {
            toast.error(NS.error.validation)
          }
        }}
      />
    </div>
  )
}
