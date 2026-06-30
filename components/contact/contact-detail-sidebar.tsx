"use client"

import { CompletionBar } from "@/components/about/completion-bar"
import { SlugChip } from "@/components/about/slug-chip"
import { ContactStatusPill } from "@/components/contact/contact-status-pill"
import { NS } from "@/components/contact/contact-strings"
import { computeContactCompletion } from "@/lib/validations/contact"
import { contactContentLanguages } from "@/types/contact-ui"
import type { ContactDto } from "@/types/contact"

const divider = "border-border/60 -mx-5 border-t"

export function ContactDetailSidebar({ contact }: { contact: ContactDto }) {
  const langs = contactContentLanguages(contact)
  const formLike = {
    titleCkb: contact.ckbContent?.title,
    titleKmr: contact.kmrContent?.title,
    addressCkb: contact.ckbContent?.address,
    addressKmr: contact.kmrContent?.address,
    workingHoursCkb: contact.ckbContent?.workingHours,
    workingHoursKmr: contact.kmrContent?.workingHours,
    descriptionCkb: contact.ckbContent?.description,
    descriptionKmr: contact.kmrContent?.description,
  }
  const ckbScore = computeContactCompletion(formLike, "CKB")
  const kmrScore = computeContactCompletion(formLike, "KMR")

  return (
    <aside className="border-border bg-card space-y-5 rounded-xl border p-5 text-sm lg:sticky lg:top-20 lg:self-start">
      <section>
        <h4 className="text-muted-foreground mb-2 text-[10px] font-medium tracking-wide uppercase">
          {NS.sidebar.visibility}
        </h4>
        <ContactStatusPill
          active={contact.active}
          className="w-full justify-center py-1.5"
          size="large"
        />
        <div className="mt-4 space-y-3">
          {langs.includes("CKB") ? (
            <CompletionBar lang="ckb" score={ckbScore} />
          ) : null}
          {langs.includes("KMR") ? (
            <CompletionBar lang="kmr" score={kmrScore} />
          ) : null}
        </div>
      </section>

      <div className={divider} />

      <section>
        <h4 className="text-muted-foreground mb-2 text-[10px] font-medium tracking-wide uppercase">
          {NS.form.slugs}
        </h4>
        <div className="space-y-1.5">
          <SlugChip lang="ckb" value={contact.slugCkb} />
          <SlugChip lang="kmr" value={contact.slugKmr} />
        </div>
      </section>

      <div className={divider} />

      <section>
        <h4 className="text-muted-foreground mb-2 text-[10px] font-medium tracking-wide uppercase">
          {NS.sidebar.contact_info}
        </h4>
        <dl className="space-y-2 text-xs">
          {contact.phone?.trim() ? (
            <div>
              <dt className="text-muted-foreground">{NS.detail.phone}</dt>
              <dd className="mt-0.5 font-mono" dir="ltr">
                {contact.phone}
              </dd>
            </div>
          ) : null}
          {contact.secondaryPhone?.trim() ? (
            <div>
              <dt className="text-muted-foreground">{NS.detail.secondary_phone}</dt>
              <dd className="mt-0.5 font-mono" dir="ltr">
                {contact.secondaryPhone}
              </dd>
            </div>
          ) : null}
          {contact.email?.trim() ? (
            <div>
              <dt className="text-muted-foreground">{NS.detail.email}</dt>
              <dd className="mt-0.5 font-mono" dir="ltr">
                {contact.email}
              </dd>
            </div>
          ) : null}
          {contact.latitude != null && contact.longitude != null ? (
            <div>
              <dt className="text-muted-foreground">{NS.form.latitude} / {NS.form.longitude}</dt>
              <dd className="mt-0.5 font-mono" dir="ltr">
                {contact.latitude}, {contact.longitude}
              </dd>
            </div>
          ) : null}
        </dl>
      </section>
    </aside>
  )
}
