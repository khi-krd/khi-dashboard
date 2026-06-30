"use client"

import { CheckIcon } from "@heroicons/react/24/outline"
import { useFormContext } from "react-hook-form"

import { CompletionBar } from "@/components/about/completion-bar"
import { ContactStatusPill, contactStatusHelper } from "@/components/contact/contact-status-pill"
import { NS } from "@/components/contact/contact-strings"
import { ServiceActiveSwitch } from "@/components/services/service-active-switch"
import { Input } from "@/components/ui/input"
import {
  formatFullTimestampKu,
  formatRelativeTimeKu,
} from "@/lib/news-relative-time"
import {
  computeContactCompletion,
  type ContactFormValues,
} from "@/lib/validations/contact"
import { formatCkbDigits } from "@/lib/intl-ckb"
import { cn } from "@/lib/utils"
import type { ContactDto } from "@/types/contact"

const divider = "border-border/60 -mx-5 border-t"

export function ContactFormSidebar({
  mode,
  editDto,
}: {
  mode: "create" | "edit"
  editDto?: ContactDto
}) {
  const { watch, setValue, register } = useFormContext<ContactFormValues>()
  const active = watch("active")
  const contentLanguages = watch("contentLanguages")
  const values = watch()

  const ckbScore = computeContactCompletion(values, "CKB")
  const kmrScore = computeContactCompletion(values, "KMR")

  return (
    <aside className="border-border bg-card space-y-5 self-start rounded-xl border p-5 text-sm lg:sticky lg:top-20">
      <section>
        <h4 className="text-muted-foreground mb-2 text-[10px] font-medium tracking-wide uppercase">
          {NS.sidebar.visibility}
        </h4>
        <div className="flex items-center justify-between gap-2">
          <ServiceActiveSwitch
            checked={active}
            onCheckedChange={(v) => setValue("active", v, { shouldDirty: true })}
            showLabel={false}
          />
          <ContactStatusPill active={active} />
        </div>
        <p className="text-muted-foreground mt-2 text-xs">
          {contactStatusHelper(active)}
        </p>
      </section>

      <div className={divider} />

      <section>
        <h4 className="text-muted-foreground mb-2 text-[10px] font-medium tracking-wide uppercase">
          {NS.sidebar.contact_info}
        </h4>
        <div className="space-y-3">
          <label className="block">
            <span className="text-muted-foreground mb-1 block text-xs">
              {NS.form.phone}
            </span>
            <Input {...register("phone")} className="h-9" dir="ltr" />
          </label>
          <label className="block">
            <span className="text-muted-foreground mb-1 block text-xs">
              {NS.form.secondary_phone}
            </span>
            <Input {...register("secondaryPhone")} className="h-9" dir="ltr" />
          </label>
          <label className="block">
            <span className="text-muted-foreground mb-1 block text-xs">
              {NS.form.email}
            </span>
            <Input
              type="email"
              {...register("email")}
              className="h-9"
              dir="ltr"
            />
          </label>
          <label className="block">
            <span className="text-muted-foreground mb-1 block text-xs">
              {NS.form.map_embed_url}
            </span>
            <Input {...register("mapEmbedUrl")} className="h-9 text-xs" dir="ltr" />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-muted-foreground mb-1 block text-xs">
                {NS.form.latitude}
              </span>
              <Input
                type="number"
                step="any"
                {...register("latitude", { valueAsNumber: true })}
                className="h-9 font-mono text-xs"
                dir="ltr"
              />
            </label>
            <label className="block">
              <span className="text-muted-foreground mb-1 block text-xs">
                {NS.form.longitude}
              </span>
              <Input
                type="number"
                step="any"
                {...register("longitude", { valueAsNumber: true })}
                className="h-9 font-mono text-xs"
                dir="ltr"
              />
            </label>
          </div>
        </div>
      </section>

      <div className={divider} />

      <section>
        <h4 className="text-muted-foreground mb-2 text-[10px] font-medium tracking-wide uppercase">
          {NS.sidebar.completion}
        </h4>
        <div className="space-y-3">
          {contentLanguages.includes("CKB") ? (
            <CompletionBar lang="ckb" score={ckbScore} />
          ) : null}
          {contentLanguages.includes("KMR") ? (
            <CompletionBar lang="kmr" score={kmrScore} />
          ) : null}
        </div>
        <p className="text-muted-foreground mt-2.5 text-[11px] leading-relaxed">
          {NS.sidebar.completion_hint}
        </p>
      </section>

      <div className={divider} />

      <section>
        <h4 className="text-muted-foreground mb-2 text-[10px] font-medium tracking-wide uppercase">
          {NS.sidebar.languages}
        </h4>
        <div className="flex gap-1.5">
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
                  "inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-xs transition-colors",
                  on
                    ? lang === "CKB"
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400"
                    : "border-border bg-muted/30 text-muted-foreground",
                )}
              >
                <CheckIcon className={cn("size-3", !on && "opacity-30")} />
                {lang === "CKB" ? NS.lang.ckb : NS.lang.kmr}
              </button>
            )
          })}
        </div>
      </section>

      {mode === "edit" && editDto?.id ? (
        <>
          <div className={divider} />
          <section>
            <h4 className="text-muted-foreground mb-2 text-[10px] font-medium tracking-wide uppercase">
              {NS.sidebar.system}
            </h4>
            <dl className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{NS.sidebar.id}</dt>
                <dd className="font-mono">#{formatCkbDigits(editDto.id)}</dd>
              </div>
              {editDto.createdAt ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">{NS.sidebar.created}</dt>
                  <dd className="font-mono text-end">
                    {formatRelativeTimeKu(editDto.createdAt)}
                  </dd>
                </div>
              ) : null}
              {editDto.updatedAt ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">{NS.sidebar.updated}</dt>
                  <dd
                    className="font-mono text-end"
                    title={formatFullTimestampKu(editDto.updatedAt)}
                  >
                    {formatRelativeTimeKu(editDto.updatedAt)}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>
        </>
      ) : null}
    </aside>
  )
}
